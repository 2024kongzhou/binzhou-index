"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, MapPin, Calendar, Tag } from "lucide-react";

interface Chronicle {
  id: number;
  title: string;
  content: string;
  category?: string;
  era?: string;
  tags?: string;
  createdAt: string;
}

export default function PlacePage() {
  const [chronicles, setChronicles] = useState<Chronicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchChronicles();
  }, []);

  const fetchChronicles = async () => {
    try {
      const res = await fetch("/api/chronicles");
      const data = await res.json();
      setChronicles(data.chronicles || []);
    } catch {
      setChronicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = chronicles.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-12 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">滨州地方志</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          收录滨州历史、地理、人物、风俗等地方性知识
        </p>
      </div>

      <div className="relative max-w-md mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索地方志..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  {item.category && (
                    <Badge variant="secondary">{item.category}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {item.content}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">暂无地方志数据</p>
        </div>
      )}
    </div>
  );
}
