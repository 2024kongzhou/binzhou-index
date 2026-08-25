import type { Metadata } from "next";
import { Landmark } from "lucide-react";
import ChronicleList from "./chronicle-list";

export const metadata: Metadata = {
  title: "滨州地方志 - 查滨州历史、地名、人物、风俗｜滨州索引",
  description: "滨州索引地方志收录滨州历史沿革、地名变迁、历史人物、民俗文化、古建筑等地方性知识。查滨州，就上滨州索引。",
};

export default function PlacePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-slate-900 to-blue-950 text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-72 h-72 bg-amber-500 rounded-full blur-3xl" />
        </div>
        <div className="container relative z-10 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-4 md:space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm">
              <Landmark className="h-4 w-4 text-amber-400" />
              追溯历史 · 传承文化
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">滨州地方志</h1>
            <p className="text-base md:text-lg text-blue-100/80 max-w-2xl mx-auto leading-relaxed px-4">
              收录滨州历史、地理、人物、风俗等地方性知识，探寻这座城市的文化根脉
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Content Section */}
      <section className="py-8 md:py-12 container">
        <ChronicleList />
      </section>
    </div>
  );
}
