import { eq } from "drizzle-orm";
import { users } from "../../../../src/db/schema";
import { getDB } from "../../../_utils/db";
import { verifyPassword, createToken, setCookie } from "../../../_utils/auth";

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { email, password } = await context.request.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "缺少邮箱或密码" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const db = getDB(context.env.DB);
    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user || !user.isActive) {
      return new Response(JSON.stringify({ error: "邮箱或密码错误" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return new Response(JSON.stringify({ error: "邮箱或密码错误" }), { status: 401, headers: { "Content-Type": "application/json" } });
    }

    const token = await createToken({
      userId: user.id,
      username: user.username,
      role: user.role,
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
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    }), { headers });
  } catch (error) {
    console.error("登录错误:", error);
    return new Response(JSON.stringify({ error: "登录失败" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
};
