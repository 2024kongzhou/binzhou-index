"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Landmark, MapPin, Users, Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Village {
  id: number;
  name: string;
  district: string | null;
  township: string | null;
  location: string | null;
  population: string | null;
  farmland: string | null;
  surnames: string | null;
  history: string | null;
  evolution: string | null;
  remark: string | null;
  versionTag: string | null;
}

const DISTRICTS = ["全部", "滨城区", "沾化区", "邹平市", "惠民县", "阳信县", "无棣县", "博兴县"];
const PAGE_SIZE = 12;

export default function VillageList() {
  const [villages, setVillages] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeDistrict, setActiveDistrict] = useState<string>("全部");
  const [search, setSearch] = useState<string>("");
  const [offset, setOffset] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const { toast } = useToast();

  const fetchVillages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(offset));
      if (activeDistrict !== "全部") params.set("district", activeDistrict);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/villages?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      setVillages(data.villages || []);
      setTotal(data.pagination?.total || 0);
    } catch {
      toast({ title: "获取村庄数据失败", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [activeDistrict, search, offset, toast]);

  useEffect(() => {
    fetchVillages();
  }, [fetchVillages]);

  // Reset offset when filter changes
  useEffect(() => {
    setOffset(0);
  }, [activeDistrict, search]);

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  if (loading && villages.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: PAGE_SIZE }).map((_, i) => (
          <Card key={i} className="border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col overflow-hidden animate-pulse">
            <CardContent className="p-5 md:p-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-1/4" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-full" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">县区：</span>
          {DISTRICTS.map((d) => (
            <Badge
              key={d}
              variant={activeDistrict === d ? "secondary" : "outline"}
              className={`cursor-pointer transition-colors ${
                activeDistrict === d
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "hover:bg-muted"
              }`}
              onClick={() => setActiveDistrict(d)}
            >
              {d}
            </Badge>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索村庄名称..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchVillages()}
            className="pl-9"
          />
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        共 {total} 个村庄{activeDistrict !== "全部" && `（${activeDistrict}）`}
      </div>

      {/* Village Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {villages.map((v) => (
          <Card key={v.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-slate-50 to-white flex flex-col overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <CardTitle className="text-base md:text-lg leading-snug group-hover:text-blue-600 transition-colors">
                  {v.name}
                </CardTitle>
                {v.district && (
                  <Badge variant="secondary" className="shrink-0 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    {v.district}
                  </Badge>
                )}
              </div>
              {v.township && v.township !== "暂无" && (
                <p className="text-xs text-muted-foreground">{v.township}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-3 flex flex-col flex-1">
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {v.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {v.location}
                  </span>
                )}
                {v.population && (
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {v.population}
                  </span>
                )}
                {v.surnames && (
                  <span className="inline-flex items-center gap-1">
                    姓氏：{v.surnames}
                  </span>
                )}
              </div>

              {(v.history || v.evolution) && (
                <p className="text-sm text-muted-foreground line-clamp-4 leading-relaxed flex-1">
                  {v.history || v.evolution}
                </p>
              )}

              {v.remark && (
                <p className="text-xs text-slate-500 border-t pt-2">{v.remark}</p>
              )}

              {v.versionTag && (
                <Badge variant="outline" className="text-xs w-fit mt-auto">
                  {v.versionTag}
                </Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {villages.length === 0 && !loading && (
        <div className="text-center py-16 text-muted-foreground">
          <Landmark className="h-12 w-12 mx-auto mb-4" />
          <p>未找到匹配的村庄</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((p) => Math.max(0, p - PAGE_SIZE))}
            disabled={offset === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {currentPage} / {totalPages} 页
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOffset((p) => Math.min((totalPages - 1) * PAGE_SIZE, p + PAGE_SIZE))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
