import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, BookOpen, ShoppingBag, Newspaper, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 bg-gradient-to-b from-primary/5 to-background">
        <div className="container text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            滨州索引
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            滨州地名志与综合服务平台，记录地方文化，服务本地生活
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/place">
              <Button size="lg" className="gap-2">
                <MapPin className="h-4 w-4" />
                探索地方志
              </Button>
            </Link>
            <Link href="/product">
              <Button size="lg" variant="outline" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                浏览商品
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>地方志</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                收录滨州历史、地理、人物、风俗等地方性知识
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>博客文章</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                本地新闻、文化故事、生活随笔等内容分享
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <ShoppingBag className="h-8 w-8 text-primary mb-2" />
              <CardTitle>商品展示</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                本地优质商品推荐，支持线下体验店引流
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Newspaper className="h-8 w-8 text-primary mb-2" />
              <CardTitle>本地新闻</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                实时更新的本地资讯，掌握滨州动态
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-muted/50">
        <div className="container text-center space-y-6">
          <h2 className="text-3xl font-bold">需要窗帘测量或墙布施工？</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            立即预约，免费上门服务
          </p>
          <Link href="/contact">
            <Button size="lg" className="gap-2">
              立即预约
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
