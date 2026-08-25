"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MapPin,
  BookOpen,
  ShoppingBag,
  Newspaper,
  ArrowRight,
  Landmark,
  Users,
  FileText,
  Store,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface Chronicle {
  id: number;
  title: string;
  content: string;
  category?: string;
  era?: string;
  tags?: string;
}

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  aiGenerated: boolean;
  createdAt: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  storeName?: string;
  isSoftAd: boolean;
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

export default function HomePage() {
  const [chronicles, setChronicles] = useState<Chronicle[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({ chronicles: 0, posts: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/chronicles").then((r) => r.ok ? r.json() : { chronicles: [] }),
      fetch("/api/posts").then((r) => r.ok ? r.json() : { posts: [] }),
      fetch("/api/products").then((r) => r.ok ? r.json() : { products: [] }),
    ]).then(([cData, pData, prData]) => {
      const c = cData.chronicles || [];
      const p = pData.posts || [];
      const pr = prData.products || [];
      setChronicles(c.slice(0, 3));
      setPosts(p.slice(0, 3));
      setProducts(pr.slice(0, 4));
      setStats({ chronicles: c.length, posts: p.length, products: pr.length });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="container relative z-10 py-24 md:py-36">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
              <Sparkles className="h-4 w-4 text-amber-400" />
              记录滨州 · 服务生活
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              滨州
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                索引
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed">
              黄河之畔的璀璨明珠，孙子故里的文化圣地
              <br className="hidden md:block" />
              一站式地名志与本地生活服务平台
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link href="/place">
                <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8">
                  <Landmark className="h-5 w-5" />
                  探索地方志
                </Button>
              </Link>
              <Link href="/product">
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 px-8">
                  <ShoppingBag className="h-5 w-5" />
                  浏览商品
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-12 -mt-12 relative z-20">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white border-0 shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-white/20">
                  <Landmark className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {loading ? <Skeleton className="h-9 w-16 bg-white/20" /> : <AnimatedCounter target={stats.chronicles} />}
                  </div>
                  <div className="text-blue-100 text-sm">地方志条目</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0 shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-white/20">
                  <FileText className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {loading ? <Skeleton className="h-9 w-16 bg-white/20" /> : <AnimatedCounter target={stats.posts} />}
                  </div>
                  <div className="text-amber-100 text-sm">博客文章</div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white border-0 shadow-lg">
              <CardContent className="flex items-center gap-4 p-6">
                <div className="p-3 rounded-xl bg-white/20">
                  <Store className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-3xl font-bold">
                    {loading ? <Skeleton className="h-9 w-16 bg-white/20" /> : <AnimatedCounter target={stats.products} />}
                  </div>
                  <div className="text-emerald-100 text-sm">本地商品</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Chronicles Preview */}
      <section className="py-16 container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">地方志精选</h2>
            <p className="text-muted-foreground mt-1">探寻滨州的历史文化根脉</p>
          </div>
          <Link href="/place">
            <Button variant="ghost" className="gap-1">
              查看全部 <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))
            : chronicles.map((c) => (
                <Card key={c.id} className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        {c.category || "其他"}
                      </Badge>
                      {c.era && (
                        <Badge variant="outline" className="text-xs">
                          {c.era}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold group-hover:text-blue-600 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {c.content}
                    </p>
                    <Link href="/place">
                      <Button variant="link" className="p-0 h-auto text-blue-600 gap-1">
                        阅读更多 <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-3">一站式本地服务平台</h2>
            <p className="text-muted-foreground">
              集地方志、博客、商品展示于一体，为滨州市民提供全面的本地信息服务
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: MapPin, title: "地方志", desc: "收录滨州历史、地理、人物、风俗等地方性知识", color: "bg-blue-100 text-blue-600" },
              { icon: BookOpen, title: "博客文章", desc: "本地新闻、文化故事、生活随笔等内容分享", color: "bg-amber-100 text-amber-600" },
              { icon: ShoppingBag, title: "商品展示", desc: "本地优质商品推荐，支持线下体验店引流", color: "bg-emerald-100 text-emerald-600" },
              { icon: Newspaper, title: "本地资讯", desc: "实时更新的本地资讯，掌握滨州动态", color: "bg-rose-100 text-rose-600" },
            ].map((item) => (
              <Card key={item.title} className="group hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Posts Preview */}
      <section className="py-16 container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">最新文章</h2>
            <p className="text-muted-foreground mt-1">发现滨州的精彩故事</p>
          </div>
          <Link href="/blog">
            <Button variant="ghost" className="gap-1">
              查看全部 <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            : posts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      {post.aiGenerated && (
                        <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                          <Sparkles className="h-3 w-3 mr-1" /> AI 生成
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {post.excerpt || "暂无摘要"}
                    </p>
                    <Link href="/blog">
                      <Button variant="link" className="p-0 h-auto text-blue-600 gap-1">
                        阅读全文 <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-background">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">本地推荐</h2>
              <p className="text-muted-foreground mt-1">滨州特色商品与服务</p>
            </div>
            <Link href="/product">
              <Button variant="ghost" className="gap-1">
                查看全部 <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-8 w-1/3" />
                    </CardContent>
                  </Card>
                ))
              : products.map((p) => (
                  <Card key={p.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0">
                    <CardContent className="p-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                          {p.name}
                        </h3>
                        {p.isSoftAd && (
                          <Badge variant="outline" className="text-xs shrink-0 ml-2">广告</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>
                      <div className="flex items-baseline gap-2 pt-1">
                        {p.price && (
                          <span className="text-2xl font-bold text-amber-600">¥{p.price}</span>
                        )}
                        {p.originalPrice && (
                          <span className="text-sm text-muted-foreground line-through">¥{p.originalPrice}</span>
                        )}
                      </div>
                      {p.storeName && (
                        <p className="text-xs text-muted-foreground">{p.storeName}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-12 md:p-16">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">需要窗帘测量或墙布施工？</h2>
              <p className="text-blue-100/80 text-lg">
                立即预约，专业团队免费上门服务
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link href="/contact">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-8 gap-2">
                    立即预约
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/product">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8">
                    浏览更多商品
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
