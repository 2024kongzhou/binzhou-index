import { eq, desc, like, sql } from "drizzle-orm";
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
    const slug = url.searchParams.get("slug");
    const limitParam = url.searchParams.get("limit");
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    const db = getDB(context.env.DB);

    if (slug) {
      const post = await db.select().from(posts).where(eq(posts.slug, slug)).get();
      return new Response(JSON.stringify({ post: post || null }), {
        headers: { "Content-Type": "application/json; charset=utf-8" },
        status: post ? 200 : 404,
      });
    }

    const whereClause = search ? like(posts.title, `%${search}%`) : eq(posts.status, status);
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(posts).where(whereClause).get();
    let query = db.select().from(posts).where(whereClause).orderBy(desc(posts.createdAt));
    if (limitParam) {
      const limit = Math.min(parseInt(limitParam, 10) || 20, 100);
      query = query.limit(limit).offset(offset) as typeof query;
    }
    const result = await query.all();

    return new Response(
      JSON.stringify({
        posts: result,
        pagination: { total: countResult?.count || result.length, offset },
      }),
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
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
