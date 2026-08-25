import { eq, desc, like } from "drizzle-orm";
import { chronicles, users } from "../../../src/db/schema";
import { getDB } from "../../_utils/db";
import { verifyToken, getCookie } from "../../_utils/auth";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

async function getCurrentUser(req: Request, env: Env) {
  const token = getCookie(req.headers, "token");
  if (!token) return null;
  const payload = await verifyToken(token, env.JWT_SECRET);
  if (!payload?.userId) return null;
  const db = getDB(env.DB);
  return db.select().from(users).where(eq(users.id, payload.userId as number)).get();
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const url = new URL(context.request.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    const db = getDB(context.env.DB);
    let result;
    if (category) {
      result = await db.select().from(chronicles).where(eq(chronicles.category, category)).orderBy(desc(chronicles.createdAt)).all();
    } else if (search) {
      result = await db.select().from(chronicles).where(like(chronicles.title, `%${search}%`)).orderBy(desc(chronicles.createdAt)).all();
    } else {
      result = await db.select().from(chronicles).orderBy(desc(chronicles.createdAt)).all();
    }

    return new Response(JSON.stringify({ chronicles: result }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "获取失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getCurrentUser(context.request, context.env);
    if (!user || user.role !== "admin") {
      return new Response(JSON.stringify({ error: "无权操作" }), { status: 403, headers: { "Content-Type": "application/json" } });
    }

    const { title, content, category, era, tags } = await context.request.json();
    if (!title || !content) {
      return new Response(JSON.stringify({ error: "缺少必填字段" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const db = getDB(context.env.DB);
    const result = await db.insert(chronicles).values({
      title,
      content,
      category,
      era,
      tags,
    }).returning().get();

    return new Response(JSON.stringify({ chronicle: result }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "创建失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
