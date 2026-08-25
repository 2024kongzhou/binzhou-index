import type { Metadata } from "next";
import { FileText } from "lucide-react";
import BlogList from "./blog-list";

export const metadata: Metadata = {
  title: "滨州故事 - 本地新闻、历史文化、城市记忆｜滨州索引",
  description: "发现滨州的精彩故事——本地新闻、历史文化、城市记忆与生活点滴。滨州索引记录滨州人的故事。",
};

export default function BlogPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-slate-900 to-amber-950 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-amber-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
              <FileText className="h-4 w-4 text-amber-400" />
              发现故事 · 分享生活
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">滨州故事</h1>
            <p className="text-base md:text-lg text-amber-100/80 max-w-2xl mx-auto leading-relaxed px-4">
              发现滨州的精彩故事——本地新闻、历史文化、城市记忆与生活点滴
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Posts Grid */}
      <section className="py-8 md:py-12 container">
        <BlogList />
      </section>
    </div>
  );
}
