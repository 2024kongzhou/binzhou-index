"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Tag, Landmark, BookOpen, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Chronicle {
  id: number;
  title: string;
  content: string;
  category: string | null;
  era: string | null;
  tags: string | null;
  status: string;
  createdAt: string | null;
}

export default function ChronicleList() {
  const [chronicles, setChronicles] = useState<Chronicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/chronicles", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setChronicles(data.chronicles || []);
      })
      .catch(() => {
        toast({ title: "获取地方志失败", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const categories = ["全部", ...Array.from(new Set(chronicles.map((c) => c.category).filter(Boolean)))].slice(0, 12);

  const filtered = activeCategory === "全部"
    ? chronicles
    : chronicles.filter((c) => c.category === activeCategory);

  if (loading) {
    return (
      <>
        <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
          <span className="text-sm text-muted-foreground mr-1">分类：</span>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-slate-200 rounded-full animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col overflow-hidden animate-pulse">
              <CardContent className="p-5 md:p-6 space-y-3">
                <div className="h-4 bg-slate-200 rounded w-1/4" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-full" />
                <div className="h-3 bg-slate-200 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </>
    );
  }

  if (chronicles.length === 0) {
    return (
      <div className="text-center py-16 md:py-24">
        <Landmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">暂无地方志数据</p>
        <p className="text-sm text-muted-foreground mt-1">管理员登录后可在后台添加内容</p>
      </div>
    );
  }

  return (
    <>
      {categories.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 md:mb-8">
          <span className="text-sm text-muted-foreground mr-1">分类：</span>
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={activeCategory === cat ? "secondary" : "outline"}
              className={`cursor-pointer transition-colors ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted"
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base md:text-lg leading-snug group-hover:text-blue-600 transition-colors">
                  {item.title}
                </CardTitle>
                {item.category && (
                  <Badge variant="secondary" className="shrink-0 bg-blue-100 text-blue-700 hover:bg-blue-100">
                    {item.category}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3 flex flex-col flex-1">
              <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed flex-1">
                {item.content}
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                {item.era && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {item.era}
                  </span>
                )}
                {item.tags && (
                  <span className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {item.tags}
                  </span>
                )}
                <span className="flex items-center gap-1 ml-auto">
                  <BookOpen className="h-3 w-3" />
                  {item.createdAt ? new Date(item.createdAt).toLocaleDateString("zh-CN") : "近期"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && activeCategory !== "全部" && (
        <div className="text-center py-12 text-muted-foreground">
          <p>该分类下暂无内容</p>
        </div>
      )}
    </>
  );
}
