import type { Metadata } from "next";
import { Store } from "lucide-react";
import ProductList from "./product-list";

export const metadata: Metadata = {
  title: "本地推荐 - 滨州特色商品与优质商家｜滨州索引",
  description: "发现滨州本地优质商品与特色商家，从特产美食到家居服务，支持线下体验店引流。滨州索引为您推荐靠谱的本地好店。",
};

export default function ProductPage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-emerald-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-amber-500 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
              <Store className="h-4 w-4 text-amber-400" />
              品质优选 · 本地服务
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">本地推荐</h1>
            <p className="text-base md:text-lg text-emerald-100/80 max-w-2xl mx-auto leading-relaxed px-4">
              发现滨州本地优质商品与特色商家，支持线下体验店引流
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Products Grid */}
      <section className="py-8 md:py-12 container">
        <ProductList />
      </section>
    </div>
  );
}
