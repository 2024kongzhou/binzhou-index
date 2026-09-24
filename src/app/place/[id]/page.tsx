import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Landmark, ArrowLeft } from "lucide-react";
import { getVillageById, getVillageIds } from "@/lib/site-api";
import { decodeEscapedText, formatPopulation, formatSourceRemark } from "@/lib/content";

export const dynamicParams = false;

export async function generateStaticParams() {
  const ids = await getVillageIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const village = await getVillageById(params.id);
  if (!village) return { title: "村庄未找到 | 滨州索引" };
  const loc = [village.district, village.township, village.name].filter(Boolean).join(" ");
  return {
    title: `${village.name} - ${village.district || "滨州"}村庄名录 | 滨州索引`,
    description: decodeEscapedText(village.history || village.evolution).slice(0, 120) || `${loc} 的地理位置、姓氏源流与历史沿革。`,
  };
}

export default async function VillageDetailPage({ params }: { params: { id: string } }) {
  const village = await getVillageById(params.id);
  if (!village) notFound();

  const history = decodeEscapedText(village.history);
  const evolution = decodeEscapedText(village.evolution);
  const population = formatPopulation(village.population);
  const source = formatSourceRemark(village.remark);

  return (
    <div className="container py-10 md:py-16 max-w-3xl">
      <Link href="/place/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> 返回村庄名录
      </Link>
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-2">
          {village.district && <Badge>{village.district}</Badge>}
          {village.township && <Badge variant="outline">{village.township}</Badge>}
          {village.versionTag && <Badge variant="secondary">{village.versionTag}</Badge>}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">{village.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {village.location && (
            <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{village.location}</span>
          )}
          {population && (
            <span className="inline-flex items-center gap-1"><Users className="h-4 w-4" />{population}</span>
          )}
          {village.surnames && (
            <span className="inline-flex items-center gap-1"><Landmark className="h-4 w-4" />姓氏：{village.surnames}</span>
          )}
        </div>
      </div>
      <article className="prose prose-slate max-w-none space-y-6">
        {history && (
          <section>
            <h2 className="text-xl font-semibold mb-3">历史沿革</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{history}</p>
          </section>
        )}
        {evolution && evolution !== history && (
          <section>
            <h2 className="text-xl font-semibold mb-3">变迁</h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">{evolution}</p>
          </section>
        )}
        {village.farmland && (
          <section>
            <h2 className="text-xl font-semibold mb-3">田地</h2>
            <p className="text-muted-foreground">{village.farmland}</p>
          </section>
        )}
        {source && (
          <p className="text-xs text-slate-500 border-t pt-4">资料来源：{source}</p>
        )}
      </article>
      <div className="mt-10">
        <Link href="/place/">
          <Button variant="outline">查看更多村庄</Button>
        </Link>
      </div>
    </div>
  );
}
