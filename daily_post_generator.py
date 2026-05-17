#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
滨州索引 - 每日推文自动生成脚本（本地运行版）
用法: python3 daily_post_generator.py
定时: crontab -e 添加 0 8 * * * cd /path && python3 daily_post_generator.py >> /var/log/posts.log 2>&1
"""

import os, sys, json, random, smtplib, base64, requests, re, subprocess
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# 从环境变量读取配置，不在代码中硬编码任何密钥
CONFIG = {
    "gemini_api_key": os.getenv("GEMINI_API_KEY", ""),
    "groq_api_key": os.getenv("GROQ_API_KEY", ""),
    "pexels_api_key": os.getenv("PEXELS_API_KEY", ""),
    "imgbb_api_key": os.getenv("IMGBB_API_KEY", ""),
    "gmail_user": os.getenv("GMAIL_USER", ""),
    "gmail_password": os.getenv("GMAIL_PASSWORD", ""),
    "notify_email": os.getenv("NOTIFY_EMAIL", ""),
    "blog_url": "https://keyi.de5.net",
    "author": "滨州索引",
}

class ContentGenerator:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
    def generate_curtain_post(self):
        today = datetime.now()
        season = ["春季","夏季","秋季","冬季"][(today.month-1)//3]
        topics = [
            "窗帘选购指南（按季节/房间/风格推荐）",
            "窗帘搭配技巧（颜色/材质/风格搭配）",
            "窗帘清洗保养知识（不同材质清洗方法）",
            "滨州本地客户案例分享（真实安装效果）",
            "窗帘流行趋势解读（2026年最新趋势）",
            "窗帘与采光的关系（如何根据朝向选择）",
            "不同房间窗帘选择建议（客厅/卧室/书房/儿童房）",
            "窗帘轨道vs罗马杆如何选择",
            "遮光窗帘选购指南（全遮光/半遮光/透光）",
            "窗帘褶皱倍数怎么选（1.5倍/2倍/2.5倍）",
            "窗帘颜色搭配黄金法则",
            "雪纺纱帘vs绒布窗帘如何选择",
            "窗帘安装注意事项（测量/打孔/安装步骤）",
            "窗帘如何提升家居档次",
            "小户型窗帘选择技巧",
        ]
        prompt = f"""你是滨州一家高端软装窗帘店的资深营销专家。请撰写一篇推文。

日期：{today.strftime('%Y年%m月%d日')} 季节：{season} 城市：滨州
本期主题：{random.choice(topics)}

要求：
1. 标题：15-25字，含emoji，突出窗帘/软装/滨州元素
2. 正文：800-1200字，4-6个小节，每节有##小标题
3. 内容实用干货，适合滨州本地客户
4. 结尾引导到店咨询，包含店铺优势
5. 标签：5-8个#标签

严格按JSON格式返回：
{{"title":"标题","subtitle":"副标题50字内","content":"正文用\\n\\n分段","tags":["#标签"],"image_keywords":"英文关键词3-5个逗号分隔","call_to_action":"结尾引导语"}}"""
        return self._call_ai(prompt)
    
    def generate_renovation_post(self):
        today = datetime.now()
        season = ["春季","夏季","秋季","冬季"][(today.month-1)//3]
        topics = [
            "装修避坑指南（新手必看的10个坑）",
            "空间收纳技巧（小户型变大术）",
            "色彩搭配原则（房间配色黄金法则）",
            "装修材料选购（如何不被坑）",
            "灯光设计建议（不同房间灯光方案）",
            "小户型改造方案（50平住出80平的感觉）",
            "装修预算规划（如何合理分配预算）",
            "环保装修知识（甲醛防护）",
            "旧房翻新技巧（老房改造注意事项）",
            "装修流程详解（从设计到入住）",
            "厨房装修注意事项",
            "卫生间装修避坑",
            "阳台改造方案",
            "儿童房装修指南",
            "装修验收标准",
        ]
        prompt = f"""你是资深室内设计师。请为滨州索引博客撰写装修知识推文。

日期：{today.strftime('%Y年%m月%d日')} 季节：{season} 城市：滨州
本期主题：{random.choice(topics)}

