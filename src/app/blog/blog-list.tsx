"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";

interface Post {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  status: string;
  aiGenerated: boolean | null;
  authorId: number | null;
  publishedAt: string | null;
  createdAt: string | null;
}

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/posts", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
      })
      .catch(() => {
        toast({ title: "获取文章失败", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col overflow-hidden animate-pulse">
            <div className="aspect-video bg-slate-200" />
            <CardContent className="p-5 md:p-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 md:py-24">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">暂无故事</p>
        <p className="text-sm text-muted-foreground mt-1">管理员登录后可在后台添加内容</p>
      </div>
    );
  }

  return (
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
              阅读全文 <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
