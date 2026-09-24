import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone } from "lucide-react";
import { getProductById, getProductIds } from "@/lib/site-api";

export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await getProductIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = await getProductById(params.id);
  if (!product) return { title: "商品未找到 | 滨州索引" };
  return {
    title: `${product.name} | 滨州索引`,
    description: product.description || "滨州本地商品与服务",
  };
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  return (
    <div className="container py-10 md:py-16 max-w-3xl">
      <Link href="/product/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回商品列表
      </Link>
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
        {product.isSoftAd && <Badge variant="outline">广告</Badge>}
      </div>
      {product.description && (
        <p className="text-muted-foreground leading-relaxed mb-6">{product.description}</p>
      )}
      <div className="flex items-baseline gap-3 mb-6">
        {product.price != null && (
          <span className="text-3xl font-bold text-amber-600">¥{product.price}</span>
        )}
        {product.originalPrice != null && (
          <span className="text-muted-foreground line-through">¥{product.originalPrice}</span>
        )}
      </div>
      {(product.storeName || product.storePhone) && (
        <div className="rounded-xl border p-4 space-y-2 text-sm text-muted-foreground mb-8">
          {product.storeName && (
            <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{product.storeName}{product.storeAddress ? ` · ${product.storeAddress}` : ""}</p>
          )}
          {product.storePhone && (
            <p className="inline-flex items-center gap-2"><Phone className="h-4 w-4" /><a href={`tel:${product.storePhone}`}>{product.storePhone}</a></p>
          )}
        </div>
      )}
      <Link href="/contact/">
        <Button>联系商家</Button>
      </Link>
    </div>
  );
}
