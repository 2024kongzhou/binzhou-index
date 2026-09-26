#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
甲骨文云 AI 智能运维中枢 v4
- 商汤 AI (deepseek-v4-flash)
- PushPlus 微信推送
- 滨州新闻爬虫（齐鲁网滨州 + 滨州网）
- keyi.de5.net 网站集成（读取数据 + 发布草稿文章）
- 安全监控（SSH 日志分析 + 网站可用性 + 资源监控）
"""

import json
import asyncio
import hmac
from collections import deque
import base64
import io
import logging
import os
import re
import sys
import time
import uuid
import threading
from urllib.parse import quote
from datetime import datetime, timedelta, timezone
from contextlib import asynccontextmanager

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Request
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

import httpx
from openai import OpenAI

from config import (
    SENSENOVA_API_KEY, SENSENOVA_BASE_URL, SENSENOVA_MODEL,
    PUSHPLUS_TOKEN, API_KEY,
    IMAGE_SERVER_URL, IMAGE_SERVER_TOKEN,
    SITE_BASE_URL, SITE_ADMIN_EMAIL, SITE_ADMIN_PASSWORD,
    APP_HOST, APP_PORT, LOG_LEVEL,
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(BASE_DIR), "data")
os.makedirs(DATA_DIR, exist_ok=True)

STATE_FILE = os.path.join(DATA_DIR, "crawler_state.json")
NEWS_FILE = os.path.join(DATA_DIR, "news.json")
SECURITY_FILE = os.path.join(DATA_DIR, "security_report.json")

BEIJING = timezone(timedelta(hours=8))

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(os.path.join(DATA_DIR, '..', 'logs', 'ai-hub.log')),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

scheduler = BackgroundScheduler(timezone=timezone.utc)
ai_client = None
site_client = None

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"


def now_bj():
    return datetime.now(BEIJING)


def bj_str(fmt="%Y-%m-%d %H:%M"):
    return now_bj().strftime(fmt)


# ==================== 工具函数 ====================

def load_json(path, default):
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def save_json(path, data):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


def call_sensenova(prompt, system_prompt="", max_tokens=1500):
    if not ai_client:
        raise RuntimeError("AI service is not configured")
    try:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})
        last_err = None
        for attempt in range(3):
            try:
                resp = ai_client.chat.completions.create(
                    model=SENSENOVA_MODEL, messages=messages,
                    max_tokens=max_tokens, temperature=0.6,
                )
                return resp.choices[0].message.content.strip()
            except Exception as e:
                last_err = e
                if "429" in str(e) and attempt < 2:
                    wait = 20 * (attempt + 1)
                    logger.warning(f"[商汤AI] 429 限流，{wait}s 后重试 ({attempt + 1}/3)")
                    time.sleep(wait)
                else:
                    break
        raise last_err
    except Exception as e:
        logger.error("[商汤AI] 调用失败: %s", type(e).__name__)
        raise RuntimeError("AI upstream request failed") from None


def pushplus(title, content):
    if not PUSHPLUS_TOKEN:
        return False
    try:
        r = httpx.post(
            "https://www.pushplus.plus/send",
            json={"token": PUSHPLUS_TOKEN, "title": title,
                  "content": content, "template": "html"},
            timeout=15,
        )
        ok = r.json().get("code") == 200
        logger.info(f"[PushPlus] {'发送成功' if ok else r.text[:200]}")
        return ok
    except Exception as e:
        logger.error(f"[PushPlus] 异常: {e}")
        return False


# ==================== 新闻爬虫 ====================

class NewsCrawler:
    def __init__(self):
        self.client = httpx.Client(
            timeout=httpx.Timeout(20.0, connect=10.0),
            headers={"User-Agent": UA, "Accept-Language": "zh-CN,zh;q=0.9"},
            follow_redirects=True,
        )

    def fetch_iqilu(self):
        items = []
        try:
            r = self.client.get("https://binzhou.iqilu.com/bzyaowen/")
            r.raise_for_status()
            for m in re.finditer(
                r'<a[^>]+href="(https?://binzhou\.iqilu\.com/bzyaowen/(\d{4})/(\d{4})/(\d+)\.shtml)"[^>]*>\s*([^<]{8,90})\s*</a>',
                r.text,
            ):
                url, y, md, aid, title = m.groups()
                title = title.strip()
                if not title or "javascript" in url:
                    continue
                date = f"{y}-{md[:2]}-{md[2:]}"
                items.append({
                    "title": title, "url": url, "date": date,
                    "source": "齐鲁网滨州", "aid": aid,
                })
        except Exception as e:
            logger.error(f"[爬虫] 齐鲁网抓取失败: {e}")
        return items

    def fetch_binzhouw(self):
        items = []
        try:
            r = self.client.get("https://www.binzhouw.com/", timeout=25)
            r.raise_for_status()
            for m in re.finditer(
                r'<a[^>]+href="(https?://www\.binzhouw\.com/nusDetail/([0-9a-f]{32})\?[^"]*)"[^>]*>\s*([^<]{8,90})\s*</a>',
                r.text,
            ):
                url, nid, title = m.groups()
                title = title.strip()
                if not title:
                    continue
                date = ""
                t = re.search(r't=([^&"]+)', url)
                if t:
                    try:
                        import base64
                        date = base64.b64decode(t.group(1) + "==").decode()[:10]
                    except Exception:
                        pass
                items.append({
                    "title": title, "url": url, "date": date,
                    "source": "滨州网", "aid": nid[:12],
                })
        except Exception as e:
            logger.error(f"[爬虫] 滨州网抓取失败: {e}")
        return items

    def fetch_article(self, url):
        try:
            r = self.client.get(url, timeout=25)
            r.raise_for_status()
            html = re.sub(r'<(script|style)[\s\S]*?</\1>', '', r.text, flags=re.I)
            paras = []
            for p in re.findall(r'<p[^>]*>([\s\S]*?)</p>', html, flags=re.I):
                t = re.sub(r'<[^>]+>', '', p)
                t = re.sub(r'\s+', ' ', t).strip()
                if len(t) >= 30:
                    paras.append(t)
            body = "\n\n".join(paras)
            if len(body) < 100:
                div = re.sub(r'<[^>]+>', ' ', html)
                div = re.sub(r'\s+', ' ', div)
                body = div[:3000]
            return body[:9000]
        except Exception as e:
            logger.error(f"[爬虫] 正文抓取失败 {url}: {e}")
            return ""


crawler = NewsCrawler()


# ==================== keyi.de5.net 网站客户端 ====================

class SiteClient:
    def __init__(self):
        self.http = httpx.Client(timeout=20, base_url=SITE_BASE_URL)
        self.token = None
        self.token_exp = 0
        self.lock = threading.Lock()

    def login(self):
        r = self.http.post("/api/auth/login", json={
            "email": SITE_ADMIN_EMAIL, "password": SITE_ADMIN_PASSWORD,
        })
        r.raise_for_status()
        cookie = r.headers.get("set-cookie", "")
        m = re.search(r'token=([^;]+)', cookie)
        if not m:
            raise RuntimeError("登录响应中无 token")
        self.token = m.group(1)
        self.token_exp = time.time() + 6 * 86400
        logger.info("[网站] 管理员登录成功")

    def _auth_headers(self):
        with self.lock:
            if not self.token or time.time() > self.token_exp:
                self.login()
            return {"Cookie": f"token={self.token}"}

    def get_posts(self, status="published"):
        posts = []
        for offset in range(0, 100001, 100):
            r = self.http.get("/api/posts", params={"status": status, "limit": 100, "offset": offset},
                              headers=self._auth_headers() if status != "published" else {})
            r.raise_for_status()
            page = r.json().get("posts", [])
            posts.extend(page)
            if len(page) < 100:
                return posts
        raise RuntimeError("Post archive exceeds safe pagination limit")

    def get_products(self):
        r = self.http.get("/api/products")
        r.raise_for_status()
        data = r.json()
        return data.get("products", data.get("data", []))

    def create_post(self, title, slug, content, excerpt="", status="draft", coverImage="", aiGenerated=False):
        body = {"title": title, "slug": slug, "content": content,
                "excerpt": excerpt, "status": status, "coverImage": coverImage, "aiGenerated": aiGenerated}
        r = self.http.post("/api/posts", json=body, headers=self._auth_headers())
        if r.status_code >= 400:
            return {"error": r.text[:300], "status_code": r.status_code}
        return r.json().get("post", {})

    def update_post(self, slug, title=None, content=None, excerpt=None, status=None, coverImage=None, aiGenerated=None):
        body = {}
        if title is not None:
            body["title"] = title
        if content is not None:
            body["content"] = content
        if excerpt is not None:
            body["excerpt"] = excerpt
        if status is not None:
            body["status"] = status
        if coverImage is not None:
            body["coverImage"] = coverImage
        if aiGenerated is not None:
            body["aiGenerated"] = aiGenerated
        r = self.http.put(f"/api/posts/{slug}/", json=body, headers=self._auth_headers())
        if r.status_code >= 400:
            return {"error": r.text[:300], "status_code": r.status_code}
        return r.json().get("post", {})


# ==================== 定时任务 ====================

def crawl_news():
    logger.info("[新闻爬虫] 开始采集")
    state = load_json(STATE_FILE, {"seen": {}})
    seen = state["seen"]

    items = crawler.fetch_iqilu()
    items += crawler.fetch_binzhouw()
    logger.info(f"[新闻爬虫] 列表共 {len(items)} 条，已见 {len(seen)} 条")

    fresh = []
    for it in items:
        if it["url"] not in seen:
            fresh.append(it)

    if not fresh:
        logger.info("[新闻爬虫] 无新文章")
        pushplus("滨州新闻监控", f"{bj_str()} 暂无新文章（监测 {len(items)} 条）")
        return {"new": 0, "monitored": len(items)}

    fresh = fresh[:5]
    results = []
    for it in fresh[:3]:
        body = crawler.fetch_article(it["url"])
        summary = ""
        if body:
            summary = call_sensenova(
                f"用80字以内总结这条滨州新闻的要点：\n标题：{it['title']}\n正文：{body[:2500]}",
                "你是新闻编辑，输出纯文本摘要，不要标题和格式符号。",
                max_tokens=200,
            )
        it2 = dict(it)
        it2["summary"] = summary
        it2["content"] = body
        it2["crawledAt"] = bj_str()
        results.append(it2)
        seen[it["url"]] = bj_str("%Y-%m-%d")
        time.sleep(1)

    for it in fresh[3:]:
        seen[it["url"]] = bj_str("%Y-%m-%d")

    cutoff = (now_bj() - timedelta(days=14)).strftime("%Y-%m-%d")
    state["seen"] = {u: d for u, d in seen.items() if d >= cutoff}
    save_json(STATE_FILE, state)

    news = load_json(NEWS_FILE, [])
    news = results + news
    save_json(NEWS_FILE, news[:50])

    published = None
    if results and results[0]["content"]:
        top = results[0]
        slug = f"news-{top.get('aid') or int(time.time())}"
        try:
            post = site_client.create_post(
                title=top["title"], slug=slug,
                content=top["content"][:8000],
                excerpt=(top["summary"] or top["title"])[:120],
                status="draft",
            )
            published = {"title": top["title"], "slug": slug,
                         "ok": "error" not in post}
            logger.info(f"[新闻爬虫] 网站草稿发布: {published}")
        except Exception as e:
            logger.error(f"[新闻爬虫] 网站发布失败: {e}")

    lines = [f"<b>采集时间:</b> {bj_str()}", f"<b>新增:</b> {len(results)} 条<br>"]
    for i, it in enumerate(results, 1):
        lines.append(f"<b>{i}. {it['title']}</b><br>")
        if it["summary"]:
            lines.append(f"{it['summary']}<br>")
        lines.append(f"<small>来源: {it['source']} {it.get('date', '')}</small><br><br>")
    if published:
        state_txt = "已推送至网站草稿箱" if published["ok"] else "网站发布失败"
        lines.append(f"<b>首发文章:</b> {state_txt}")
    pushplus("滨州新闻速递", "\n".join(lines))
    return {"new": len(results), "published": published}


def read_ssh_failures(minutes=20):
    fails = 0
    attackers = {}
    cutoff = datetime.now(timezone.utc) - timedelta(minutes=minutes)
    try:
        with open("/var/log/auth.log", "r", errors="ignore") as f:
            lines = list(deque(f, maxlen=3000))
        for line in lines:
            if "Failed password" not in line and "Invalid user" not in line:
                continue
            try:
                if re.match(r"^\d{4}-\d{2}-\d{2}T", line):
                    ts = datetime.fromisoformat(line.split()[0])
                else:
                    ts = datetime.strptime(line[:15], "%b %d %H:%M:%S").replace(year=datetime.now().year).astimezone()
                ts = ts.astimezone(timezone.utc)
                if ts < cutoff:
                    continue
            except ValueError:
                continue
            fails += 1
            m = re.search(r"from (\d+\.\d+\.\d+\.\d+)", line)
            if m:
                attackers[m.group(1)] = attackers.get(m.group(1), 0) + 1
    except PermissionError:
        return None, {}
    except FileNotFoundError:
        return 0, {}
    return fails, attackers


def system_stats():
    mem = {}
    try:
        with open("/proc/meminfo") as f:
            for line in f:
                k, v = line.split(":")
                mem[k] = int(v.strip().split()[0])
        total = mem["MemTotal"]; avail = mem.get("MemAvailable", 0)
        swap_total = mem.get("SwapTotal", 0); swap_free = mem.get("SwapFree", 0)
    except Exception:
        total, avail, swap_total, swap_free = 1, 1, 1, 1
    disk_use = ""
    try:
        u = os.statvfs("/")
        pct = 100 * (u.f_blocks - u.f_bfree) / u.f_blocks
        disk_use = f"{pct:.0f}%"
    except Exception:
        pass
    return {
        "mem_used_mb": round((total - avail) / 1024),
        "mem_total_mb": round(total / 1024),
        "mem_pct": round(100 * (total - avail) / total),
        "swap_used_mb": round((swap_total - swap_free) / 1024),
        "swap_total_mb": round(swap_total / 1024),
        "disk_pct": disk_use,
    }


def security_monitor():
    logger.info("[安全监控] 开始检查")
    fails, attackers = read_ssh_failures(20)

    site_ok, site_ms = True, -1
    try:
        t0 = time.time()
        r = httpx.get(SITE_BASE_URL, timeout=12, follow_redirects=True)
        site_ms = int((time.time() - t0) * 1000)
        site_ok = r.status_code == 200
    except Exception:
        site_ok = False

    hub_ok = True
    try:
        httpx.get(f"http://127.0.0.1:{APP_PORT}/health", timeout=8)
    except Exception:
        hub_ok = False

    stats = system_stats()
    top_attackers = sorted(attackers.items(), key=lambda x: -x[1])[:5]

    report = {
        "time": bj_str(),
        "ssh_failures_20min": fails,
        "top_attackers": top_attackers,
        "site_ok": site_ok,
        "site_latency_ms": site_ms,
        "ai_hub_ok": hub_ok,
        "system": stats,
    }
    save_json(SECURITY_FILE, report)

    alerts = []
    if not site_ok:
        alerts.append(f"网站 {SITE_BASE_URL} 不可达！")
    if site_ok and site_ms > 5000:
        alerts.append(f"网站响应过慢: {site_ms}ms")
    if not hub_ok:
        alerts.append("AI 中枢健康检查失败！")
    if fails and fails >= 10:
        alerts.append(f"SSH 暴力破解尝试 {fails} 次（20分钟内）")
    if stats["mem_pct"] >= 90:
        alerts.append(f"内存使用率 {stats['mem_pct']}% 过高")

    if alerts:
        content = "<br>".join(alerts)
        if top_attackers:
            content += "<br><br><b>Top 攻击源:</b><br>" + "<br>".join(
                f"{ip}: {n} 次" for ip, n in top_attackers)
        content += f"<br><br><small>{bj_str()}</small>"
        pushplus("安全告警", content)
        logger.warning(f"[安全监控] 告警: {alerts}")
    else:
        logger.info(f"[安全监控] 正常 | SSH失败:{fails} 网站:{site_ms}ms 内存:{stats['mem_pct']}%")
    return report


def daily_report():
    logger.info("[日报] 生成每日运维报告")
    stats = system_stats()
    sec = load_json(SECURITY_FILE, {})
    news = load_json(NEWS_FILE, [])
    site_posts = []
    site_ok = True
    try:
        site_posts = site_client.get_posts("published")
    except Exception:
        site_ok = False

    news_today = [n for n in news if n.get("crawledAt", "").startswith(now_bj().strftime("%Y-%m-%d"))]

    prompt = (
        "根据以下数据生成一份简短的服务器运维日报（150字以内，纯文本），"
        "要点出风险项，语气专业简洁：\n"
        f"日期: {bj_str()}\n"
        f"内存: {stats['mem_used_mb']}/{stats['mem_total_mb']}MB ({stats['mem_pct']}%), "
        f"Swap: {stats['swap_used_mb']}/{stats['swap_total_mb']}MB, 磁盘: {stats['disk_pct']}\n"
        f"SSH失败次数(20min): {sec.get('ssh_failures_20min', 'N/A')}\n"
        f"网站可用: {sec.get('site_ok', 'N/A')}, 延迟: {sec.get('site_latency_ms', 'N/A')}ms\n"
        f"今日采集新闻: {len(news_today)} 条\n"
        f"网站已发布文章: {len(site_posts)} 篇\n"
    )
    ai_text = call_sensenova(prompt, "你是资深运维工程师，输出精炼的中文日报。", max_tokens=400)

    html = (
        f"<b>{now_bj().strftime('%Y-%m-%d')} 每日运维报告</b><br><br>"
        f"{ai_text}<br><br>"
        f"<b>系统:</b> 内存 {stats['mem_used_mb']}/{stats['mem_total_mb']}MB ({stats['mem_pct']}%) | "
        f"Swap {stats['swap_used_mb']}/{stats['swap_total_mb']}MB | 磁盘 {stats['disk_pct']}<br>"
        f"<b>网站:</b> {'正常' if site_ok else '异常'} | 已发布文章 {len(site_posts)} 篇<br>"
        f"<b>新闻:</b> 今日采集 {len(news_today)} 条，累计缓存 {len(news)} 条<br>"
        f"<b>安全:</b> SSH失败 {sec.get('ssh_failures_20min', 'N/A')} 次(20min窗口)"
    )
    pushplus("每日运维报告", html)
    return {"generated": bj_str(), "ai": ai_text}


def blog_ai_assistant():
    logger.info("[AI助手] 生成博客选题")
    news = load_json(NEWS_FILE, [])
    recent_titles = "\n".join(n["title"] for n in news[:8])
    topics = call_sensenova(
        f"基于近期滨州新闻热点，为滨州本地门户生成3个博客选题，"
        f"每个含标题和40字简介：\n{recent_titles}",
        "你是内容策划专家。", max_tokens=600,
    )
    save_json(os.path.join(DATA_DIR, "blog_topics.json"),
              {"generated": bj_str(), "topics": topics})
    return {"topics": topics}


# ==================== 图片与每日文章 ====================

def upload_image_to_oracle(image_bytes: bytes, mime: str = "image/png"):
    """上传图片到 Oracle 图片服务器，返回 website 可用路径 /api/img/<filename>"""
    import mimetypes
    ext = mimetypes.guess_extension(mime) or ".png"
    boundary = f"----WebKitFormBoundary{uuid.uuid4().hex}"
    filename = f"cover-{int(time.time())}{ext}"
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="{filename}"\r\n'
        f"Content-Type: {mime}\r\n\r\n"
    ).encode("utf-8") + image_bytes + f"\r\n--{boundary}--\r\n".encode("utf-8")
    headers = {
        "Authorization": f"Bearer {IMAGE_SERVER_TOKEN}",
        "Content-Type": f"multipart/form-data; boundary={boundary}",
        "Content-Length": str(len(body)),
    }
    r = httpx.post(f"{IMAGE_SERVER_URL}/upload", headers=headers, content=body, timeout=30)
    r.raise_for_status()
    data = r.json()
    return f"/api/img/{data['filename']}"


def generate_cover_image(prompt: str):
    """使用 Pollinations.ai 免费生成封面图"""
    safe_prompt = quote(prompt[:500])
    width, height = 1024, 576
    mime = "image/png"
    last_err = None
    for attempt in range(3):
        seed = (int(time.time()) + attempt * 7) % 100000
        url = f"https://image.pollinations.ai/prompt/{safe_prompt}?width={width}&height={height}&seed={seed}&nologo=true"
        try:
            r = httpx.get(url, timeout=120, follow_redirects=True)
            r.raise_for_status()
            mime = r.headers.get("Content-Type", "image/png")
            return r.content, mime
        except Exception as e:
            last_err = e
            logger.warning(f"[封面图] Pollinations 请求失败 (attempt {attempt+1}/3): {e}")
            time.sleep(2 ** attempt)
    raise last_err


def daily_article():
    from editorial import run
    return run(sys.modules[__name__])


# ==================== FastAPI ====================

def require_key(request: Request):
    key = request.headers.get("X-API-Key", "")
    if not API_KEY or not hmac.compare_digest(key, API_KEY):
        raise HTTPException(status_code=401, detail="无效的 API Key")


@asynccontextmanager
async def lifespan(app: FastAPI):
    global ai_client, site_client
    logger.info("AI 中枢 v4 启动中...")

    if SENSENOVA_API_KEY:
        ai_client = OpenAI(api_key=SENSENOVA_API_KEY, base_url=SENSENOVA_BASE_URL)
    site_client = SiteClient()

    scheduler.add_job(security_monitor, IntervalTrigger(hours=2),
                      id="security", name="安全监控", max_instances=1, coalesce=True)
    scheduler.add_job(daily_article, CronTrigger(hour=0, minute=30, timezone=BEIJING),
                      id="daily_article", name="每日文章", max_instances=1, coalesce=True)
    scheduler.add_job(daily_report, CronTrigger(hour=0, minute=0, timezone=timezone.utc),
                      id="daily", name="每日报告", max_instances=1, coalesce=True)
    scheduler.start()

    # No automatic publication on process restart.

    logger.info("AI 中枢 v4 启动完成")
    yield
    scheduler.shutdown(wait=False)


app = FastAPI(title="AI 运维中枢", version="4.0.0", lifespan=lifespan)


@app.get("/")
async def root():
    return {
        "service": "AI 运维中枢", "version": "4.0.0",
        "time": bj_str(),
        "ai": SENSENOVA_MODEL,
        "site": SITE_BASE_URL,
        "jobs": [
            {"id": j.id, "next_run": j.next_run_time.astimezone(BEIJING).strftime("%m-%d %H:%M") if j.next_run_time else None}
            for j in scheduler.get_jobs()
        ],
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "scheduler": scheduler.running}


@app.get("/news/latest")
async def news_latest(limit: int = 10):
    news = load_json(NEWS_FILE, [])
    out = []
    for n in news[:limit]:
        out.append({k: n.get(k) for k in ("title", "url", "date", "source", "summary", "crawledAt")})
    return {"count": len(out), "news": out}


@app.get("/site/posts")
async def site_posts(request: Request, status: str = "published"):
    if status != "published":
        require_key(request)
    try:
        posts = site_client.get_posts(status)
        return {"count": len(posts), "posts": [
            {"id": p.get("id"), "title": p.get("title"), "slug": p.get("slug"),
             "status": p.get("status"), "createdAt": p.get("createdAt")}
            for p in posts]}
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))


@app.post("/ai/generate")
async def ai_generate(request: Request, prompt: str, system: str = "", max_tokens: int = 1500):
    require_key(request)
    if not prompt.strip() or len(prompt) > 5000 or not 100 <= max_tokens <= 2500:
        raise HTTPException(status_code=400, detail="Invalid generation parameters")
    try:
        result = await asyncio.to_thread(call_sensenova, prompt, system, max_tokens)
    except RuntimeError:
        raise HTTPException(status_code=502, detail="AI upstream unavailable") from None
    return {"result": result}


@app.post("/trigger/{task}")
async def trigger(task: str, request: Request):
    require_key(request)
    tasks = {"crawl": crawl_news, "security": security_monitor,
             "report": daily_report, "blog": blog_ai_assistant,
             "daily_article": daily_article}
    if task not in tasks:
        raise HTTPException(status_code=404, detail=f"未知任务 {task}")
    import asyncio
    return await asyncio.to_thread(tasks[task])


@app.post("/site/publish")
async def site_publish(request: Request):
    require_key(request)
    body = await request.json()
    title = body.get("title")
    content = body.get("content", "")
    if not title or not content:
        raise HTTPException(status_code=400, detail="缺少 title 或 content")
    slug = body.get("slug") or f"post-{int(time.time())}"
    post = site_client.create_post(title, slug, content,
                                   body.get("excerpt", ""), body.get("status", "draft"))
    return {"post": post}


@app.post("/notify/pushplus")
async def notify(request: Request, title: str, content: str):
    require_key(request)
    return {"sent": pushplus(title, content)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=APP_HOST, port=APP_PORT)