要求：
1. 标题：15-25字，含emoji，实用干货型
2. 正文：800-1200字，4-6个小节，##小标题
3. 通俗易懂，适合装修小白
4. 结尾引导关注滨州索引
5. 标签：5-8个#标签

严格按JSON格式返回：
{{"title":"标题","subtitle":"副标题50字内","content":"正文用\\n\\n分段","tags":["#标签"],"image_keywords":"英文关键词3-5个逗号分隔","call_to_action":"结尾引导语"}}"""
        return self._call_ai(prompt)
    
    def _call_ai(self, prompt):
        # 尝试Gemini
        try:
            r = requests.post(f"{self.base_url}?key={self.api_key}", 
                json={"contents":[{"parts":[{"text":prompt}]}],
                      "generationConfig":{"temperature":0.85,"maxOutputTokens":2048}},
                timeout=45)
            r.raise_for_status()
            text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
            return self._parse(text)
        except Exception as e:
            print(f"Gemini失败: {e}")
        # 降级到Groq
        try:
            r = requests.post("https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization":f"Bearer {CONFIG['groq_api_key']}","Content-Type":"application/json"},
                json={"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":prompt}],"temperature":0.85,"max_tokens":2048},
                timeout=45)
            r.raise_for_status()
            text = r.json()["choices"][0]["message"]["content"]
            return self._parse(text)
        except Exception as e:
            print(f"Groq也失败: {e}")
            return None
    
    def _parse(self, text):
        text = text.strip()
        for prefix in ["```json","```"]:
            if text.startswith(prefix): text = text[len(prefix):]
        if text.endswith("```"): text = text[:-3]
        return json.loads(text.strip())

class ImageHandler:
    def __init__(self, pexels_key, imgbb_key):
        self.pexels_key = pexels_key
        self.imgbb_key = imgbb_key
    
    def get_image(self, keywords, default="curtain interior design"):
        for q in [keywords, default, "home interior", "window treatment"]:
            try:
                r = requests.get("https://api.pexels.com/v1/search",
                    headers={"Authorization":self.pexels_key},
                    params={"query":q,"per_page":10,"orientation":"landscape"}, timeout=15)
                photos = r.json().get("photos",[])
                if photos:
                    photo = random.choice(photos)
                    img = requests.get(photo["src"]["large2x"], timeout=15).content
                    return self._upload(img, photo.get("alt",q))
            except: continue
        return None
    
    def _upload(self, data, title):
        try:
            r = requests.post("https://api.imgbb.com/1/upload",
                data={"key":self.imgbb_key,"image":base64.b64encode(data).decode(),"title":title,"expiration":0}, timeout=15)
            if r.json().get("success"): return r.json()["data"]["url"]
        except: pass
        return None

class MarkdownGenerator:
    @staticmethod
    def create(post, ptype, date, img, outdir):
        slug = re.sub(r'[^\w\u4e00-\u9fff-]', '', post['title'].replace(' ','-'))[:20]
        slug = f"{date}-{slug}"
        fp = os.path.join(outdir, f"{slug}.md")
        cat = "软装窗帘" if ptype=="curtain" else "装修知识"
        c = f"""---
title: "{post['title']}"
description: "{post.get('subtitle','')}"
category: "{cat}"
pubDate: {date}
author: "{CONFIG['author']}"
tags: {json.dumps(post.get('tags',[]), ensure_ascii=False)}
---

# {post['title']}

{post.get('subtitle','')}

"""
        if img: c += f"![封面]({img})\n\n"
        c += post['content'] + f"""

---

> 💡 **{post.get('call_to_action','关注滨州索引，获取更多装修灵感')}**
>
> 📍 滨州市黄河十一路渤海二路豪德广场西一街70号
> 📞 13326280320
> 🌐 {CONFIG['blog_url']}

