import type { Metadata } from "next";
import { Suspense } from "react";
import { ExploreView } from "@/components/ExploreView";

export const metadata: Metadata = { title: "Explore cafés" };

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="skeleton m-6 h-[70vh] rounded-[22px]" />}>
      <ExploreView />
    </Suspense>
  );
}
