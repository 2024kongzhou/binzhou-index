import { sql, eq } from "drizzle-orm";
import { villages, posts, products, chronicles } from "../../../src/db/schema";
import { getDB } from "../../_utils/db";

export interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const db = getDB(context.env.DB);
    const [villageCount, postCount, productCount, chronicleCount] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(villages).get(),
      db.select({ count: sql<number>`count(*)` }).from(posts).where(eq(posts.status, "published")).get(),
      db.select({ count: sql<number>`count(*)` }).from(products).get(),
      db.select({ count: sql<number>`count(*)` }).from(chronicles).get(),
    ]);

    return new Response(
      JSON.stringify({
        villages: villageCount?.count || 0,
        posts: postCount?.count || 0,
        products: productCount?.count || 0,
        chronicles: chronicleCount?.count || 0,
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
