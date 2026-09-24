import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { getPostBySlug, getPostSlugs } from "@/lib/site-api";
import { decodeEscapedText } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: "文章未找到 | 滨州索引" };
  return {
    title: `${post.title} | 滨州索引`,
    description: post.excerpt || decodeEscapedText(post.content).slice(0, 120),
  };
}

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <div className="container py-10 md:py-16 max-w-3xl">
      <Link href="/blog/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回故事列表
      </Link>
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 flex-wrap">
          {post.aiGenerated && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              <Sparkles className="h-3 w-3 mr-1" /> AI 生成
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString("zh-CN") : "近期"}
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{post.title}</h1>
      </div>
      {post.coverImage && (
        <img src={post.coverImage} alt={post.title} className="w-full rounded-xl mb-8" />
      )}
      <article className="prose prose-slate max-w-none">
        <p className="whitespace-pre-line leading-relaxed text-muted-foreground text-base">
          {decodeEscapedText(post.content)}
        </p>
      </article>
      <div className="mt-10">
        <Link href="/blog/">
          <Button variant="outline">更多滨州故事</Button>
        </Link>
      </div>
    </div>
  );
}
