// Sizes images without Vercel's image optimizer (the Hobby quota runs out and
// then every uncached size answers 402). Supabase Storage photos are resized by
// Supabase's own transform endpoint; Unsplash by its URL parameters; anything
// else (small local files such as avatars) is served as it is.

type LoaderArgs = { src: string; width: number; quality?: number };

const SUPABASE_PUBLIC = "/storage/v1/object/public/";
const SUPABASE_RENDER = "/storage/v1/render/image/public/";

export default function imageLoader({ src, width, quality }: LoaderArgs): string {
  const q = quality ?? 75;

  if (src.includes(".supabase.co" + SUPABASE_PUBLIC)) {
    const url = src.replace(SUPABASE_PUBLIC, SUPABASE_RENDER);
    const sep = url.includes("?") ? "&" : "?";
    // resize=contain keeps the photo's shape; the default would crop to the original height
    return `${url}${sep}width=${width}&quality=${q}&resize=contain`;
  }

  if (src.startsWith("https://images.unsplash.com/")) {
    const u = new URL(src);
    u.searchParams.set("w", String(width));
    u.searchParams.set("q", String(q));
    u.searchParams.set("auto", "format");
    return u.toString();
  }

  // Local or other files: no resizing service, so serve the original.
  // The width parameter is ignored by the server but tells Next the loader used it.
  const sep = src.includes("?") ? "&" : "?";
  return src.startsWith("data:") || src.startsWith("blob:") ? src : `${src}${sep}w=${width}`;
}
