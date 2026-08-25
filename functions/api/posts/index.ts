import { eq, desc, like } from "drizzle-orm";
import { posts, users } from "../../../src/db/schema";
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
    const status = url.searchParams.get("status") || "published";
    const search = url.searchParams.get("search");

    const db = getDB(context.env.DB);
    let result;
    if (search) {
      result = await db.select().from(posts).where(like(posts.title, `%${search}%`)).orderBy(desc(posts.createdAt)).all();
    } else {
      result = await db.select().from(posts).where(eq(posts.status, status)).orderBy(desc(posts.createdAt)).all();
    }

    return new Response(JSON.stringify({ posts: result }), { headers: { "Content-Type": "application/json" } });
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

    const { title, slug, content, excerpt, coverImage, status } = await context.request.json();
    if (!title || !slug || !content) {
      return new Response(JSON.stringify({ error: "缺少必填字段" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const db = getDB(context.env.DB);
    const result = await db.insert(posts).values({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      status: status || "draft",
      authorId: user.id,
    }).returning().get();

    return new Response(JSON.stringify({ post: result }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "创建失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
