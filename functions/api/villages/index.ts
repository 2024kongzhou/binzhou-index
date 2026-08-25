import { eq, desc, like, and, sql } from "drizzle-orm";
import { villages, users } from "../../../src/db/schema";
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
    const district = url.searchParams.get("district");
    const township = url.searchParams.get("township");
    const search = url.searchParams.get("search");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "20", 10), 100);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    const db = getDB(context.env.DB);

    const conditions = [];
    if (district) conditions.push(eq(villages.district, district));
    if (township) conditions.push(like(villages.township, `%${township}%`));
    if (search) conditions.push(like(villages.name, `%${search}%`));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select()
      .from(villages)
      .where(whereClause)
      .orderBy(desc(villages.createdAt))
      .limit(limit)
      .offset(offset)
      .all();

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(villages)
      .where(whereClause)
      .get();

    return new Response(
      JSON.stringify({
        villages: result,
        pagination: {
          limit,
          offset,
          total: countResult?.count || 0,
        },
      }),
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: "获取失败", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getCurrentUser(context.request, context.env);
    if (!user || user.role !== "admin") {
      return new Response(JSON.stringify({ error: "无权操作" }), {
        status: 403,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const { name, district, township, location, population, farmland, surnames, history, evolution, remark, versionTag, sourceFile } = await context.request.json();
    if (!name) {
      return new Response(JSON.stringify({ error: "村庄名称必填" }), {
        status: 400,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      });
    }

    const db = getDB(context.env.DB);
    const result = await db
      .insert(villages)
      .values({
        name,
        district,
        township,
        location,
        population,
        farmland,
        surnames,
        history,
        evolution,
        remark,
        versionTag,
        sourceFile,
      })
      .returning()
      .get();

    return new Response(JSON.stringify({ village: result }), {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "创建失败", detail: String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }
};
