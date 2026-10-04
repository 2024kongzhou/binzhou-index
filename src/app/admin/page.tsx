"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Shield,
  FileText,
  ShoppingBag,
  BookOpen,
  Users,
  MessageSquare,
  Plus,
} from "lucide-react";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  // Form states
  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [postContent, setPostContent] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [chronicleTitle, setChronicleTitle] = useState("");
  const [chronicleContent, setChronicleContent] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data?.user || data.user.role !== "admin") {
          router.push("/");
          return;
        }
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => router.push("/"));
  }, [router]);

  const createPost = async () => {
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: postTitle,
          slug: postSlug || postTitle.toLowerCase().replace(/\s+/g, "-"),
          content: postContent,
          status: "published",
        }),
      });
      if (res.ok) {
        toast({ title: "文章创建成功" });
        setPostTitle(""); setPostSlug(""); setPostContent("");
      }
    } catch {
      toast({ title: "创建失败", variant: "destructive" });
    }
  };

  const createProduct = async () => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: productName,
          price: parseFloat(productPrice),
        }),
      });
      if (res.ok) {
        toast({ title: "商品创建成功" });
        setProductName(""); setProductPrice("");
      }
    } catch {
      toast({ title: "创建失败", variant: "destructive" });
    }
  };

  const createChronicle = async () => {
    try {
      const res = await fetch("/api/chronicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: chronicleTitle,
          content: chronicleContent,
        }),
      });
      if (res.ok) {
        toast({ title: "地方志创建成功" });
        setChronicleTitle(""); setChronicleContent("");
      }
    } catch {
      toast({ title: "创建失败", variant: "destructive" });
    }
  };

  if (loading) return null;

  return (
    <div className="container py-12">
      <div className="flex items-center gap-2 mb-8">
        <Shield className="h-6 w-6" />
        <h1 className="text-3xl font-bold">管理后台</h1>
      </div>

      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="overview" className="gap-1"><Activity className="h-4 w-4" /> 运行状况</TabsTrigger>
          <TabsTrigger value="posts" className="gap-1">
            <FileText className="h-4 w-4" /> 文章
          </TabsTrigger>
          <TabsTrigger value="products" className="gap-1">
            <ShoppingBag className="h-4 w-4" /> 商品
          </TabsTrigger>
          <TabsTrigger value="chronicles" className="gap-1">
            <BookOpen className="h-4 w-4" /> 地方志
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-1">
            <Users className="h-4 w-4" /> 用户
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[["已发布文章", metrics?.posts ?? 0, "符合公开展示规则"], ["村庄档案", metrics?.villages ?? 0, "已公开记录"], ["本地好物", metrics?.products ?? 0, "正在展示"], ["待审核评论", (overview?.comments || []).filter((x: any) => x.status === "pending").length, "需要管理员处理"]].map(([label, value, hint]) => (
              <Card key={String(label)}><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader><CardContent><div className="text-3xl font-semibold">{value}</div><p className="mt-1 text-xs text-muted-foreground">{hint}</p></CardContent></Card>
            ))}
          </div>
          <Card className="mt-6"><CardHeader><CardTitle>发布与服务状态</CardTitle></CardHeader><CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border p-4"><p className="font-medium">网站运行</p><p className="mt-1 text-sm text-emerald-600">正常 · Cloudflare Pages / D1</p></div>
            <div className="rounded-lg border p-4"><p className="font-medium">每日文章任务</p><p className="mt-1 text-sm text-emerald-600">已配置 · 北京时间每天 07:00</p></div>
            <div className="rounded-lg border p-4"><p className="font-medium">文章规则</p><p className="mt-1 text-sm text-muted-foreground">滨州主题、1500–3000 字、配图与来源说明</p></div>
            <div className="rounded-lg border p-4"><p className="font-medium">管理数据</p><p className="mt-1 text-sm text-muted-foreground">文章 {overview?.posts?.length ?? 0} 条 · 用户 {overview?.users?.length ?? 0} 个</p></div>
          </CardContent></Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                新建文章
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>标题</Label>
                <Input value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={postSlug} onChange={(e) => setPostSlug(e.target.value)} placeholder="可选，留空自动生成" />
              </div>
              <div className="space-y-2">
                <Label>内容</Label>
                <Textarea value={postContent} onChange={(e) => setPostContent(e.target.value)} rows={8} />
              </div>
              <Button onClick={createPost}>发布文章</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                新建商品
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>商品名称</Label>
                <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>价格</Label>
                <Input type="number" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
              </div>
              <Button onClick={createProduct}>添加商品</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chronicles">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                新建地方志
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>标题</Label>
                <Input value={chronicleTitle} onChange={(e) => setChronicleTitle(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>内容</Label>
                <Textarea value={chronicleContent} onChange={(e) => setChronicleContent(e.target.value)} rows={8} />
              </div>
              <Button onClick={createChronicle}>保存</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>用户管理</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">用户列表功能开发中...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
