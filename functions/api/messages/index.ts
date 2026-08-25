import { eq, desc } from "drizzle-orm";
import { messages, users } from "../../../src/db/schema";
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
    const user = await getCurrentUser(context.request, context.env);
    if (!user) {
      return new Response(JSON.stringify({ error: "未登录" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const db = getDB(context.env.DB);
    let result;
    if (user.role === "admin") {
      result = await db.select().from(messages).orderBy(desc(messages.createdAt)).all();
    } else {
      result = await db.select().from(messages)
        .where(eq(messages.senderId, user.id))
        .orderBy(desc(messages.createdAt)).all();
    }

    return new Response(JSON.stringify({ messages: result }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "获取失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const user = await getCurrentUser(context.request, context.env);
    if (!user) {
      return new Response(JSON.stringify({ error: "未登录" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const { content } = await context.request.json();
    if (!content) {
      return new Response(JSON.stringify({ error: "内容不能为空" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const db = getDB(context.env.DB);
    const admin = await db.select().from(users).where(eq(users.role, "admin")).get();
    const receiverId = admin ? admin.id : 1;

    const result = await db.insert(messages).values({
      senderId: user.id,
      receiverId,
      content,
    }).returning().get();

    return new Response(JSON.stringify({ message: result }), { headers: { "Content-Type": "application/json" } });
  } catch {
    return new Response(JSON.stringify({ error: "发送失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
