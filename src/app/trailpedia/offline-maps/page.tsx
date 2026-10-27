import { permanentRedirect } from "next/navigation";

// Trailpedia is now Adventurepedia; keep the old address (and its ?trek=) working
export default async function OldTrailpediaGuide({ searchParams }: { searchParams: Promise<{ trek?: string }> }) {
  const { trek } = await searchParams;
  permanentRedirect(trek ? `/adventurepedia/offline-maps?trek=${encodeURIComponent(trek)}` : "/adventurepedia/offline-maps");
}
