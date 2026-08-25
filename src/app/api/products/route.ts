import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, users } from "@/db/schema";
import { verifyToken } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";

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
    const status = searchParams.get("status") || "active";

    const result = db
      .select()
      .from(products)
      .where(eq(products.status, status as any))
      .orderBy(desc(products.createdAt))
      .all();

    return NextResponse.json({ products: result });
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

    const { name, description, price, originalPrice, images, stock, storeName, storeAddress, storePhone } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "商品名称必填" }, { status: 400 });
    }

    const result = db.insert(products).values({
      name,
      description,
      price,
      originalPrice,
      images,
      stock: stock || 0,
      storeName,
      storeAddress,
      storePhone,
    }).returning().get();

    return NextResponse.json({ product: result });
  } catch {
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
