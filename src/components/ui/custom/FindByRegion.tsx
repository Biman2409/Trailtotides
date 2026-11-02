import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sun, Mountain, MountainSnow, Trees, Waves, Palmtree, Building2, Sunrise } from "lucide-react";
import { regions, adventures } from "@/lib/data";
import { REGION_STATES } from "@/lib/regionGroups";
import SectionTexture from "./SectionTexture";

// A server component: counts are worked out here, so the adventure data stays off the client.
// Regions with adventures get a wide card with their areas as direct links; the ones still to
// come share a single "Coming soon" strip instead of a wall of empty photo cards.

const regionIcons: Record<string, React.ReactNode> = {
  "Himalayas": <MountainSnow className="w-5 h-5" />,
  "Western Ghats": <Trees className="w-5 h-5" />,
  "Eastern Ghats": <Mountain className="w-5 h-5" />,
  "Desert": <Sun className="w-5 h-5" />,
  "Coast": <Waves className="w-5 h-5" />,
  "Islands": <Palmtree className="w-5 h-5" />,
  "Northeast": <Sunrise className="w-5 h-5" />,
  "Urban": <Building2 className="w-5 h-5" />
};

const regionSubtitles: Record<string, string> = {
  "Himalayas": "Scale the highest peaks and find stillness in deep valleys",
  "Western Ghats": "Trace emerald trails through misty rainforests and hills",
  "Eastern Ghats": "Discover ancient ranges and hidden waterfall sanctuaries",
  "Desert": "Conquer golden dunes and embrace the vibrant desert spirit",
  "Coast": "Ride rhythmic tides and find peace on sun-soaked shores",
  "Islands": "Dive into turquoise depths and explore pristine wild wonders",
  "Northeast": "Venture into untouched forests and living mountain legends",
  "Urban": "Uncover secret adrenaline spots hidden in the city's pulse"
};

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function FindByRegion() {
  // Counted the way Explore's region filter counts (every adventure whose region matches), so
  // the number on the card is the number on the results page
  const regionData = regions.map((region) => {
    const inRegion = adventures.filter((a) => a.region === region.name);
    const areas = (REGION_STATES[region.name] ?? [])
      .map((state) => ({ state, count: inRegion.filter((a) => a.state.includes(state)).length }))
      .filter((a) => a.count > 0)
      .sort((x, y) => y.count - x.count);
    return { ...region, total: inRegion.length, areas };
  });
  const live = regionData.filter((r) => r.total > 0);
  const upcoming = regionData.filter((r) => r.total === 0);

  return (
    <section id="regions" className="relative py-6 lg:py-10 t-bg-surface2 px-5 lg:px-8 overflow-hidden">
      {/* Background accent glow — pine green, complementing the orange genre section above */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -bottom-24 left-[6%] w-96 h-96 rounded-full opacity-[0.06] dark:opacity-[0.09] blur-[100px]" style={{ background: "var(--accent-green)" }} />
        <SectionTexture kind="trail" color="var(--accent-green)" at="12% 85%" opacity={0.3} />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-3 lg:mb-5">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-2 uppercase">
            DISCOVER BY REGION
          </p>
          <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">
            Adventure Lives in Every Corner
          </h2>
        </div>

        <div className="flex flex-col gap-4 lg:gap-5">
          {live.map((region) => {
            // A route can run through two areas (Manali–Leh is Himachal and Ladakh), so they can add up past the total
            const overlaps = region.areas.reduce((s, a) => s + a.count, 0) > region.total;
            return (
              <article
                key={region.name}
                className="rounded-2xl overflow-hidden grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "0 4px 16px rgba(var(--shadow-color),0.2)",
                }}
              >
                {/* Photo with the name on it; the dark base keeps the white title legible while it loads */}
                <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[260px] overflow-hidden bg-[#2a2420]">
                  <Image
                    src={region.image}
                    alt=""
                    fill
                    quality={75}
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="photo-grade object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[#ff5100]">{regionIcons[region.name]}</span>
                      <h3 className="text-white font-bold text-2xl leading-tight tracking-tight">{region.name}</h3>
                    </div>
                    <p className="text-white/70 text-xs mt-1.5 leading-relaxed line-clamp-2">{regionSubtitles[region.name]}</p>
                  </div>
                </div>

                <div className="p-5 lg:p-6 flex flex-col gap-4">
                  <p className="t-text-3 text-xs">
                    {plural(region.total, "adventure")} across {plural(region.areas.length, "area")}
                    {overlaps && " · some routes cross two"}
                  </p>
                  {/* Each area straight to its results */}
                  <ul className="flex flex-wrap gap-2">
                    {region.areas.map(({ state, count }) => (
                      <li key={state}>
                        <Link
                          href={`/explore?region=${encodeURIComponent(region.name)}&state=${encodeURIComponent(state)}`}
                          className="inline-flex items-center gap-2 h-10 pl-3.5 pr-2 rounded-full text-sm font-medium transition-colors hover:bg-[rgba(255,81,0,0.12)]"
                          style={{ color: "var(--text-secondary)", boxShadow: "inset 0 0 0 1px var(--border-default)" }}
                        >
                          {state}
                          <span className="text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-[#ff5100]/15 text-[#ff5100]">{count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/explore?region=${encodeURIComponent(region.name)}`}
                    className="group mt-auto self-start inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    style={{ background: "#ff5100", boxShadow: "0 4px 14px #ff510055" }}
                  >
                    View all {region.total} in the {region.name}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            );
          })}

          {/* Regions still to come, in one quiet strip */}
          {upcoming.length > 0 && (
            <div
              className="rounded-2xl p-4 lg:p-5 flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4"
              style={{ background: "var(--bg-surface)", border: "1px dashed var(--border-default)" }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] shrink-0" style={{ color: "var(--accent-ink-soft)" }}>
                Coming soon
              </p>
              <ul className="flex flex-wrap gap-2">
                {upcoming.map((region) => (
                  <li
                    key={region.name}
                    title={regionSubtitles[region.name]}
                    className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-[13px] font-medium"
                    style={{ color: "var(--text-tertiary)", boxShadow: "inset 0 0 0 1px var(--border-subtle)" }}
                  >
                    <span className="[&>svg]:w-3.5 [&>svg]:h-3.5" style={{ color: "var(--text-muted)" }}>{regionIcons[region.name]}</span>
                    {region.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
