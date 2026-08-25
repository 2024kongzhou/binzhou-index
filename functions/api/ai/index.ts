import { verifyToken, getCookie } from "../../_utils/auth";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
  AI_HUB_URL: string;
  AI_HUB_KEY: string;
}

const DEFAULT_HUB = "http://138.2.54.176:8000";

function hubUrl(env: Env): string {
  return (env.AI_HUB_URL || DEFAULT_HUB).replace(/\/$/, "");
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function isAdmin(req: Request, env: Env): Promise<boolean> {
  const token = getCookie(req.headers, "token");
  if (!token) return false;
  const payload = await verifyToken(token, env.JWT_SECRET);
  return payload?.role === "admin";
}

async function hubFetch(env: Env, path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});
  headers.set("X-API-Key", env.AI_HUB_KEY || "");
  return fetch(`${hubUrl(env)}${path}`, { ...init, headers, signal: AbortSignal.timeout(55000) });
}

// GET /api/ai -> AI 中枢运行状态（公开，只读健康检查 + 最新新闻）
export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const [healthRes, newsRes] = await Promise.all([
      hubFetch(context.env, "/health"),
      hubFetch(context.env, "/news/latest?limit=5"),
    ]);
    const health = await healthRes.json().catch(() => ({}));
    const news = await newsRes.json().catch(() => ({}));
    return json({ aiHub: health, latestNews: news });
  } catch (e) {
    return json({ error: "AI 中枢不可达", detail: String(e) }, 502);
  }
};

// POST /api/ai -> 管理员调用 AI 中枢能力
// body: { action: "generate", prompt, system?, max_tokens? }
//       { action: "trigger", task: "crawl" | "security" | "report" | "blog" }
export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!(await isAdmin(context.request, context.env))) {
    return json({ error: "无权操作" }, 403);
  }

  let body: { action?: string; prompt?: string; system?: string; max_tokens?: number; task?: string };
  try {
    body = await context.request.json();
  } catch {
    return json({ error: "请求体必须是 JSON" }, 400);
  }

  try {
    if (body.action === "generate") {
      if (!body.prompt) return json({ error: "缺少 prompt" }, 400);
      const q = new URLSearchParams({
        prompt: body.prompt,
        system: body.system || "",
        max_tokens: String(Math.min(body.max_tokens || 1000, 4000)),
      });
      const r = await hubFetch(context.env, `/ai/generate?${q}`, { method: "POST" });
      return json(await r.json(), r.status as 200);
    }

    if (body.action === "trigger") {
      const allowed = ["crawl", "security", "report", "blog"];
      if (!body.task || !allowed.includes(body.task)) {
        return json({ error: `task 必须是 ${allowed.join("/")}` }, 400);
      }
      const r = await hubFetch(context.env, `/trigger/${body.task}`, { method: "POST" });
      return json(await r.json(), r.status as 200);
    }

    return json({ error: "action 必须是 generate 或 trigger" }, 400);
  } catch (e) {
    return json({ error: "AI 中枢请求失败", detail: String(e) }, 502);
  }
};
