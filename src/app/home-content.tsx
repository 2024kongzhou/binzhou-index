"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Landmark,
  FileText,
  Store,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShoppingBag,
} from "lucide-react";

interface Stats {
  chronicles: number;
  posts: number;
  products: number;
}

interface Chronicle {
  id: number;
  title: string;
  content: string;
  category: string | null;
  era: string | null;
}

interface Post {
  id: number;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  aiGenerated: boolean | null;
  createdAt: string | null;
}

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  originalPrice: number | null;
  images: string | null;
  isSoftAd: boolean | null;
  storeName: string | null;
}

function AnimatedNumber({ value }: { value: number }) {
  return (
    <span className="text-3xl font-bold tabular-nums">
      {value}
    </span>
  );
}

export default function HomeContent() {
  const [stats, setStats] = useState<Stats>({ chronicles: 0, posts: 0, products: 0 });
  const [chronicles, setChronicles] = useState<Chronicle[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/chronicles", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const list = data.chronicles || [];
        setChronicles(list.slice(0, 3));
        setStats((s) => ({ ...s, chronicles: list.length }));
      });

    fetch("/api/posts", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const list = data.posts || [];
        setPosts(list.slice(0, 3));
        setStats((s) => ({ ...s, posts: list.length }));
      });

    fetch("/api/products", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        const list = data.products || [];
        setProducts(list.slice(0, 4));
        setStats((s) => ({ ...s, products: list.length }));
      });
  }, []);

  return (
    <>
      {/* Stats Section */}
      <section className="py-8 md:py-12 relative z-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-white/20 shrink-0">
                  <Landmark className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <div>
                  <AnimatedNumber value={stats.chronicles} />
                  <div className="text-blue-100 text-sm">地方志条目</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-white/20 shrink-0">
                  <FileText className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <div>
                  <AnimatedNumber value={stats.posts} />
                  <div className="text-amber-100 text-sm">博客文章</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-white/20 shrink-0">
                  <Store className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <div>
                  <AnimatedNumber value={stats.products} />
                  <div className="text-emerald-100 text-sm">本地商品</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Chronicles Preview */}
      <section className="py-12 md:py-20 container">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">地方志精选</h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">探寻滨州的历史文化根脉</p>
          </div>
          <Link href="/place/">
            <Button variant="ghost" className="gap-1 shrink-0">
              查看全部 <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {chronicles.map((c) => (
            <Card key={c.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col">
              <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {c.category || "其他"}
                  </Badge>
                  {c.era && (
                    <Badge variant="outline" className="text-xs">
                      {c.era}
                    </Badge>
                  )}
                </div>
                <h3 className="text-lg md:text-xl font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                  {c.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed flex-1">
                  {c.content}
                </p>
                <Link href="/place/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 gap-1 mt-auto pt-2">
                  阅读更多 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
          {chronicles.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              暂无地方志数据
            </div>
          )}
        </div>
      </section>

      {/* Posts Preview */}
      <section className="py-12 md:py-20 container">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold">最新故事</h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">发现滨州的精彩故事</p>
          </div>
          <Link href="/blog/">
            <Button variant="ghost" className="gap-1 shrink-0">
              查看全部 <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col">
              {post.coverImage && (
                <div className="aspect-video bg-muted overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <CardContent className="p-5 md:p-6 space-y-3 flex flex-col flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.aiGenerated && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      <Sparkles className="h-3 w-3 mr-1" /> AI 生成
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString("zh-CN") : "近期"}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                  {post.excerpt || "暂无摘要"}
                </p>
                <Link href="/blog/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 gap-1 mt-auto pt-2">
                  阅读全文 <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                </Link>
              </CardContent>
            </Card>
          ))}
          {posts.length === 0 && (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              暂无文章，敬请期待
            </div>
          )}
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-slate-50 to-background">
        <div className="container">
          <div className="flex items-end justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">本地推荐</h2>
              <p className="text-muted-foreground mt-1 text-sm md:text-base">滨州特色商品与服务</p>
            </div>
            <Link href="/product/">
              <Button variant="ghost" className="gap-1 shrink-0">
                查看全部 <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p) => (
              <Card key={p.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 flex flex-col">
                <CardContent className="p-5 md:p-6 space-y-3 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                      {p.name}
                    </h3>
                    {p.isSoftAd && (
                      <Badge variant="outline" className="text-xs shrink-0">广告</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{p.description || "暂无描述"}</p>
                  <div className="flex items-baseline gap-2 pt-1">
                    {p.price != null && (
                      <span className="text-xl md:text-2xl font-bold text-amber-600">¥{p.price}</span>
                    )}
                    {p.originalPrice != null && (
                      <span className="text-sm text-muted-foreground line-through">¥{p.originalPrice}</span>
                    )}
                  </div>
                  {p.storeName && (
                    <p className="text-xs text-muted-foreground">{p.storeName}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {products.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                暂无商品，敬请期待
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
