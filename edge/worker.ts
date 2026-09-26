import {
  api,
  currentUser,
  HttpError,
  json,
  one,
  all,
  esc,
  requireUser,
  writeGuard,
  body,
  limit,
} from "./core";
import { page, shell } from "./views";
import css from "./site.css";
import client from "./client.js?raw";
import landscape from "./landscape.svg?raw";
const security = {
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Frame-Options": "DENY",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Content-Security-Policy":
    "default-src 'self'; img-src 'self' https: data:; style-src 'self'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
};
const asset = (s: string, type: string) =>
  new Response(s, {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=3600" },
  });
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    let response: Response;
    const url = new URL(req.url);
    try {
      if (url.pathname === "/assets/site.css")
        response = asset(css, "text/css; charset=utf-8");
      else if (url.pathname === "/assets/site.js")
        response = asset(client, "text/javascript; charset=utf-8");
      else if (url.pathname === "/assets/landscape.svg")
        response = asset(landscape, "image/svg+xml");
      else if (
        url.pathname === "/assets/mark.svg" ||
        url.pathname === "/favicon.ico"
      )
        response = asset(
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="8" fill="#234e45"/><text x="24" y="34" text-anchor="middle" font-size="32" font-family="serif" fill="#fff6dd">滨</text></svg>',
          "image/svg+xml",
        );
      else if (url.pathname === "/robots.txt")
        response = asset(
          `User-agent: *\n${env.PREVIEW_READ_ONLY === "true" ? "Disallow: /" : "Allow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /messages/\nSitemap: https://keyi.de5.net/sitemap.xml"}\n`,
          "text/plain",
        );
      else if (url.pathname === "/sitemap.xml") {
        const [vs, ps] = await Promise.all([
          all(
            env.DB,
            "SELECT id FROM villages WHERE status='published' ORDER BY id LIMIT 40000",
          ),
          all(
            env.DB,
            "SELECT slug FROM posts WHERE status='published' ORDER BY id LIMIT 5000",
          ),
        ]);
        const paths = [
          "/",
          "/place/",
          "/blog/",
          "/product/",
          "/about/",
          "/contact/",
          ...vs.map((v) => `/place/${v.id}/`),
          ...ps.map((p) => `/blog/${encodeURIComponent(String(p.slug))}/`),
        ];
        response = asset(
          '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
            paths
              .map((p) => `<url><loc>https://keyi.de5.net${esc(p)}</loc></url>`)
              .join("") +
            "</urlset>",
          "application/xml; charset=utf-8",
        );
        response.headers.set("Cache-Control", "public, max-age=300");
      } else if (url.pathname.startsWith("/api/img/")) {
        if (!["GET", "HEAD"].includes(req.method))
          throw new HttpError(405, "不支持此操作");
        const file = url.pathname.slice(9);
        if (!/^[\w-]+\.(jpe?g|png|webp|gif)$/i.test(file))
          throw new HttpError(404, "图片不存在");
        if (!env.ORACLE_IMG_SERVER?.startsWith("https://"))
          throw new HttpError(503, "图片服务暂不可用");
        const upstream = await fetch(
          env.ORACLE_IMG_SERVER.replace(/\/$/, "") + "/images/" + file,
          {
            method: "GET",
            signal: AbortSignal.timeout(10000),
            redirect: "error",
          },
        );
        if (!upstream.ok)
          throw new HttpError(
            upstream.status === 404 ? 404 : 502,
            "图片暂不可用",
          );
        const type = upstream.headers.get("Content-Type") || "";
        if (!/^image\/(jpeg|png|webp|gif)(;|$)/.test(type))
          throw new HttpError(502, "图片格式异常");
        response = new Response(req.method === "HEAD" ? null : upstream.body, {
          headers: {
            "Content-Type": type,
            "Cache-Control": "public, max-age=86400",
            ...(upstream.headers.get("Content-Length")
              ? { "Content-Length": upstream.headers.get("Content-Length")! }
              : {}),
          },
        });
      } else {
        const user = await currentUser(req, env);
        if (url.pathname.replace(/\/$/, "") === "/api/ai") {
          requireUser(user, true);
          if (!env.AI_HUB_URL?.startsWith("https://"))
            throw new HttpError(503, "AI 服务尚未配置安全连接");
          const headers = { "X-API-Key": env.AI_HUB_KEY || "" };
          if (req.method === "GET") {
            const r = await fetch(
              env.AI_HUB_URL.replace(/\/$/, "") + "/health",
              { headers, signal: AbortSignal.timeout(10000) },
            );
            if (!r.ok) throw new HttpError(502, "AI 服务健康检查失败");
            const health = (await r.json()) as { status?: string };
            if (health.status !== "healthy")
              throw new HttpError(502, "AI 服务状态异常");
            response = json({ aiHub: health });
          } else if (req.method === "POST") {
            writeGuard(req, env);
            await limit(req, env, "ai", 5);
            const b = await body(req);
            if (
              b.action !== "generate" ||
              typeof b.prompt !== "string" ||
              !b.prompt.trim() ||
              b.prompt.length > 5000
            )
              throw new HttpError(400, "请提供有效生成内容");
            const q = new URLSearchParams({
              prompt: b.prompt,
              max_tokens: String(
                Math.min(2000, Math.max(100, Number(b.max_tokens) || 1000)),
              ),
            });
            const r = await fetch(
              env.AI_HUB_URL.replace(/\/$/, "") + "/ai/generate?" + q,
              { method: "POST", headers, signal: AbortSignal.timeout(55000) },
            );
            if (!r.ok) throw new HttpError(502, "AI 生成暂不可用");
            response = json(await r.json());
          } else throw new HttpError(405, "不支持此操作");
        } else if (url.pathname.startsWith("/api/"))
          response = await api(req, env, user);
        else if (!["GET", "HEAD"].includes(req.method))
          throw new HttpError(405, "不支持此操作");
        else if (!url.pathname.endsWith("/")) {
          url.pathname += "/";
          response = Response.redirect(url.toString(), 308);
        } else response = await page(req, env, user);
      }
    } catch (e) {
      const status = e instanceof HttpError ? e.status : 503;
      const message =
        e instanceof HttpError ? e.message : "服务暂时繁忙，请稍后再试";
      if (!(e instanceof HttpError))
        console.error(
          JSON.stringify({
            event: "request_failed",
            path: url.pathname,
            error: e instanceof Error ? e.name : "UnknownError",
          }),
        );
      response = url.pathname.startsWith("/api/")
        ? json({ error: message }, status)
        : shell(
            status === 404 ? "页面未找到" : "暂时无法访问",
            `<div class="container error-page"><strong>${status}</strong><h1>${esc(message)}</h1><p>你可以返回首页，或使用搜索继续探索滨州。</p><a class="button" href="/">返回首页</a> <a class="button secondary" href="/search/">搜索内容</a></div>`,
            url.pathname,
            null,
            env.PREVIEW_READ_ONLY === "true",
            undefined,
            status,
          );
    }
    const out = new Response(
      req.method === "HEAD" ? null : response.body,
      response,
    );
    for (const [k, v] of Object.entries(security)) out.headers.set(k, v);
    if (env.PREVIEW_READ_ONLY === "true")
      out.headers.set("X-Robots-Tag", "noindex, nofollow");
    return out;
  },
};
