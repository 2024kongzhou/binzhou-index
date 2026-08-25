import { eq } from "drizzle-orm";
import { users } from "../../../../src/db/schema";
import { getDB } from "../../../_utils/db";
import { verifyToken, getCookie } from "../../../_utils/auth";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const token = getCookie(context.request.headers, "token");
    if (!token) {
      return new Response(JSON.stringify({ error: "未登录" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const payload = await verifyToken(token, context.env.JWT_SECRET);
    if (!payload?.userId) {
      return new Response(JSON.stringify({ error: "未登录" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const db = getDB(context.env.DB);
    const user = await db.select().from(users).where(eq(users.id, payload.userId as number)).get();
    if (!user) {
      return new Response(JSON.stringify({ error: "用户不存在" }), { status: 404, headers: { "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "获取失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
