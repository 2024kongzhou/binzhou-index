"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, MapPin, Phone, Store, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  originalPrice: number | null;
  images: string | null;
  stock: number | null;
  status: string;
  storeName: string | null;
  storeAddress: string | null;
  storePhone: string | null;
  isSoftAd: boolean | null;
  createdAt: string | null;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch("/api/products", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(() => {
        toast({ title: "获取商品失败", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-slate-200" />
            <CardContent className="p-5 md:p-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
              <div className="h-8 bg-slate-200 rounded w-full mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 md:py-24">
        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground text-lg">暂无商品</p>
        <p className="text-sm text-muted-foreground mt-1">管理员登录后可在后台添加内容</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <Card key={product.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col overflow-hidden">
          <div className="aspect-[4/3] bg-muted overflow-hidden relative">
            {product.images ? (
              <img
                src={product.images}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-slate-400" />
              </div>
            )}
            {product.isSoftAd && (
              <Badge variant="secondary" className="absolute top-3 right-3 bg-amber-100 text-amber-700 hover:bg-amber-100">
                推广
              </Badge>
            )}
          </div>

          <CardHeader className="pb-2">
            <CardTitle className="text-base md:text-lg group-hover:text-blue-600 transition-colors line-clamp-1">
              {product.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 flex flex-col flex-1">
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-baseline gap-2 pt-1">
              {product.price != null && (
                <span className="text-xl md:text-2xl font-bold text-amber-600">
                  ¥{product.price}
                </span>
              )}
              {product.originalPrice != null && (
                <span className="text-sm text-muted-foreground line-through">
                  ¥{product.originalPrice}
                </span>
              )}
            </div>

            {product.storeName && (
              <div className="text-xs text-muted-foreground space-y-1 pt-1 border-t">
                <p className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 shrink-0" />
                  <span className="line-clamp-1">
                    {product.storeName}
                    {product.storeAddress && ` · ${product.storeAddress}`}
                  </span>
                </p>
                {product.storePhone && (
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3 shrink-0" />
                    {product.storePhone}
                  </p>
                )}
              </div>
            )}

            <Button className="w-full mt-auto" size="sm" variant="outline">
              查看详情
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
