import Link from "next/link";
import Image from "next/image";
import { Wind, Mountain, Waves, Snowflake } from "@/lib/localIcons";
import { adventures } from "@/lib/data";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import CardFooterLink from "./CardFooterLink";
import SectionTexture from "./SectionTexture";

// A server component: the counts are worked out here, so the adventure data stays off the client.
// Compact on purpose — a slim photo, then the activity types as links — so it doesn't read as a
// twin of the tall photo cards in "Discover by region" right below it.

const ACCENT = "#ff5100";

const categories = [
  {
    id: "earth",
    label: "Earth",
    icon: <Mountain className="w-5 h-5 text-[#ff5100]" />,
    subtitle: "Push your limits and own every inch of wild terrain",
    image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/element-earth.jpeg",
    types: ["Trekking", "Motorcycling", "Cycling", "Mountaineering", "Rock Climbing", "Scrambling", "Jeep Safari", "Caving", "Urban Adventure"],
  },
  {
    id: "water",
    label: "Water",
    icon: <Waves className="w-5 h-5 text-[#ff5100]" />,
    subtitle: "Ride the currents and dive into the deep unknown",
    image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/element-water.jpeg",
    types: ["River Rafting", "Kayaking", "Diving", "Surfing", "Snorkelling"],
  },
  {
    id: "snow",
    label: "Snow",
    icon: <Snowflake className="w-5 h-5 text-[#ff5100]" />,
    subtitle: "Shred fresh powder and carve perfect lines all season",
    image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/element-snow.jpeg",
    types: ["Skiing", "Snowboarding", "Ice Climbing", "Ice Skating"],
  },
  {
    id: "air",
    label: "Air",
    icon: <Wind className="w-5 h-5 text-[#ff5100]" />,
    subtitle: "Soar above the clouds and see the world differently",
    image: "https://eylgddhfxzxwovcodihx.supabase.co/storage/v1/object/public/adventure-images/element-air.jpeg",
    types: ["Paragliding", "Skydiving", "Hot Air Balloon", "Hang Gliding"],
  },
];

const countOf = (type: string) => adventures.filter((a) => a.type === type).length;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function FindYourFormat() {
  return (
    <section id="styles" className="relative py-6 lg:py-10 px-5 lg:px-8 t-bg-page overflow-hidden">
      {/* Background accent glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 right-[8%] w-96 h-96 rounded-full opacity-[0.05] dark:opacity-[0.08] blur-[100px]" style={{ background: ACCENT }} />
        {/* Waves pool bottom-left; "In season" has the same texture top-right */}
        <SectionTexture kind="tides" color="#3fc6bd" at="10% 85%" opacity={0.16} />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-3 lg:mb-5">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-2 uppercase">
            DISCOVER BY GENRE
          </p>
          <h2 className="t-text text-2xl lg:text-4xl font-bold tracking-tight leading-tight">
            Adventure Lives in Every Element
          </h2>
        </div>

        {/* Phones swipe sideways through the cards, like the rows above */}
        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 overflow-x-auto sm:overflow-visible snap-x snap-mandatory no-scrollbar -mx-5 px-5 scroll-px-5 sm:mx-0 sm:px-0 pb-2 sm:pb-0">
          {categories.map((cat) => {
            const live = cat.types.map((type) => ({ type, count: countOf(type) })).filter((t) => t.count > 0);
            const soon = cat.types.filter((type) => !live.some((t) => t.type === type));
            const total = live.reduce((s, t) => s + t.count, 0);

            return (
              <article
                key={cat.id}
                className="snap-start shrink-0 w-[78vw] sm:w-auto rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  boxShadow: "0 4px 16px rgba(var(--shadow-color),0.2)",
                }}
              >
                {/* Slim photo with the name on it; the dark base keeps the white title legible while it loads */}
                <div className="relative aspect-[16/7] overflow-hidden bg-[#2a2420]">
                  <Image
                    src={cat.image}
                    alt=""
                    fill
                    quality={75}
                    sizes="(max-width: 640px) 78vw, (max-width: 1024px) 50vw, 25vw"
                    className="photo-grade object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="flex items-center gap-2">
                      {cat.icon}
                      <h3 className="text-white font-bold text-xl leading-tight tracking-tight">{cat.label}</h3>
                    </div>
                    <p className="text-white/70 text-xs mt-1 leading-snug line-clamp-1">{cat.subtitle}</p>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col gap-3">
                  {live.length > 0 ? (
                    <>
                      <p className="t-text-3 text-xs">
                        {plural(live.length, "type")} · {plural(total, "adventure")}
                      </p>
                      {/* Each type that has something listed, straight to its results */}
                      <ul className="flex flex-wrap gap-1.5">
                        {live.map(({ type, count }) => (
                          <li key={type}>
                            <Link
                              href={`/explore?type=${encodeURIComponent(type)}`}
                              className="group inline-flex items-center gap-1.5 h-9 pl-2.5 pr-1.5 rounded-full text-[13px] font-medium transition-colors hover:bg-[rgba(255,81,0,0.12)]"
                              style={{ color: "var(--text-secondary)", boxShadow: "inset 0 0 0 1px var(--border-default)" }}
                            >
                              <span className="shrink-0 group-hover:text-[#ff5100] transition-colors" style={{ color: "var(--text-tertiary)" }}>
                                {ADVENTURE_TYPE_ICONS[type as keyof typeof ADVENTURE_TYPE_ICONS]?.(13)}
                              </span>
                              {type}
                              <span className="text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,81,0,0.18)", color: "var(--accent-ink)" }}>
                                {count}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-xs font-semibold self-start px-2.5 py-1 rounded-full" style={{ background: "rgba(255,81,0,0.18)", color: "var(--accent-ink)" }}>
                      Coming soon
                    </p>
                  )}

                  {soon.length > 0 && (
                    <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                      {live.length > 0 ? "Coming soon: " : ""}{soon.join(", ")}
                    </p>
                  )}

                  {live.length > 0 && (
                    <div className="mt-auto">
                      <CardFooterLink
                        href={`/explore?type=${live.map((t) => encodeURIComponent(t.type)).join(",")}`}
                        label={`View all ${cat.label} adventures`}
                        accentColor={ACCENT}
                      />
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
