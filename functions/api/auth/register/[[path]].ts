import { eq } from "drizzle-orm";
import { users } from "../../../../src/db/schema";
import { getDB } from "../../../_utils/db";
import { hashPassword, createToken, setCookie } from "../../../_utils/auth";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { username, email, password } = await context.request.json();

    if (!username || !email || !password) {
      return new Response(JSON.stringify({ error: "缺少必填字段" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (password.length < 6) {
      return new Response(JSON.stringify({ error: "密码至少6位" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const db = getDB(context.env.DB);
    const existing = await db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      return new Response(JSON.stringify({ error: "邮箱已注册" }), { status: 409, headers: { "Content-Type": "application/json" } });
    }

    const passwordHash = await hashPassword(password);
    const result = await db.insert(users).values({
      username,
      email,
      passwordHash,
      role: "user",
    }).returning().get();

    const token = await createToken({
      userId: result.id,
      username: result.username,
      role: result.role,
    }, context.env.JWT_SECRET);

    const headers = new Headers({ "Content-Type": "application/json" });
    setCookie(headers, "token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return new Response(JSON.stringify({
      user: { id: result.id, username, email, role: result.role },
    }), { headers });
  } catch (error) {
    console.error("注册错误:", error);
    return new Response(JSON.stringify({ error: "注册失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
