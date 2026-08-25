import type { Metadata } from "next";
import PlaceContent from "./place-content";

export const metadata: Metadata = {
  title: "滨州地方志 - 查滨州历史、地名、人物、风俗｜滨州索引",
  description: "滨州索引地方志收录滨州历史沿革、地名变迁、历史人物、民俗文化、古建筑以及 4800+ 村庄名录。查滨州，就上滨州索引。",
};

export default function PlacePage() {
  return (
    <div className="flex flex-col">
      <PlaceContent />
    </div>
  );
}
