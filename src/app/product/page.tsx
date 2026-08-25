"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Search, ShoppingBag, MapPin, Phone } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  images?: string;
  stock: number;
  status: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  isSoftAd: boolean;
  createdAt: string;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">商品展示</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          本地优质商品推荐，支持线下体验店引流
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索商品..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="aspect-square" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-muted overflow-hidden rounded-t-lg flex items-center justify-center">
                {product.images ? (
                  <img
                    src={product.images}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{product.name}</CardTitle>
                  {product.isSoftAd && (
                    <Badge variant="secondary">推广</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {product.price && (
                    <span className="text-lg font-bold text-primary">
                      ¥{product.price}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ¥{product.originalPrice}
                    </span>
                  )}
                </div>
                {product.storeName && (
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {product.storeName}
                      {product.storeAddress && ` · ${product.storeAddress}`}
                    </p>
                    {product.storePhone && (
                      <p className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {product.storePhone}
                      </p>
                    )}
                  </div>
                )}
                <Button className="w-full" size="sm">查看详情</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">暂无商品</p>
        </div>
      )}
    </div>
  );
}
