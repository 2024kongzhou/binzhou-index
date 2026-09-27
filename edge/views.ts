import { verifiedVillage } from "./verified-places";
import { researchPage, villageSupplement } from "./village-research";
import { renderNoteBody } from "./personal-notes";
import {
  all,
  one,
  esc,
  cleanText,
  integer,
  Row,
  User,
  requireUser,
  HttpError,
} from "./core";
export const icon = (name: string, size = 20) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${({ search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>', arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>', pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>', book: '<path d="M12 5v16M3 3c4-1 6 0 9 2 3-2 5-3 9-2v16c-4-1-6 0-9 2-3-2-5-3-9-2Z"/>', bag: '<path d="M4 7h16l1 14H3L4 7Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>', menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>', phone: '<path d="M7 3H3c-1 9 9 19 18 18v-4l-5-2-2 2-7-7 2-2-2-5Z"/>' } as Record<string, string>)[name] || '<path d="M5 12h14"/>'}</svg>`;
const nav = [
  ["/", "首页"],
  ["/place/", "村庄名录"],
  ["/blog/", "滨州故事"],
  ["/product/", "本地好物"],
  ["/ziliudi/", "自留地"],
  ["/contact/", "生活服务"],
];
const date = (v: unknown) => {
  const n = Number(v),
    d = new Date(Number.isFinite(n) ? (n > 1e12 ? n : n * 1000) : String(v));
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("zh-CN", {
        timeZone: "Asia/Shanghai",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
};
const badge = (t: unknown) => `<span class="tag">${esc(t)}</span>`;
const imageUrl = (v: unknown) => {
  const s = String(v || "");
  return /^\/api\/img\/[\w.-]+$/.test(s) || /^https:\/\//.test(s)
    ? esc(s)
    : "/assets/landscape.svg";
};
const link = (href: string, text: string, cls = "button") =>
  `<a class="${cls}" href="${esc(href)}">${text}${icon("arrow", 17)}</a>`;
const blank = (title: string, text = "试试其他关键词，或者稍后再来看看。") =>
  `<div class="empty"><span class="empty-icon">${icon("search", 30)}</span><h3>${esc(title)}</h3><p>${esc(text)}</p></div>`;
function input(
  name: string,
  label: string,
  type = "text",
  required = true,
  value = "",
  extra = "",
) {
  return `<label>${esc(label)}<input name="${name}" type="${type}" ${required ? "required" : ""} value="${esc(value)}" ${extra}></label>`;
}
function textarea(name: string, label: string, value = "", required = true) {
  return `<label>${esc(label)}<textarea name="${name}" rows="5" ${required ? "required" : ""}>${esc(value)}</textarea></label>`;
}
const feedback =
  '<p class="form-feedback" role="status" aria-live="polite"></p>';
function searchForm(
  action = "/search/",
  value = "",
  placeholder = "搜索村庄、乡镇或滨州故事",
) {
  return `<form class="search-box" action="${action}" method="get" role="search">${icon("search")}<label class="sr-only" for="search-query">搜索关键词</label><input id="search-query" name="q" value="${esc(value)}" maxlength="80" placeholder="${placeholder}" autocomplete="off"><button type="submit" aria-label="搜索">搜索 ${icon("arrow", 17)}</button></form>`;
}
function sectionHead(kicker: string, title: string, href?: string) {
  return `<div class="section-heading"><div><span class="eyebrow">${kicker}</span><h2>${title}</h2></div>${href ? link(href, "查看全部", "text-link") : ""}</div>`;
}
function postCard(p: Row, featured = false) {
  return `<article class="story-card ${featured ? "featured" : ""}"><a href="/blog/${encodeURIComponent(String(p.slug))}/" class="card-image"><img src="${imageUrl(p.cover_image)}" alt="" loading="lazy" width="640" height="400"><span class="image-label">${p.ai_generated ? "AI 辅助创作" : "城市故事"}</span></a><div class="card-body"><span class="meta">${date(p.published_at || p.created_at)} <span>·</span> 滨州故事</span><h3><a href="/blog/${encodeURIComponent(String(p.slug))}/">${esc(p.title)}</a></h3><p>${esc(cleanText(p.excerpt || p.content).slice(0, 100))}</p><a class="text-link" href="/blog/${encodeURIComponent(String(p.slug))}/">阅读全文 ${icon("arrow", 16)}</a></div></article>`;
}
const noteCategory = (value: unknown) => ({ essay: "随笔", tutorial: "教程", note: "笔记" } as Record<string, string>)[String(value)] || "笔记";
function noteCard(note: Row) {
  const href = `/ziliudi/${encodeURIComponent(String(note.slug))}/`;
  return `<article class="note-card"><a class="note-card-image" href="${href}">${note.cover_image ? `<img src="${imageUrl(note.cover_image)}" alt="" loading="lazy" width="640" height="400">` : `<span>${icon("book", 38)}</span>`}</a><div class="note-card-body"><span class="meta">${date(note.published_at || note.created_at)} · ${noteCategory(note.category)}</span><h3><a href="${href}">${esc(note.title)}</a></h3><p>${esc(cleanText(note.summary || note.content).slice(0, 120))}</p><a class="text-link" href="${href}">继续阅读 ${icon("arrow", 16)}</a></div></article>`;
}
function uniquePosts(posts: Row[]) {
  const seen = new Set<string>();
  return posts.filter((p) => {
    const key = String(p.title || '').trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
function villageCard(v: Row) {
  v = verifiedVillage(v);
  return `<a class="village-card" href="/place/${v.id}/"><div class="village-top">${badge(v.district || "滨州")}<span>${esc(v.township)}</span>${icon("arrow", 18)}</div><h3>${esc(v.name)}</h3><p>${esc(cleanText(v.history || v.evolution || "乡土记忆，值得被认真记录。").slice(0, 95))}</p><span class="village-bottom">${icon("pin", 14)} ${esc([v.district, v.township].filter(Boolean).join(" · "))}</span></a>`;
}
function productCard(p: Row) {
  const imgs = productImageList(p);
  return `<article class="product-card"><a class="product-visual" href="/product/${p.id}/">${imgs[0] ? `<img src="${imageUrl(imgs[0])}" alt="${esc(p.name)} 商品图片 1" loading="lazy" width="400" height="300">` : `<span class="product-symbol">${icon("bag", 44)}</span><span>${esc(p.name)}</span>`}${p.is_soft_ad ? '<span class="ad-label">广告</span>' : ""}</a><div class="card-body"><h3><a href="/product/${p.id}/">${esc(p.name)}</a></h3><p>${esc(cleanText(p.description).slice(0, 70))}</p><div class="product-bottom"><strong>¥${esc(p.price ?? "面议")}${p.unit ? `<small> / ${esc(p.unit)}</small>` : ""}</strong><span>${esc(p.store_name || "本地商家")}</span></div></div></article>`;
}
function productImageList(p: Row): string[] {
  try {
    const parsed = JSON.parse(String(p.images || "[]"));
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string").slice(0, 6) : [];
  } catch {
    return [];
  }
}
function intro(kicker: string, title: string, desc: string) {
  return `<section class="page-intro"><span class="eyebrow">${kicker}</span><h1>${title}</h1><p>${desc}</p></section>`;
}
function pager(url: URL, total: number, page: number, size: number) {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return "";
  const u = (n: number) => {
    const s = new URL(url);
    s.searchParams.set("page", String(n));
    return esc(s.pathname + s.search);
  };
  return `<nav class="pagination" aria-label="分页">${page > 1 ? `<a class="button secondary" href="${u(page - 1)}">上一页</a>` : "<span></span>"}<span>第 ${page} / ${pages} 页 · 共 ${total} 条</span>${page < pages ? `<a class="button secondary" href="${u(page + 1)}">下一页 ${icon("arrow", 16)}</a>` : "<span></span>"}</nav>`;
}
export function shell(
  title: string,
  content: string,
  path: string,
  user: User | null,
  preview = false,
  description = "记录滨州的乡土根脉，发现身边的故事与好物。",
  status = 200,
) {
  const navigation = nav
    .map(
      ([href, label]) =>
        `<a href="${href}" ${path === href || (href !== "/" && path.startsWith(href)) ? 'aria-current="page"' : ""}>${label}</a>`,
    )
    .join("");
  return new Response(
    `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#173f3b"><title>${esc(title)}${title === "滨州索引" ? "" : " · 滨州索引"}</title><meta name="description" content="${esc(description)}">${preview ? '<meta name="robots" content="noindex,nofollow">' : `<link rel="canonical" href="https://keyi.de5.net${esc(path)}">`}<link rel="icon" type="image/svg+xml" href="/assets/mark.svg"><link rel="stylesheet" href="/assets/site.css?v=20260927-audit"><script src="/assets/site.js?v=20260926" defer></script></head><body><a class="skip-link" href="#main">跳至主要内容</a>${preview ? '<div class="preview-banner">升级预览 · 仅供浏览，提交功能在正式站开放</div>' : ""}<header class="site-header"><div class="container header-inner"><a class="brand" href="/" aria-label="滨州索引首页"><span class="brand-mark">滨</span><span>滨州索引<small>BINZHOU INDEX</small></span></a><nav class="desktop-nav" aria-label="主要导航">${navigation}</nav><div class="header-actions"><a class="icon-button" href="/search/" aria-label="全站搜索">${icon("search")}</a>${user ? `<a class="account-link" href="${user.role === "admin" ? "/admin/" : "/messages/"}">${esc(user.username)}</a><button class="icon-button" data-logout aria-label="退出登录">退出</button>` : '<a class="account-link" href="/login/">登录 / 注册</a>'}<details class="mobile-menu"><summary aria-label="展开导航">${icon("menu")}</summary><nav aria-label="手机导航">${navigation}<a href="/about/">关于我们</a></nav></details></div></div></header><main id="main">${content}</main><footer class="site-footer"><div class="container footer-main"><div class="footer-brand"><a class="brand" href="/"><span class="brand-mark">滨</span><span>滨州索引<small>一座城，万千值得记录的日常。</small></span></a><p>记录乡土根脉，连接本地生活。<br>从黄河到渤海，让每一个故事都有回响。</p></div><div><h3>发现滨州</h3><a href="/place/">村庄名录</a><a href="/chronicles/">地方志</a><a href="/blog/">滨州故事</a><a href="/product/">本地好物</a><a href="/ziliudi/">自留地</a></div><div><h3>与我们联系</h3><a href="tel:13326280320">133 2628 0320</a><a href="mailto:admin@keyi.de5.net">admin@keyi.de5.net</a><span>山东省滨州市</span></div><div><h3>关于平台</h3><a href="/about/">关于我们</a><a href="/contact/">服务与预约</a><a href="/credentials/">资质说明</a></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} 滨州索引工作室</span><div><a href="/privacy/">隐私政策</a><a href="/terms/">用户协议</a><a href="#main">回到顶部 ↑</a></div></div></footer></body></html>`,
    {
      status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-store",
      },
    },
  );
}
export async function page(req: Request, env: Env, user: User | null) {
  const url = new URL(req.url),
    path = url.pathname,
    q = (url.searchParams.get("q") || "").trim().slice(0, 80),
    db = env.DB,
    preview = env.PREVIEW_READ_ONLY === "true";
  const render = (
    title: string,
    html: string,
    description?: string,
    status = 200,
  ) => shell(title, html, path, user, preview, description, status);
  if (path === "/") {
    const [stats, vs, ps, products, gardenNotes] = await Promise.all([
      one(
        db,
        "SELECT (SELECT COUNT(*) FROM villages WHERE status='published' AND name<>'曾用名') villages,(SELECT COUNT(*) FROM posts WHERE status='published' AND title NOT LIKE '%??%' AND content NOT LIKE '%??%' AND length(content) BETWEEN 1500 AND 3000 AND cover_image<>'') posts,(SELECT COUNT(*) FROM products WHERE status='active') products",
      ),
      all(
        db,
        "SELECT * FROM villages WHERE status='published' AND name<>'曾用名' ORDER BY id DESC LIMIT 6",
      ),
      all(
        db,
        "SELECT * FROM posts WHERE status='published' AND title NOT LIKE '%??%' AND content NOT LIKE '%??%' AND length(content) BETWEEN 1500 AND 3000 AND cover_image<>'' AND id IN (SELECT MAX(id) FROM posts WHERE status='published' GROUP BY title) ORDER BY coalesce(published_at,created_at) DESC,id DESC LIMIT 3",
      ),
      all(
        db,
        "SELECT * FROM products WHERE status='active' AND section='goods' ORDER BY id LIMIT 4",
      ),
      all(db, "SELECT * FROM personal_notes WHERE status='published' ORDER BY published_at DESC,id DESC LIMIT 3"),
    ]);
    const productCards = products.map(productCard).join("") || blank("本地好物正在核实", "商家资料、图片和联系方式核对后再展示。");
    return render(
      "滨州索引",
      `<section class="hero"><div class="container hero-grid"><div class="hero-copy"><span class="eyebrow"><span class="status-dot"></span> 黄河之畔 · 渤海之滨</span><h1>一座城的记忆，<br>也是<span>你的生活。</span></h1><p>循着村庄的名字，读懂脚下的土地。<br>在滨州，发现故事、风物与日常的美好。</p>${searchForm()}<div class="hot-search"><span>从这里开始</span><a href="/place/?district=滨城区">滨城</a><a href="/place/?district=沾化区">沾化</a><a href="/place/?district=博兴县">博兴</a><a href="/place/">全部村庄 ↗</a></div></div><div class="hero-art"><img src="/assets/landscape.svg" alt="黄河流向渤海的乡土风景插画" width="650" height="500" fetchpriority="high"><div class="art-caption"><span>37°23′ N · 117°58′ E</span><strong>有故事的地方，叫家乡。</strong></div><span class="art-seal">山河<br>故里</span></div></div><div class="container stats-strip"><div><strong>${Number(stats?.villages || 0).toLocaleString()}</strong><span>村庄记忆，在此相逢</span></div><div><strong>${stats?.posts || 0}</strong><span>篇故事，记录身边的美好</span></div><div><strong>${stats?.products || 0}</strong><span>款本地好物，值得发现</span></div><a href="/about/">了解这份城市档案 ${icon("arrow")}</a></div></section><section class="container section">${sectionHead("01 / CITY JOURNAL", "读一读，滨州的故事", "/blog/")}<div class="story-grid">${ps.map((p) => postCard(p)).join("") || blank("故事正在整理中")}</div></section><section class="village-section"><div class="container section">${sectionHead("02 / ROOTS & PLACES", "每一个村名，都有来处", "/place/")}<p class="section-description">寻访乡土根脉，翻开那些熟悉而又陌生的名字。</p><div class="village-grid">${vs.map(villageCard).join("")}</div></div></section><section class="container section">${sectionHead("03 / LOCAL FINDS", "把本地的好，带进生活", "/product/")}<div class="product-grid">${productCards}</div></section><section class="container section garden-feature">${sectionHead("04 / PERSONAL GARDEN", "我的自留地", "/ziliudi/")}<p class="section-description">把写过的文章、教程和实践笔记放在这里，慢慢积累，随时回看。</p><div class="note-grid">${gardenNotes.map(noteCard).join("") || blank("这片自留地还在整理", "个人文章与教程会陆续放在这里。")}</div></section><section class="container service-banner"><div><span class="eyebrow">让生活，多一份舒心</span><h2>家的每一处，<br>都值得用心对待。</h2><p>窗帘定制、墙布施工、上门测量。<br>与身边的服务者，聊聊你的生活想法。</p>${link("/contact/", "咨询与预约", "button light")}</div><div class="service-art"><div class="curtain"></div><span>LOCAL LIFE<br>在地 · 好生活</span></div></section>`,
    );
  }
  if (path === "/place/" || path === "/search/") {
    const search = path === "/search/",
      district = (url.searchParams.get("district") || "").slice(0, 30),
      n = integer(url.searchParams.get("page"), 1, 1, 10000),
      size = 18,
      args: (string | number)[] = [],
      where = ["status='published'", "name<>'曾用名'"];
    if (q) {
      where.push("(name LIKE ? OR township LIKE ?)");
      args.push("%" + q + "%", "%" + q + "%");
    }
    if (district) {
      where.push("district=?");
      args.push(district);
    }
    const w = where.join(" AND ");
    const [vs, total, districts, posts] = await Promise.all([
      all(
        db,
        `SELECT * FROM villages WHERE ${w} ORDER BY id DESC LIMIT ? OFFSET ?`,
        ...args,
        size,
        (n - 1) * size,
      ),
      one(db, `SELECT COUNT(*) total FROM villages WHERE ${w}`, ...args),
      all(
        db,
        "SELECT district,COUNT(*) total FROM villages WHERE status='published' AND name<>'曾用名' AND district IS NOT NULL GROUP BY district ORDER BY total DESC",
      ),
      search && q
        ? all(
            db,
            "SELECT * FROM posts WHERE status='published' AND title LIKE ? ORDER BY id DESC LIMIT 6",
            "%" + q + "%",
          )
        : Promise.resolve([]),
    ]);
    return render(
      search ? "全站搜索" : "村庄名录",
      `<div class="container">${intro(search ? "FIND YOUR BINZHOU" : "ROOTS & PLACES", search ? "找到你心中的滨州。" : "沿着村名，回到故乡。", search ? "搜索村庄、乡镇与城市故事。" : "一份持续整理的乡土档案，让历史与日常在这里相遇。")}${searchForm(path, q, "输入村庄、乡镇" + (search ? "或文章标题" : ""))}${!search ? `<nav class="filter-chips" aria-label="按区县筛选"><a ${!district ? 'aria-current="page"' : ""} href="/place/?q=${encodeURIComponent(q)}">全部区县</a>${districts.map((d) => `<a ${district === d.district ? 'aria-current="page"' : ""} href="/place/?district=${encodeURIComponent(String(d.district))}&q=${encodeURIComponent(q)}">${esc(d.district)} <small>${d.total}</small></a>`).join("")}</nav>` : ""}${posts.length ? `${sectionHead("STORIES", "相关故事")}<div class="story-grid">${posts.map((p) => postCard(p)).join("")}</div>` : ""}<p class="source-note"><a href="/village-research/">查看村庄资料补遗：带年代的人口、土地与迁徙线索 →</a></p><div class="results-heading"><h2>${search ? "相关村庄" : "村庄档案"}</h2><span>找到 ${total?.total || 0} 条记录${q ? " · " + esc(q) : ""}</span></div><div class="village-grid">${vs.map(villageCard).join("")}</div>${!vs.length ? blank("没有找到相关村庄") : ""}${pager(url, Number(total?.total || 0), n, size)}</div>`,
    );
  }
  if (path === "/village-research/") return render("村庄资料补遗", researchPage());
  let match = path.match(/^\/place\/(\d+)\/$/);
  if (match) {
    let v = await one(
      db,
      "SELECT * FROM villages WHERE id=? AND status='published' AND name<>'曾用名'",
      Number(match[1]),
    );
    if (!v) throw new HttpError(404, "村庄档案不存在");
    v = verifiedVillage(v);
    return render(
      String(v.name),
      `<article class="container reading"><a class="breadcrumb" href="/place/">← 返回村庄名录</a><div class="article-heading">${badge(v.district || "乡土档案")}<h1>${esc(v.name)}</h1><p>${esc(v.township || "滨州")} · ${esc(v.version_tag || "村庄名录")}</p></div><div class="facts">${[
        ["地理位置", v.location],
        ["人口记载", v.population],
        ["主要姓氏", v.surnames],
        ["田地记载", v.farmland],
      ]
        .filter(([, v]) => v)
        .map(
          ([k, v]) => `<div><span>${k}</span><strong>${esc(v)}</strong></div>`,
        )
        .join("")}</div>${[
        ["历史沿革", v.history],
        ["村庄变迁", v.evolution],
        ["资料备注", v.remark],
      ]
        .filter(([, v]) => v)
        .map(
          ([k, v]) =>
            `<section class="prose"><h2>${k}</h2><p>${esc(cleanText(v))}</p></section>`,
        )
        .join(
          "",
        )}${villageSupplement(v)}<aside class="source-note">资料依据：${esc(v.source_file || "地方志与历史资料")}。本站资料按来源整理，历史记载不等同于现状；网络资料仅作交叉参考，涉及人口、行政区划、产权或公共事务，请以主管部门和原始出版物最新版本为准。如有补充或纠错，欢迎<a href="/contact/">联系我们</a>。</aside></article>`,
      cleanText(v.history || v.evolution).slice(0, 150),
    );
  }
  if (path === "/chronicles/") {
    const cs = await all(
      db,
      "SELECT * FROM chronicles WHERE status='published' ORDER BY id DESC LIMIT 100",
    );
    return render(
      "地方志",
      `<div class="container reading">${intro("LOCAL CHRONICLES", "翻开地方的记忆。", "地方文化与历史档案，欢迎提供补充与纠错。")}${cs.map((c) => `<details class="info-card"><summary>${esc(c.title)}</summary><div class="prose"><p>${esc(cleanText(c.content))}</p></div></details>`).join("") || blank("资料正在整理中")}</div>`,
    );
  }
  if (path === "/blog/") {
    const n = integer(url.searchParams.get("page"), 1, 1, 10000),
      w = "status='published' AND title NOT LIKE '%??%' AND content NOT LIKE '%??%' AND length(content) BETWEEN 1500 AND 3000 AND cover_image<>'' AND id IN (SELECT MAX(id) FROM posts WHERE status='published' GROUP BY title)" + (q ? " AND title LIKE ?" : ""),
      args = q ? ["%" + q + "%"] : [];
    const ps = await all(
        db,
        `SELECT * FROM posts WHERE ${w} ORDER BY coalesce(published_at,created_at) DESC,id DESC LIMIT 12 OFFSET ?`,
        ...args,
        (n - 1) * 12,
      ),
      count = await one(
        db,
        `SELECT COUNT(*) total FROM posts WHERE ${w}`,
        ...args,
      );
    return render(
      "滨州故事",
      `<div class="container">${intro("CITY JOURNAL", "在熟悉的城市，发现新的故事。", "地方风物、城市记忆与生活观察，一起慢慢读懂滨州。")}${searchForm("/blog/", q, "搜索滨州故事")}<div class="section story-grid">${ps.map((p) => postCard(p)).join("") || blank("暂时没有相关故事")}</div>${pager(url, Number(count?.total || 0), n, 12)}</div>`,
    );
  }
  match = path.match(/^\/blog\/([^/]+)\/$/);
  if (match) {
    const p = await one(
      db,
      "SELECT * FROM posts WHERE slug=? AND ((status='published' AND title NOT LIKE '%??%' AND content NOT LIKE '%??%' AND length(content) BETWEEN 1500 AND 3000 AND cover_image<>'') OR ?=1)",
      decodeURIComponent(match[1]),
      user?.role === "admin" ? 1 : 0,
    );
    if (!p) throw new HttpError(404, "文章不存在或尚未发布");
    const postFilter = "status='published' AND title NOT LIKE '%??%' AND content NOT LIKE '%??%' AND length(content) BETWEEN 1500 AND 3000 AND cover_image<>''";
    const [previous, next, comments] = await Promise.all([
      one(db, `SELECT slug,title FROM posts WHERE ${postFilter} AND (coalesce(published_at,created_at)>? OR (coalesce(published_at,created_at)=? AND id>?)) ORDER BY coalesce(published_at,created_at) ASC,id ASC LIMIT 1`, p.published_at || p.created_at, p.published_at || p.created_at, p.id),
      one(db, `SELECT slug,title FROM posts WHERE ${postFilter} AND (coalesce(published_at,created_at)<? OR (coalesce(published_at,created_at)=? AND id<?)) ORDER BY coalesce(published_at,created_at) DESC,id DESC LIMIT 1`, p.published_at || p.created_at, p.published_at || p.created_at, p.id),
      all(db, "SELECT author_name,content,created_at FROM comments WHERE post_id=? AND status='approved' ORDER BY id DESC LIMIT 30", p.id),
    ]);
    const articleNav = `<nav class="article-nav" aria-label="文章导航">${previous ? `<a href="/blog/${encodeURIComponent(String(previous.slug))}/"><span>上一篇</span><strong>${esc(previous.title)}</strong></a>` : "<span></span>"}${next ? `<a href="/blog/${encodeURIComponent(String(next.slug))}/"><span>下一篇</span><strong>${esc(next.title)}</strong></a>` : "<span></span>"}</nav>`;
    return render(
      String(p.title),
      `<article class="container reading"><a class="breadcrumb" href="/blog/">← 返回滨州故事</a><div class="article-heading">${badge(p.ai_generated ? "AI 辅助创作 · 请核实重要信息" : "滨州故事")}${p.status !== "published" ? badge("管理员预览 · 未公开") : ""}<h1>${esc(p.title)}</h1><p>${date(p.published_at || p.created_at)} · 约 ${Math.max(1, Math.ceil(cleanText(p.content).length / 500))} 分钟阅读</p></div>${p.cover_image ? `<img class="article-cover" src="${imageUrl(p.cover_image)}" alt="文章配图" width="1000" height="600">` : ""}<div class="prose note-prose">${renderNoteBody(cleanText(p.content))}</div><aside class="source-note">内容仅供参考。涉及政策、价格、医疗等信息，请以相关机构最新公布内容为准。</aside>${articleNav}<section class="comments"><h2>留下你的想法</h2>${user ? `<form data-api="/api/comments" class="stack"><input type="hidden" name="postId" value="${p.id}">${textarea("content", "评论内容")}${feedback}<button class="button" type="submit">提交评论</button><small>评论审核通过后显示。</small></form>` : '<p><a href="/login/">登录</a>后参与讨论。</p>'}${comments.map((c) => `<div class="comment"><strong>${esc(c.author_name)}</strong><time>${date(c.created_at)}</time><p>${esc(c.content)}</p></div>`).join("")}</section></article>`,
      cleanText(p.excerpt || p.content).slice(0, 150),
    );
  }
  if (path === "/ziliudi/") {
    const page = integer(url.searchParams.get("page"), 1, 1, 10000);
    const category = ["essay", "tutorial", "note"].includes(url.searchParams.get("category") || "") ? url.searchParams.get("category")! : "";
    const where = "status='published' AND (?='' OR category=?) AND (?='' OR title LIKE ? OR summary LIKE ? OR content LIKE ?)";
    const args = [category, category, q, `%${q}%`, `%${q}%`, `%${q}%`];
    const [notes, count] = await Promise.all([
      all(db, `SELECT * FROM personal_notes WHERE ${where} ORDER BY published_at DESC,id DESC LIMIT 12 OFFSET ?`, ...args, (page - 1) * 12),
      one(db, `SELECT COUNT(*) total FROM personal_notes WHERE ${where}`, ...args),
    ]);
    const categories = [["", "全部"], ["essay", "随笔"], ["tutorial", "教程"], ["note", "笔记"]];
    return render("自留地", `<div class="container">${intro("PERSONAL GARDEN", "我的自留地。", "文章、教程和实践笔记，留给自己整理，也与你分享。")}${searchForm("/ziliudi/", q, "搜索自留地")}${`<nav class="filter-chips" aria-label="内容分类">${categories.map(([key, label]) => `<a ${category === key ? 'aria-current="page"' : ""} href="/ziliudi/?category=${key}">${label}</a>`).join("")}</nav>`}<div class="note-grid section">${notes.map(noteCard).join("") || blank("这里还没有公开的内容", "可以稍后再来看看。")}</div>${pager(url, Number(count?.total || 0), page, 12)}</div>`, "个人文章、教程与实践笔记。");
  }
  match = path.match(/^\/ziliudi\/([^/]+)\/$/);
  if (match) {
    const note = await one(db, "SELECT * FROM personal_notes WHERE slug=? AND (status='published' OR ?=1)", decodeURIComponent(match[1]), user?.role === "admin" ? 1 : 0);
    if (!note) throw new HttpError(404, "内容不存在或尚未公开");
    const [previous, next] = await Promise.all([
      one(db, "SELECT title,slug FROM personal_notes WHERE status='published' AND (published_at>? OR (published_at=? AND id>?)) ORDER BY published_at ASC,id ASC LIMIT 1", note.published_at || 0, note.published_at || 0, note.id),
      one(db, "SELECT title,slug FROM personal_notes WHERE status='published' AND (published_at<? OR (published_at=? AND id<?)) ORDER BY published_at DESC,id DESC LIMIT 1", note.published_at || 0, note.published_at || 0, note.id),
    ]);
    const articleNav = `<nav class="article-nav" aria-label="自留地文章导航">${previous ? `<a href="/ziliudi/${encodeURIComponent(String(previous.slug))}/"><span>上一篇</span><strong>${esc(previous.title)}</strong></a>` : "<span></span>"}${next ? `<a href="/ziliudi/${encodeURIComponent(String(next.slug))}/"><span>下一篇</span><strong>${esc(next.title)}</strong></a>` : "<span></span>"}</nav>`;
    return render(String(note.title), `<article class="container reading note-reading"><a class="breadcrumb" href="/ziliudi/">← 返回自留地</a><div class="article-heading">${badge(noteCategory(note.category))}${note.status !== "published" ? badge("管理员预览 · 未公开") : ""}<h1>${esc(note.title)}</h1><p>${date(note.published_at || note.created_at)} · 个人记录</p></div>${note.cover_image ? `<img class="article-cover" src="${imageUrl(note.cover_image)}" alt="${esc(note.title)}配图" width="1000" height="600">` : ""}${note.summary ? `<p class="note-lead">${esc(note.summary)}</p>` : ""}<div class="prose note-prose">${renderNoteBody(note.content)}</div>${articleNav}</article>`, cleanText(note.summary || note.content).slice(0, 150));
  }
  if (path === "/product/") {
    const ps = await all(db, "SELECT * FROM products WHERE status='active' AND section='goods' ORDER BY id DESC");
    return render("本地好物", `<div class="container">${intro("LOCAL FINDS", "好物在身边，生活有滋味。", "发现滨州本地商品与服务。标记为广告的内容为商业推荐。")}<div class="product-grid section">${ps.map(productCard).join("") || blank("暂时没有商品", "管理员会在后台更新商品信息。")}</div></div>`);
  }
  match = path.match(/^\/product\/(\d+)\/$/);
  if (match) {
    const p = await one(
      db,
      "SELECT * FROM products WHERE id=? AND status='active' AND section='goods'",
      Number(match[1]),
    );
    if (!p) throw new HttpError(404, "商品不存在");
    const imgs = productImageList(p),
      contact = String(p.customer_service || p.store_phone || ""),
      contactLink = /^\+?[0-9() -]{7,20}$/.test(contact) ? `tel:${contact.replace(/[^+\d]/g, "")}` : /^https:\/\//.test(contact) ? contact : /^\S+@\S+\.\S+$/.test(contact) ? `mailto:${contact}` : "";
    return render(
      String(p.name),
      `<div class="container reading"><a href="/product/" class="breadcrumb">← 返回本地好物</a>${intro("LOCAL FINDS", esc(p.name), "商品详情与联系信息由商家提供；购买前请与商家确认价格、规格和库存。")}<div class="product-detail-grid">${imgs.length ? `<div class="product-gallery">${imgs.map((image, i) => `<img src="${imageUrl(image)}" alt="${esc(p.name)} 商品图片 ${i + 1}" loading="lazy" width="800" height="600">`).join("")}</div>` : `<div class="product-gallery product-gallery-empty">${icon("bag", 44)}<span>暂无商品图片</span></div>`}<section class="info-card product-detail-card"><span class="price">¥${esc(p.price ?? "面议")}${p.unit ? `<small> / ${esc(p.unit)}</small>` : ""}</span>${p.original_price ? `<p class="product-original-price">参考原价：¥${esc(p.original_price)} / ${esc(p.unit || "件")}</p>` : ""}<dl><dt>单位</dt><dd>${esc(p.unit || "未填写")}</dd><dt>材质</dt><dd>${esc(p.material || "未填写")}</dd><dt>商家</dt><dd>${esc(p.store_name || "本地商家")}</dd><dt>客服</dt><dd>${contactLink ? `<a href="${esc(contactLink)}">${esc(contact || "联系商家")}</a>` : esc(contact || "请通过站内咨询联系商家")}</dd><dt>库存</dt><dd>${esc(p.stock ?? "请咨询")}</dd>${p.store_address ? `<dt>地址</dt><dd>${esc(p.store_address)}</dd>` : ""}</dl>${link("/contact/?service=" + encodeURIComponent(String(p.name)), "站内咨询")} ${p.is_soft_ad ? badge("商业广告") : ""}</section></div><article class="prose product-description"><h2>详情介绍</h2>${cleanText(p.description).split("\n").map((line) => line ? `<p>${esc(line)}</p>` : "").join("")}</article></div>`,
    );
  }
  if (path === "/login/" || path === "/register/") {
    const reg = path === "/register/";
    if (user)
      return Response.redirect(
        url.origin + (user.role === "admin" ? "/admin/" : "/messages/"),
        303,
      );
    return render(
      reg ? "创建账号" : "欢迎回来",
      `<div class="auth-layout container"><div class="auth-art"><span class="eyebrow">WELCOME TO BINZHOU</span><h1>与这座城市，<br>多一点连接。</h1><img src="/assets/landscape.svg" alt="" width="500" height="400"></div><section class="auth-card"><span class="eyebrow">滨州索引</span><h2>${reg ? "创建你的账号" : "欢迎回来"}</h2><p>${reg ? "留下足迹，参与身边的故事。" : "登录后，继续与家乡的对话。"}</p><form class="stack" data-api="/api/auth/${reg ? "register" : "login"}" data-redirect="/">${reg ? input("username", "用户名", "text", true, "", 'autocomplete="username" maxlength="40"') : ""}${input(reg ? "email" : "account", reg ? "邮箱" : "邮箱或已绑定手机号", reg ? "email" : "text", true, "", 'autocomplete="username"')}${input("password", "密码", "password", true, "", `autocomplete="${reg ? "new-password" : "current-password"}" ${reg ? 'minlength="10"' : ""} maxlength="72"`)}${reg ? '<small>请使用至少 10 位的密码。注册即表示同意<a href="/terms/">用户协议</a>与<a href="/privacy/">隐私政策</a>。</small>' : ""}${feedback}<button class="button full" type="submit">${reg ? "创建账号" : "登录"} ${icon("arrow")}</button></form><p class="auth-switch">${reg ? '已有账号？ <a href="/login/">立即登录</a>' : '还没有账号？ <a href="/register/">免费注册</a>'}</p></section></div>`,
    );
  }
  if (path === "/contact/")
    return render(
      "服务与预约",
      `<div class="container">${intro("LOCAL LIFE", "让你的生活想法，落到实处。", "窗帘、墙布与本地生活服务。告诉我们你的需求，我们会与你联系。")}<div class="contact-grid"><div><div class="contact-card">${icon("phone", 30)}<h2>直接聊聊</h2><a class="contact-number" href="tel:13326280320">133 2628 0320</a><p>工作日 9:00–18:00<br>山东省滨州市</p><a class="text-link" href="mailto:admin@keyi.de5.net">邮件联系 ${icon("arrow", 16)}</a></div><div class="contact-card"><h3>资料补充与纠错</h3><p>如果你发现村庄资料需要更新，或有值得记录的家乡故事，欢迎通过私信告诉我们。</p>${link("/messages/", "发送私信", "text-link")}</div></div><form class="info-card stack" data-api="/api/bookings"><h2>预约本地服务</h2><p>提交需求不产生费用，具体服务由双方沟通确认。</p><div class="form-grid">${input("name", "称呼", "text", true, "", 'autocomplete="name" maxlength="50"')}${input("phone", "联系电话", "tel", true, "", 'autocomplete="tel" maxlength="20"')}</div>${input("serviceType", "需要什么服务", "text", true, url.searchParams.get("service") || "", 'placeholder="例如：窗帘定制、上门测量" maxlength="80"')}${input("address", "服务地址（选填）", "text", false, "", 'autocomplete="street-address" maxlength="300"')}${input("preferredDate", "期望日期（选填）", "date", false)}${textarea("note", "补充说明（选填）", "", false)}<label class="check-label"><input type="checkbox" required>我同意为处理本次预约提供上述联系信息。</label>${feedback}<button type="submit" class="button">提交预约 ${icon("arrow")}</button></form></div></div>`,
    );
  if (path === "/messages/") {
    if (!user) return Response.redirect(url.origin + "/login/", 303);
    const ms =
      user.role === "admin"
        ? await all(
            db,
            "SELECT m.*,u.username sender_name FROM messages m LEFT JOIN users u ON m.sender_id=u.id ORDER BY m.id DESC LIMIT 100",
          )
        : await all(
            db,
            "SELECT m.*,u.username sender_name FROM messages m LEFT JOIN users u ON m.sender_id=u.id WHERE sender_id=? OR receiver_id=? ORDER BY m.id DESC LIMIT 100",
            user.id,
            user.id,
          );
    return render(
      "我的私信",
      `<div class="container reading">${intro("MESSAGES", "保持联系。", "发送咨询、资料补充或建议。")}<form class="info-card stack" data-api="/api/messages" data-refresh>${user.role === "admin" ? input("receiverId", "收件用户 ID", "number") : ""}${textarea("content", "私信内容")}${feedback}<button class="button">发送私信</button></form><section class="section">${ms.map((m) => `<div class="comment"><strong>${esc(m.sender_name)}${user.role === "admin" ? " · 用户 " + m.sender_id : ""}</strong><time>${date(m.created_at)}</time><p>${esc(m.content)}</p></div>`).join("") || blank("还没有私信", "你发送和收到的消息会显示在这里。")}</section></div>`,
    );
  }
  if (path === "/admin/") {
    if (!user) return Response.redirect(url.origin + "/login/", 303);
    return adminPage(req, env, user);
  }
  const legal: Record<string, [string, string]> = {
    "/about/": [
      "关于滨州索引",
      "滨州索引是一个关注乡土记忆与本地生活的平台。我们整理村庄历史、地方文化和城市故事，也连接身边的商品与服务。\n\n历史资料不等于现状。我们希望每一份记忆都能得到认真对待，也欢迎你提供补充和纠错。部分文章为 AI 辅助创作，会在页面上明确标识。\n\n运营主体：滨州索引工作室。联系邮箱：admin@keyi.de5.net。",
    ],
    "/privacy/": [
      "隐私政策",
      "我们仅为提供账号、预约、评论与私信功能处理你主动提交的信息。注册信息用于账号识别；密码以散列形式保存；登录使用 HttpOnly Cookie。预约联系方式用于沟通服务需求，私信仅对发送人、收件人及必要的管理员开放。\n\n请不要在公开评论中填写敏感个人信息。为了防止滥用，系统会处理请求来源及操作频次。你可通过 admin@keyi.de5.net 联系我们，申请更正或删除个人信息。\n\n预约和评论记录仅用于对应服务处理及必要的管理。我们不会在页面公开你的预约电话或邮箱。",
    ],
    "/terms/": [
      "用户协议",
      "请提供真实、合法的信息，并尊重他人权益。历史资料和文章仅供参考，重要信息应向权威来源核实。未经允许请勿转载受保护内容或发布违法信息。\n\n商品页面为展示与咨询入口，不构成在线交易承诺。价格、服务范围及履行方式以你与商家确认的结果为准。评论经过审核后展示，管理员可对违规内容进行处理。\n\n如需帮助，请通过联系页面与我们沟通。",
    ],
    "/credentials/": [
      "资质说明",
      "运营主体：滨州索引工作室。\n\n本站提供地方资料、内容展示及生活服务咨询。商品及服务的实际提供者、营业资质与具体履约安排，请在交易前向商家核实。本站不展示未经核验的资质证书或认证标识。\n\n联系电话：13326280320。联系邮箱：admin@keyi.de5.net。",
    ],
  };
  if (legal[path])
    return render(
      legal[path][0],
      `<article class="container reading">${intro("BINZHOU INDEX", legal[path][0], "记录乡土根脉，服务本地生活。")}<div class="prose">${legal[
        path
      ][1]
        .split("\n\n")
        .map((t) => `<p>${esc(t)}</p>`)
        .join("")}</div>${link("/contact/", "联系我们")}</article>`,
    );
  throw new HttpError(404, "这个页面暂时没有找到");
}
async function adminPage(req: Request, env: Env, user: User | null) {
  requireUser(user, true);
  const url = new URL(req.url),
    edit = url.searchParams.get("edit"),
    editVillage = integer(url.searchParams.get("editVillage"), 0, 1, 1e9),
    editChronicle = integer(url.searchParams.get("editChronicle"), 0, 1, 1e9),
    editProduct = integer(url.searchParams.get("editProduct"), 0, 1, 1e9),
    editNote = (url.searchParams.get("editNote") || "").slice(0, 160),
    search = (url.searchParams.get("q") || "").trim().slice(0, 80),
    pattern = `%${search}%`,
    p = edit
      ? await one(env.DB, "SELECT * FROM posts WHERE slug=?", edit)
      : null,
    nEdit = editNote ? await one(env.DB, "SELECT * FROM personal_notes WHERE slug=?", editNote) : null;
  const [posts, notes, bookings, comments, users, villages, chronicles, products, counts, vEdit, cEdit, prEdit] = await Promise.all([
    all(
      env.DB,
      "SELECT id,title,slug,status FROM posts WHERE (?='' OR title LIKE ? OR slug LIKE ?) ORDER BY id DESC LIMIT 60",
      search, pattern, pattern,
    ),
    all(env.DB, "SELECT id,title,slug,category,status FROM personal_notes WHERE (?='' OR title LIKE ? OR slug LIKE ?) ORDER BY id DESC LIMIT 60", search, pattern, pattern),
    all(
      env.DB,
      "SELECT id,name,service_type,status,phone FROM bookings WHERE (?='' OR name LIKE ? OR phone LIKE ? OR service_type LIKE ?) ORDER BY id DESC LIMIT 60",
      search, pattern, pattern, pattern,
    ),
    all(
      env.DB,
      "SELECT id,author_name,content,status FROM comments WHERE status='pending' AND (?='' OR author_name LIKE ? OR content LIKE ?) ORDER BY id DESC LIMIT 60",
      search, pattern, pattern,
    ),
    all(
      env.DB,
      "SELECT id,username,email,role,is_active FROM users WHERE (?='' OR username LIKE ? OR email LIKE ?) ORDER BY id DESC LIMIT 100",
      search, pattern, pattern,
    ),
    all(env.DB, "SELECT id,name,district,township,population,status FROM villages WHERE (?='' OR name LIKE ? OR district LIKE ? OR township LIKE ?) ORDER BY id DESC LIMIT 60", search, pattern, pattern, pattern),
    all(env.DB, "SELECT id,title,category,era,status FROM chronicles WHERE (?='' OR title LIKE ? OR category LIKE ? OR era LIKE ?) ORDER BY id DESC LIMIT 60", search, pattern, pattern, pattern),
    all(env.DB, "SELECT id,name,price,stock,status FROM products WHERE section='goods' AND (?='' OR name LIKE ? OR store_name LIKE ?) ORDER BY id DESC LIMIT 60", search, pattern, pattern),
    one(env.DB, "SELECT (SELECT COUNT(*) FROM posts) posts,(SELECT COUNT(*) FROM villages WHERE status='published') villages,(SELECT COUNT(*) FROM chronicles WHERE status='published') chronicles,(SELECT COUNT(*) FROM products WHERE status='active' AND section='goods') products,(SELECT COUNT(*) FROM comments WHERE status='pending') pending_comments,(SELECT COUNT(*) FROM bookings WHERE status='pending') pending_bookings"),
    editVillage ? one(env.DB, "SELECT * FROM villages WHERE id=?", editVillage) : null,
    editChronicle ? one(env.DB, "SELECT * FROM chronicles WHERE id=?", editChronicle) : null,
    editProduct ? one(env.DB, "SELECT * FROM products WHERE id=?", editProduct) : null,
  ]);
  const statusForm = (kind: string, r: Row, choices: string[]) =>
    `<form data-api="/api/admin/status" data-refresh class="inline-form"><input type="hidden" name="kind" value="${kind}"><input type="hidden" name="id" value="${r.id}"><select name="status" aria-label="状态">${choices.map((v) => `<option ${r.status === v ? "selected" : ""} value="${v}">${({ published: "已发布", draft: "草稿", archived: "已归档", pending: "待处理", approved: "通过", rejected: "不通过", contacted: "已联系", completed: "已完成", canceled: "已取消" } as Record<string, string>)[v]}</option>`).join("")}</select><button class="button small">保存</button>${feedback}</form>`;
  return shell(
    "内容管理",
    `<div class="container">${intro("WORKSPACE", "把好内容，带给更多人。", "管理文章、预约和评论。修改会同步到网站，无需等待重新部署。")}${adminMetrics(counts)}<form class="admin-search" method="get" action="/admin/" role="search"><label for="admin-query">搜索后台记录</label><input id="admin-query" name="q" type="search" value="${esc(search)}" placeholder="村名、文章、用户、预约…"><button class="button small">搜索</button></form><nav class="filter-chips"><a href="#personal-notes">写自留地</a><a href="#editor">写滨州故事</a><a href="#posts">文章管理</a><a href="#bookings">预约</a><a href="#comments">评论审核</a><a href="#users">账号与权限</a><a href="#records">档案管理</a><a href="#catalog">新增资料</a><a href="/messages/">私信</a></nav><section class="info-card" id="editor"><h2>${p ? "编辑文章" : "新建文章"}</h2><form class="stack" data-api="${p ? "/api/posts/" + encodeURIComponent(String(p.slug)) + "/" : "/api/posts"}" data-method="${p ? "PUT" : "POST"}" data-redirect="/admin/#posts">${input("title", "标题", "text", true, String(p?.title || ""), 'maxlength="200"')}${p ? "" : input("slug", "文章地址标识", "text", true, "", 'pattern="[a-zA-Z0-9_-]+" placeholder="例如 binzhou-story-2026" maxlength="160"')}${textarea("content", "正文", String(p?.content || ""))}${textarea("excerpt", "摘要", String(p?.excerpt || ""), false)}${input("coverImage", "封面地址（选填）", "text", false, String(p?.cover_image || ""))}<label>发布状态<select name="status"><option value="draft" ${p?.status === "draft" ? "selected" : ""}>草稿</option><option value="published" ${p?.status === "published" ? "selected" : ""}>发布</option></select></label>${feedback}<button class="button">保存文章</button></form></section>${personalAdmin(notes, nEdit)}${catalogForms()}${adminRecords(villages, chronicles, products, vEdit, cEdit, prEdit, search)}<section class="section" id="posts"><h2>文章管理</h2><div class="admin-list">${posts.map((r) => `<div class="admin-row"><a href="/admin/?edit=${encodeURIComponent(String(r.slug))}">${esc(r.title)}</a><a class="text-link" href="/blog/${encodeURIComponent(String(r.slug))}/">查看</a>${statusForm("posts", r, ["draft", "published", "archived"])}</div>`).join("")}</div></section><section id="bookings" class="section"><h2>服务预约</h2>${bookings.map((r) => `<div class="admin-row"><span>${esc(r.name)} · ${esc(r.service_type)}<br><a href="tel:${esc(r.phone)}">${esc(r.phone)}</a></span>${statusForm("bookings", r, ["pending", "contacted", "completed", "canceled"])}</div>`).join("") || blank("暂无预约")}</section><section id="comments" class="section"><h2>评论审核</h2>${comments.map((r) => `<div class="admin-row"><span><strong>${esc(r.author_name)}</strong><br>${esc(r.content)}</span>${statusForm("comments", r, ["pending", "approved", "rejected"])}</div>`).join("") || blank("没有待审核评论")}</section><section id="users" class="section"><h2>账号与权限</h2><p>管理员可以编辑和发布全站内容、审核评论、处理预约并管理账号权限。管理员账号请仅分配给可信任的运营人员。</p><details class="info-card"><summary>创建管理员或普通账号</summary><form class="stack" data-api="/api/admin/users" data-refresh>${input("username", "用户名", "text", true, "", 'maxlength="40" autocomplete="username"')}${input("email", "登录邮箱", "email", true, "", 'maxlength="254" autocomplete="email"')}${input("password", "初始密码（至少 10 位）", "password", true, "", 'minlength="10" maxlength="72" autocomplete="new-password"')}<label>账号角色<select name="role"><option value="admin">管理员：可管理全站内容和账号权限</option><option value="user">普通账号：无后台管理权限</option></select></label>${feedback}<button class="button">创建账号</button></form></details><div class="admin-list">${users.map((r) => `<div class="admin-row"><div><strong>#${r.id} ${esc(r.username)}</strong><br><small>${esc(r.email || "")}</small></div><form class="inline-form" data-api="/api/admin/users/${r.id}" data-method="PUT" data-refresh><label>角色<select name="role"><option value="admin" ${r.role === "admin" ? "selected" : ""}>管理员</option><option value="user" ${r.role !== "admin" ? "selected" : ""}>普通用户</option></select></label><label>状态<select name="isActive"><option value="true" ${r.is_active ? "selected" : ""}>启用</option><option value="false" ${!r.is_active ? "selected" : ""}>停用</option></select></label><label>重置密码<input name="password" type="password" minlength="10" maxlength="72" placeholder="留空则不修改" autocomplete="new-password"></label><button class="button small">保存权限</button>${feedback}</form></div>`).join("")}</div></section></div>`,
    url.pathname,
    user,
    env.PREVIEW_READ_ONLY === "true",
  );
}

function adminMetric(label: string, value: unknown, href: string) {
  return `<a class="admin-metric" href="${href}"><span>${esc(label)}</span><strong>${esc(value)}</strong></a>`;
}

function adminMetrics(counts: Row | null) {
  return `<section class="admin-metrics" aria-label="站点管理概况">${adminMetric("文章总数", counts?.posts, "#posts")}${adminMetric("公开村庄档案", counts?.villages, "#village-records")}${adminMetric("地方志条目", counts?.chronicles, "#chronicle-records")}${adminMetric("在售商品", counts?.products, "#product-records")}${adminMetric("待审核评论", counts?.pending_comments, "#comments")}${adminMetric("待处理预约", counts?.pending_bookings, "#bookings")}</section>`;
}

function personalAdmin(notes: Row[], edit: Row | null) {
  const category = String(edit?.category || "note");
  const status = String(edit?.status || "draft");
  return `<section class="section" id="personal-notes"><h2>自留地 · 个人内容</h2><p>在这里积累随笔、教程和笔记。支持 Markdown 标题、列表、代码块与链接；封面可选，也没有滨州故事的字数限制。</p><form class="info-card stack" data-api="${edit ? `/api/notes/${encodeURIComponent(String(edit.slug))}/` : "/api/notes"}" data-method="${edit ? "PUT" : "POST"}" data-redirect="/admin/#personal-notes">${input("title", "标题", "text", true, String(edit?.title || ""), 'maxlength="200"')}${edit ? `<p>文章地址：/ziliudi/${esc(edit.slug)}/</p>` : input("slug", "文章地址标识", "text", true, "", 'pattern="[a-z0-9_-]{2,160}" placeholder="例如 my-first-tutorial" maxlength="160"')}<label>内容类型<select name="category">${[["essay", "随笔"], ["tutorial", "教程"], ["note", "笔记"]].map(([key, label]) => `<option value="${key}" ${category === key ? "selected" : ""}>${label}</option>`).join("")}</select></label>${textarea("summary", "简短介绍（选填）", String(edit?.summary || ""), false)}${input("coverImage", "封面图片地址（选填）", "text", false, String(edit?.cover_image || ""))}<label>正文（Markdown）<textarea name="content" rows="16" required maxlength="60000" placeholder="可以先保存草稿，再慢慢完善。">${esc(edit?.content || "")}</textarea></label><label>状态<select name="status">${[["draft", "草稿"], ["published", "公开发布"], ["archived", "归档"]].map(([key, label]) => `<option value="${key}" ${status === key ? "selected" : ""}>${label}</option>`).join("")}</select></label>${feedback}<button class="button" type="submit">${edit ? "保存修改" : "保存内容"}</button></form><div class="admin-list">${notes.map((note) => `<div class="admin-row"><div><strong>${esc(note.title)}</strong><br><small>${noteCategory(note.category)} · ${esc(({ draft: "草稿", published: "已公开", archived: "已归档" } as Record<string,string>)[String(note.status)] || note.status)}</small></div><a class="text-link" href="/admin/?editNote=${encodeURIComponent(String(note.slug))}#personal-notes">编辑</a><a class="text-link" href="/ziliudi/${encodeURIComponent(String(note.slug))}/">预览</a></div>`).join("") || blank("还没有个人内容", "在上方写下第一篇笔记。")}</div></section>`;
}

function adminRecords(
  villages: Row[], chronicles: Row[], products: Row[],
  vEdit: Row | null, cEdit: Row | null, prEdit: Row | null,
  search: string,
) {
  const qs = `q=${encodeURIComponent(search)}`;
  const editor = (kind: string, record: Row, fields: string) =>
    `<details class="info-card" open><summary>编辑记录 #${record.id}</summary><form class="stack" data-api="/api/admin/records/${kind}/${record.id}" data-method="PUT" data-refresh>${fields}${feedback}<button class="button">保存修改</button></form></details>`;
  const villageForm = vEdit ? editor("villages", vEdit,
    `${input("name", "村名", "text", true, String(vEdit.name || ""))}${input("district", "区县", "text", false, String(vEdit.district || ""))}${input("township", "乡镇", "text", false, String(vEdit.township || ""))}${input("population", "人口记载", "text", false, String(vEdit.population || ""))}${input("farmland", "土地记载", "text", false, String(vEdit.farmland || ""))}${input("surnames", "姓氏记载", "text", false, String(vEdit.surnames || ""))}${input("sourceFile", "资料来源", "text", false, String(vEdit.source_file || ""))}${textarea("history", "历史沿革", String(vEdit.history || ""), false)}${textarea("evolution", "村庄变迁", String(vEdit.evolution || ""), false)}${textarea("remark", "备注", String(vEdit.remark || ""), false)}<label>公开状态<select name="status">${["published", "draft", "archived"].map((x) => `<option value="${x}" ${vEdit.status === x ? "selected" : ""}>${({ published: "公开", draft: "草稿", archived: "归档" } as Record<string,string>)[x]}</option>`).join("")}</select></label>`) : "";
  const chronicleForm = cEdit ? editor("chronicles", cEdit,
    `${input("title", "标题", "text", true, String(cEdit.title || ""))}${input("category", "分类", "text", false, String(cEdit.category || ""))}${input("era", "年代", "text", false, String(cEdit.era || ""))}${input("tags", "标签", "text", false, String(cEdit.tags || ""))}${textarea("content", "正文", String(cEdit.content || ""), true)}<label>公开状态<select name="status">${["published", "draft", "archived"].map((x) => `<option value="${x}" ${cEdit.status === x ? "selected" : ""}>${({ published: "公开", draft: "草稿", archived: "归档" } as Record<string,string>)[x]}</option>`).join("")}</select></label>`) : "";
  const productForm = prEdit ? editor("products", prEdit,
    `${input("name", "商品名称", "text", true, String(prEdit.name || ""))}${input("price", "价格", "number", true, String(prEdit.price ?? ""), 'min="0" step="0.01"')}${input("unit", "单位", "text", false, String(prEdit.unit || ""))}${input("originalPrice", "原价", "number", false, String(prEdit.original_price ?? ""), 'min="0" step="0.01"')}${input("stock", "库存", "number", false, String(prEdit.stock ?? "0"), 'min="0" step="1"')}${input("material", "材质", "text", false, String(prEdit.material || ""))}${input("customerService", "客服联系方式", "text", false, String(prEdit.customer_service || ""))}${input("storeName", "商家名称", "text", false, String(prEdit.store_name || ""))}${input("storeAddress", "商家地址", "text", false, String(prEdit.store_address || ""))}${input("storePhone", "商家电话", "text", false, String(prEdit.store_phone || ""))}${textarea("images", "商品图片（每行一张，最多 6 张）", productImageList(prEdit).join("\n"), false)}${textarea("description", "详情介绍", String(prEdit.description || ""), false)}<label>推广标记<select name="isSoftAd"><option value="false" ${!prEdit.is_soft_ad ? "selected" : ""}>普通展示</option><option value="true" ${prEdit.is_soft_ad ? "selected" : ""}>推广内容</option></select></label><label>展示状态<select name="status">${["active", "inactive", "archived"].map((x) => `<option value="${x}" ${prEdit.status === x ? "selected" : ""}>${({ active: "展示中", inactive: "已下架", archived: "已归档" } as Record<string,string>)[x]}</option>`).join("")}</select></label>`) : "";
  const list = (kind: string, rows: Row[], key: string, label: (r: Row) => string, summary: (r: Row) => string) =>
    `<div class="admin-list">${rows.map((r) => `<div class="admin-row"><div><strong>${esc(label(r))}</strong><br><small>${esc(summary(r))}</small></div><a class="button small" href="/admin/?${qs}&${key}=${r.id}#records">编辑</a></div>`).join("") || blank("没有匹配记录")}</div>`;
  return `<section id="records" class="section"><h2>村庄、地方志与商品</h2><p>在列表中选“编辑”可修改现有记录；归档或下架为可恢复操作，不会直接删除资料。</p><div class="admin-subnav"><a href="#village-records">村庄（${villages.length}）</a><a href="#chronicle-records">地方志（${chronicles.length}）</a><a href="#product-records">商品（${products.length}）</a></div><section id="village-records"><h3>村庄档案</h3>${villageForm}${list("villages", villages, "editVillage", (r) => String(r.name || "未命名村庄"), (r) => [r.district, r.township, r.population, r.status].filter(Boolean).join(" · "))}</section><section id="chronicle-records"><h3>地方志</h3>${chronicleForm}${list("chronicles", chronicles, "editChronicle", (r) => String(r.title || "无标题"), (r) => [r.category, r.era, r.status].filter(Boolean).join(" · "))}</section><section id="product-records"><h3>本地好物</h3>${productForm}${list("products", products, "editProduct", (r) => String(r.name || "未命名商品"), (r) => ["本地好物", r.price == null ? "未定价" : `¥${r.price}${r.unit ? ` / ${r.unit}` : ""}`, `库存 ${r.stock ?? 0}`, r.status].filter(Boolean).join(" · "))}</section><p>当前每类最多显示 60 条；使用上方搜索可定位更多记录。</p></section>`;
}

function catalogForms() {
  return `<section id="catalog" class="section"><h2>新增内容</h2><details class="info-card"><summary>添加村庄档案</summary><form class="stack" data-api="/api/villages" data-refresh>${input("name", "村庄名称")}${input("district", "区县")}${input("township", "乡镇", "text", false)}${textarea("history", "历史资料")}${input("sourceFile", "资料来源", "text", false)}${feedback}<button class="button">保存村庄</button></form></details><details class="info-card"><summary>添加地方志</summary><form class="stack" data-api="/api/chronicles" data-refresh>${input("title", "标题")}${textarea("content", "正文")}${feedback}<button class="button">保存地方志</button></form></details><details class="info-card"><summary>发布本地好物</summary><form class="stack" data-api="/api/products" data-refresh>${input("name", "商品名称")}${input("price", "价格", "number", true, "", 'min="0" step="0.01"')}${input("unit", "单位（斤、箱、件等）", "text", false, "", 'maxlength="40"')}${input("originalPrice", "原价（选填）", "number", false, "", 'min="0" step="0.01"')}${input("material", "材质 / 品种 / 规格", "text", false, "", 'maxlength="200"')}${input("stock", "库存数量", "number", false, "0", 'min="0" step="1"')}${input("customerService", "客服联系方式（电话、邮箱或 HTTPS 链接）", "text", false, "", 'maxlength="254"')}${input("storeName", "商家 / 供货人", "text", false, "", 'maxlength="120"')}${input("storeAddress", "地址（选填）", "text", false, "", 'maxlength="300"')}${input("storePhone", "商家电话（选填）", "tel", false, "", 'maxlength="40"')}${textarea("images", "商品图片（每行一张，最多 6 张 HTTPS 图片或站内图片地址）", "", false)}${textarea("description", "详情介绍", "", false)}<label>标记为推广内容<select name="isSoftAd"><option value="false">普通商品</option><option value="true">推广内容</option></select></label>${feedback}<button class="button">发布商品</button></form></details></section>`;
}