*本文首发于滨州索引网站，转载请注明出处。*
"""
        os.makedirs(outdir, exist_ok=True)
        with open(fp,'w',encoding='utf-8') as f: f.write(c)
        print(f"✅ {fp}")
        return fp, slug

class EmailNotifier:
    def __init__(self, user, pwd, to):
        self.user, self.pwd, self.to = user, pwd, to
    
    def send(self, posts, ok=True):
        if not self.user or not self.pwd or not self.to:
            print("⚠️ 邮箱未配置，跳过通知")
            return
        subj = f"{'✅' if ok else '❌'} 每日推文 - {datetime.now().strftime('%Y-%m-%d')}"
        body = f"""<html><body style="font-family:Arial;max-width:600px;margin:0 auto;">
<div style="background:linear-gradient(135deg,#667eea,#764ba2);padding:20px;color:white;">
<h1 style="margin:0;">📝 每日推文报告</h1><p>{datetime.now().strftime('%Y-%m-%d')}</p></div>
<div style="padding:20px;">"""
        if ok:
            body += f"<h2 style='color:#28a745;'>✅ 成功 {len(posts)} 篇</h2><ul>"
            for p in posts: body += f"<li><b>{p['t']}</b>: {p['title']}</li>"
            body += "</ul>"
        else:
            body += "<h2 style='color:#dc3545;'>❌ 失败</h2>"
        body += f"""</div><div style="background:#f8f9fa;padding:15px;text-align:center;font-size:12px;">
<p>滨州索引自动推文系统</p></div></body></html>"""
        msg = MIMEMultipart()
        msg['From'], msg['To'], msg['Subject'] = self.user, self.to, subj
        msg.attach(MIMEText(body,'html','utf-8'))
        try:
            s = smtplib.SMTP('smtp.gmail.com',587)
            s.starttls(); s.login(self.user,self.pwd); s.send_message(msg); s.quit()
            print("📧 邮件已发送")
        except Exception as e: print(f"邮件失败: {e}")

def git_push(files, message):
    """提交并推送到GitHub"""
    try:
        for f in files:
            subprocess.run(["git","add",f], check=True, capture_output=True)
        subprocess.run(["git","commit","-m",message], check=True, capture_output=True)
        subprocess.run(["git","push","origin","main"], check=True, capture_output=True)
        print("✅ 已推送到GitHub，网站将自动更新")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Git推送失败: {e.stderr.decode()}")
        return False

def main():
    print("="*50+"\n🚀 滨州索引每日推文系统\n"+"="*50)
    today = datetime.now().strftime('%Y-%m-%d')
    posts = []
    try:
        gen = ContentGenerator(CONFIG["gemini_api_key"])
        img_h = ImageHandler(CONFIG["pexels_api_key"], CONFIG["imgbb_api_key"])
        mail = EmailNotifier(CONFIG["gmail_user"], CONFIG["gmail_password"], CONFIG["notify_email"])
        
        print("\n📝 生成窗帘推文...")
        cp = gen.generate_curtain_post()
        if not cp: raise Exception("窗帘推文失败")
        print(f"  {cp['title']}")
        
        print("\n📝 生成装修推文...")
        rp = gen.generate_renovation_post()
        if not rp: raise Exception("装修推文失败")
        print(f"  {rp['title']}")
        
        print("\n🖼️  获取配图...")
        ci = img_h.get_image(cp.get('image_keywords','curtain'), "curtain interior")
        ri = img_h.get_image(rp.get('image_keywords','renovation'), "home interior")
        
        print("\n📄 生成文件...")
        blog_dir = os.path.join(os.getcwd(), "src", "content", "blog")
        cf, _ = MarkdownGenerator.create(cp, "curtain", today, ci, blog_dir)
        rf, _ = MarkdownGenerator.create(rp, "renovation", today, ri, blog_dir)
        
        posts = [{"t":"🪟窗帘","title":cp['title']},{"t":"🔨装修","title":rp['title']}]
        
        print("\n📤 推送到GitHub...")
        git_push([cf, rf], f"📝 每日推文 - {today}")
        
        mail.send(posts, True)
        print(f"\n✅ 完成！文章已推送到 {CONFIG['blog_url']}")
    except Exception as e:
        print(f"\n❌ 失败: {e}")
        try: EmailNotifier(CONFIG["gmail_user"],CONFIG["gmail_password"],CONFIG["notify_email"]).send([],False)
        except: pass
        return 1
    return 0

if __name__=="__main__": sys.exit(main())
