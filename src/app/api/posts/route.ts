import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { posts, users } from "@/db/schema";
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
    const status = searchParams.get("status") || "published";
    const search = searchParams.get("search");

    let query;
    if (search) {
      query = db.select().from(posts).where(like(posts.title, `%${search}%`)).orderBy(desc(posts.createdAt));
    } else {
      query = db.select().from(posts).where(eq(posts.status, status as any)).orderBy(desc(posts.createdAt));
    }

    const result = query.all();
    return NextResponse.json({ posts: result });
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

    const { title, slug, content, excerpt, coverImage, status } = await req.json();
    if (!title || !slug || !content) {
      return NextResponse.json({ error: "缺少必填字段" }, { status: 400 });
    }

    const result = db.insert(posts).values({
      title,
      slug,
      content,
      excerpt,
      coverImage,
      status: status || "draft",
      authorId: user.id,
    }).returning().get();

    return NextResponse.json({ post: result });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
