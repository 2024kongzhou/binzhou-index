import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { messages, users } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, and, or, desc } from "drizzle-orm";

async function getCurrentUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.userId) return null;
  return db.select().from(users).where(eq(users.id, payload.userId as number)).get();
}

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const result = db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.senderId, user.id),
          eq(messages.receiverId, user.id)
        )
      )
      .orderBy(desc(messages.createdAt))
      .all();

    return NextResponse.json({ messages: result });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const { receiverId, content } = await req.json();
    if (!receiverId || !content?.trim()) {
      return NextResponse.json({ error: "缺少内容" }, { status: 400 });
    }

    const receiver = db.select().from(users).where(eq(users.id, receiverId)).get();
    if (!receiver || receiver.role !== "admin") {
      return NextResponse.json({ error: "只能给管理员发送私信" }, { status: 403 });
    }

    const result = db.insert(messages).values({
      senderId: user.id,
      receiverId,
      content: content.trim(),
    }).returning().get();

    return NextResponse.json({ message: result });
  } catch {
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}
