import { permanentRedirect } from "next/navigation";

// Trailpedia is now Adventurepedia
export default function OldTrailpedia() {
  permanentRedirect("/adventurepedia");
}
