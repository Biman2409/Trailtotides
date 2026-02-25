"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    id: "land",
    label: "Land",
        subtitle: "Push your limits and own every inch of wild terrain",
        image: "https://images.unsplash.com/photo-1605548109944-9040d0972bf5?w=800&q=80",
    accent: "#c4622d",
    accentLight: "rgba(196,98,45,0.15)",
    accentBorder: "rgba(196,98,45,0.35)",
    tagBg: "rgba(196,98,45,0.18)",
    tagText: "#f4956a",
    items: [
      { type: "Trekking", icon: "🥾", count: 94 },
      { type: "Biking", icon: "🏍️", count: 38 },
      { type: "Cycling", icon: "🚴", count: 27 },
      { type: "Mountaineering", icon: "🏔️", count: 15 },
      { type: "Rock Climbing", icon: "🧗", count: 18 },
      { type: "Jeep Safari", icon: "🚙", count: 22 },
      { type: "Camel Safari", icon: "🐪", count: 9 },
      { type: "Caving", icon: "🪨", count: 7 },
      { type: "Sandboarding", icon: "🏄", count: 5 },
      { type: "Urban Adventure", icon: "🏙️", count: 11 },
    ],
  },
  {
    id: "water",
    label: "Water",
        subtitle: "Ride the currents and dive into the deep unknown",
    image: "https://images.unsplash.com/photo-1459745930869-b3d0d72c3cbb?w=800&q=80",
    accent: "#2a7cc7",
    accentLight: "rgba(42,124,199,0.15)",
    accentBorder: "rgba(42,124,199,0.35)",
    tagBg: "rgba(42,124,199,0.18)",
    tagText: "#6ab4f0",
    items: [
      { type: "Diving", icon: "🤿", count: 19 },
      { type: "Kayaking", icon: "🛶", count: 24 },
      { type: "Surfing", icon: "🏄", count: 12 },
      { type: "River Rafting", icon: "🌊", count: 16 },
      { type: "Snorkelling", icon: "🐠", count: 8 },
    ],
  },
  {
    id: "snow",
    label: "Snow",
        subtitle: "Shred fresh powder and carve perfect lines all season",
        image: "https://images.unsplash.com/photo-1596473537047-50758f115d04?w=800&q=80",
    accent: "#4a8a9f",
    accentLight: "rgba(74,138,159,0.15)",
    accentBorder: "rgba(74,138,159,0.35)",
    tagBg: "rgba(74,138,159,0.18)",
    tagText: "#8dcce0",
    items: [
      { type: "Skiing", icon: "⛷️", count: 8 },
      { type: "Snowboarding", icon: "🏂", count: 5 },
      { type: "Ice Climbing", icon: "🧊", count: 4 },
      { type: "Snow Trekking", icon: "🥾", count: 22 },
    ],
  },
  {
    id: "air",
    label: "Air",
      subtitle: "Soar above the clouds and see the world differently",
    image: "https://images.unsplash.com/photo-1601024445121-e5b82f020549?w=800&q=80",
    accent: "#7a5a98",
    accentLight: "rgba(122,90,152,0.15)",
    accentBorder: "rgba(122,90,152,0.35)",
    tagBg: "rgba(122,90,152,0.18)",
    tagText: "#c4a8e8",
    comingSoon: true,
    items: [],
    previewItems: [
      { type: "Paragliding", icon: "🪂" },
      { type: "Skydiving", icon: "🤸" },
      { type: "Hot Air Balloon", icon: "🎈" },
      { type: "Hang Gliding", icon: "🌬️" },
    ],
  },
];

