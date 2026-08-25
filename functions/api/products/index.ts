import { eq, desc, like } from "drizzle-orm";
import { products, users } from "../../../src/db/schema";
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
    const search = url.searchParams.get("search");

    const db = getDB(context.env.DB);
    let result;
    if (search) {
      result = await db.select().from(products).where(like(products.name, `%${search}%`)).orderBy(desc(products.createdAt)).all();
    } else {
      result = await db.select().from(products).orderBy(desc(products.createdAt)).all();
    }

    return new Response(JSON.stringify({ products: result }), { headers: { "Content-Type": "application/json" } });
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

    const { name, description, price, originalPrice, images, stock, storeName, storeAddress, storePhone, isSoftAd } = await context.request.json();
    if (!name) {
      return new Response(JSON.stringify({ error: "商品名称必填" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const db = getDB(context.env.DB);
    const result = await db.insert(products).values({
      name,
      description,
      price,
      originalPrice,
      images,
      stock,
      storeName,
      storeAddress,
      storePhone,
      isSoftAd: isSoftAd || false,
    }).returning().get();

    return new Response(JSON.stringify({ product: result }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "创建失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
