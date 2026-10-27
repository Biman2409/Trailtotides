import { permanentRedirect } from "next/navigation";

// The offline maps guide moved to Adventurepedia; keep the old address (and its ?trek=) working
export default async function OldOfflineMapsGuide({ searchParams }: { searchParams: Promise<{ trek?: string }> }) {
  const { trek } = await searchParams;
  permanentRedirect(trek ? `/adventurepedia/offline-maps?trek=${encodeURIComponent(trek)}` : "/adventurepedia/offline-maps");
}