export default function FindYourFormat() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#111820]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
              Pick your element
          </p>
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-white text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
                Every way to go
              </h2>
              <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
            </div>
            <p className="hidden md:block text-white/40 text-sm max-w-xs text-right leading-relaxed">
              Pick a category, explore the sub-types that match your style.
            </p>
          </div>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {categories.map((cat) => {
            const isOpen = openId === cat.id;
            const totalCount = cat.items.reduce((s, i) => s + i.count, 0);

            return (
              <div
                key={cat.id}
                className="rounded-2xl overflow-hidden flex flex-col"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${isOpen ? cat.accentBorder : "rgba(255,255,255,0.08)"}`,
                  transition: "border-color 0.3s ease",
                  boxShadow: isOpen
                    ? `0 0 0 1px ${cat.accentBorder}, 0 20px 48px rgba(0,0,0,0.35)`
                    : "0 4px 16px rgba(0,0,0,0.2)",
                }}
              >
                {/* Image header */}
                <button
                  onClick={() => setOpenId(isOpen ? null : cat.id)}
                  className="relative w-full overflow-hidden cursor-pointer group text-left"
                  style={{ height: "160px" }}
                  aria-expanded={isOpen}
                >
                  {/* Background image */}
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
                  {/* Accent tint on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `${cat.accent}22` }}
                  />

                    {/* Content over image */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                      {/* Top row — tap cue only */}
                      <div className="flex items-start justify-end">
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: isOpen ? cat.accent : "rgba(255,255,255,0.12)",
                            color: "white",
                            backdropFilter: "blur(6px)",
                            transition: "background 0.25s",
                          }}
                        >
                          {isOpen ? "Close" : "Explore"}
                        </span>
                      </div>

                      {/* Bottom row */}
                      <div>
                        <h3 className="text-white font-bold text-2xl leading-tight tracking-tight">{cat.label}</h3>
                        <p className="text-white/60 text-xs mt-1.5 leading-relaxed line-clamp-2">{cat.subtitle}</p>
                      </div>
                    </div>
                </button>

                {/* Body — collapsed state: show count pill */}
                <div
                  className="px-5 transition-all duration-300 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: isOpen ? "700px" : "56px",
                  }}
                >
                  {/* Always-visible collapsed summary */}
                  {!isOpen && (
                    <div className="py-3.5 flex items-center justify-between">
                      <span className="text-white/40 text-xs">
                        {cat.comingSoon
                          ? `${cat.previewItems?.length ?? 0} types`
                          : `${cat.items.length} adventure types`}
                      </span>
                      {!cat.comingSoon && (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: cat.tagBg, color: cat.tagText }}
                        >
                          {totalCount} adventures
                        </span>
                      )}
                      {cat.comingSoon && (
                        <span
                          className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ background: cat.tagBg, color: cat.tagText }}
                        >
                          Coming soon
                        </span>
                      )}
                    </div>
                  )}

                  {/* Expanded items */}
                  {isOpen && (
                    <div className="py-4">
                      {cat.comingSoon ? (
                        <>
                          <div className="flex flex-col gap-1 mb-4 opacity-40 pointer-events-none select-none">
                              {cat.previewItems?.map(({ type }) => (
                                <div
                                  key={type}
                                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                                >
                                  <span className="text-white/70 text-sm font-medium">{type}</span>
                                </div>
                              ))}
                          </div>
                          <div
                            className="rounded-xl px-4 py-3 text-center"
                            style={{
                              background: cat.accentLight,
                              border: `1px solid ${cat.accentBorder}`,
                            }}
                          >
                            <p className="font-semibold text-sm" style={{ color: cat.tagText }}>
                              Coming Soon
                            </p>
                            <p className="text-white/35 text-xs mt-0.5 leading-snug">
                              Air adventures launching soon
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col gap-0.5">
                              {cat.items.map(({ type, count }) => (
                                <Link
                                  key={type}
                                  href={`/explore?type=${encodeURIComponent(type)}`}
                                  className="group/row flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150"
                                  style={{}}
                                  onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background =
                                      cat.accentLight;
                                  }}
                                  onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = "transparent";
                                  }}
                                >
                                  <span className="text-white/70 group-hover/row:text-white text-sm font-medium transition-colors duration-150">
                                    {type}
                                  </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: cat.tagBg, color: cat.tagText }}
                                  >
                                    {count}
                                  </span>
                                  <ArrowRight
                                    className="w-3 h-3 opacity-0 group-hover/row:opacity-100 -translate-x-1 group-hover/row:translate-x-0 transition-all duration-150"
                                    style={{ color: cat.tagText }}
                                  />
                                </div>
                              </Link>
                            ))}
                          </div>

                          {/* View all link */}
                          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                            <Link
                              href={`/explore?category=${cat.id}`}
                              className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 hover:-translate-y-0.5"
                              style={{
                                background: cat.accent,
                                color: "white",
                                boxShadow: `0 4px 14px ${cat.accent}55`,
                              }}
                            >
                              View all {cat.label} adventures
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
