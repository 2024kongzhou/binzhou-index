import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, createToken } from "@/lib/auth";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "密码至少6位" }, { status: 400 });
    }

    const existing = db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      return NextResponse.json({ error: "邮箱已注册" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const result = db.insert(users).values({
      username,
      email,
      passwordHash,
      role: "user",
    }).returning().get();

    const token = await createToken({
      userId: result.id,
      username: result.username,
      role: result.role,
    });

    const response = NextResponse.json({
      user: { id: result.id, username, email, role: result.role },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("注册错误:", error);
    return NextResponse.json({ error: "注册失败" }, { status: 500 });
  }
}
