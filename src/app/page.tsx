import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  BookOpen,
  ShoppingBag,
  Newspaper,
  Landmark,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import HomeContent from "./home-content";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
        <div className="container relative z-10 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
              <Sparkles className="h-4 w-4 text-amber-400" />
              记录滨州 · 服务生活
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              滨州
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                索引
              </span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 max-w-2xl mx-auto leading-relaxed px-4">
              黄河之畔的璀璨明珠，孙子故里的文化圣地
              <br className="hidden md:block" />
              一站式地名志与本地生活服务平台
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4 pt-2">
              <Link href="/place/">
                <Button size="lg" className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-6 md:px-8">
                  <Landmark className="h-5 w-5" />
                  探索地方志
                </Button>
              </Link>
              <Link href="/product/">
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 px-6 md:px-8">
                  <ShoppingBag className="h-5 w-5" />
                  浏览商品
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Grid */}
      <section className="py-12 md:py-20 bg-muted/30">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">一站式本地服务平台</h2>
            <p className="text-muted-foreground text-sm md:text-base">
              集地方志、博客、商品展示于一体，为滨州市民提供全面的本地信息服务
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { icon: MapPin, title: "地方志", desc: "收录滨州历史、地理、人物、风俗等地方性知识", color: "bg-blue-100 text-blue-600" },
              { icon: BookOpen, title: "滨州故事", desc: "本地新闻、文化故事、城市记忆与生活点滴", color: "bg-amber-100 text-amber-600" },
              { icon: ShoppingBag, title: "商品展示", desc: "本地优质商品推荐，支持线下体验店引流", color: "bg-emerald-100 text-emerald-600" },
              { icon: Newspaper, title: "本地资讯", desc: "实时更新的本地资讯，掌握滨州动态", color: "bg-rose-100 text-rose-600" },
            ].map((item) => (
              <Card key={item.title} className="group hover:shadow-xl transition-all duration-300 border-0">
                <CardContent className="p-5 md:p-6 space-y-3 md:space-y-4">
                  <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <HomeContent />

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 md:p-12 lg:p-16">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-amber-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-blue-500 rounded-full blur-3xl" />
            </div>
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4 md:space-y-6">
              <h2 className="text-2xl md:text-4xl font-bold">发现滨州本地服务</h2>
              <p className="text-blue-100/80 text-base md:text-lg">
                从窗帘布艺到特色特产，从家居美学到地道风味，探索滨州本地优质商家与服务
              </p>
              <div className="flex flex-wrap justify-center gap-3 md:gap-4 pt-2">
                <Link href="/contact/">
                  <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold px-6 md:px-8 gap-2">
                    联系商家
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/product/">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-6 md:px-8">
                    浏览本地推荐
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
