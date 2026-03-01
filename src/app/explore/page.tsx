import { Suspense } from "react";
import ExploreClient from "./ExploreClient";

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#111820]" />}>
      <ExploreClient />
    </Suspense>
  );
}
