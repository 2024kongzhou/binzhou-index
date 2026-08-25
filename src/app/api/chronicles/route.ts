import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chronicles, users } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, desc, like } from "drizzle-orm";

async function getCurrentUser(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload?.userId) return null;
  return db.select().from(users).where(eq(users.id, payload.userId as number)).get();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let result;
    if (category) {
      result = db.select().from(chronicles).where(eq(chronicles.category, category)).orderBy(desc(chronicles.createdAt)).all();
    } else if (search) {
      result = db.select().from(chronicles).where(like(chronicles.title, `%${search}%`)).orderBy(desc(chronicles.createdAt)).all();
    } else {
      result = db.select().from(chronicles).orderBy(desc(chronicles.createdAt)).all();
    }

    return NextResponse.json({ chronicles: result });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "无权操作" }, { status: 403 });
    }

    const { title, content, category, era, tags } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const result = db.insert(chronicles).values({
      title,
      content,
      category,
      era,
      tags,
    }).returning().get();

    return NextResponse.json({ chronicle: result });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
