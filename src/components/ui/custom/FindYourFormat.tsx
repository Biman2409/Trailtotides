"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Wind, Mountain, Waves, Snowflake } from "lucide-react";
import { adventures } from "@/lib/data";

const categories = [
    {
      id: "earth",
      label: "Earth",
      icon: <Mountain className="w-6 h-6 text-[#ff5100]" />,
      subtitle: "Push your limits and own every inch of wild terrain",
      image: "https://vmpvmjzursbjwkrgulyp.supabase.co/storage/v1/object/public/adventure-images/element-earth.jpeg",
        accent: "#ff5100",
        accentLight: "rgba(255,81,0,0.15)",
        accentBorder: "rgba(255,81,0,0.35)",
        tagBg: "rgba(255,81,0,0.18)",
        tagText: "#ff5100",

    items: [
      { type: "Trekking" },
      { type: "Biking" },
      { type: "Cycling" },
      { type: "Mountaineering" },
      { type: "Rock Climbing" },
      { type: "Scrambling" },
      { type: "Jeep Safari" },
      { type: "Camel Safari" },
      { type: "Caving" },
      { type: "Sandboarding" },
      { type: "Urban Adventure" },
    ],
  },
  {
    id: "water",
    label: "Water",
    icon: <Waves className="w-6 h-6 text-[#ff5100]" />,
    subtitle: "Ride the currents and dive into the deep unknown",
    image: "https://vmpvmjzursbjwkrgulyp.supabase.co/storage/v1/object/public/adventure-images/element-water.jpeg",
    accent: "#ff5100",
    accentLight: "rgba(255,81,0,0.15)",
    accentBorder: "rgba(255,81,0,0.35)",
    tagBg: "rgba(255,81,0,0.18)",
    tagText: "#ff5100",
    comingSoon: true,
    items: [],
    previewItems: [
      { type: "Diving" },
      { type: "Kayaking" },
      { type: "Surfing" },
      { type: "River Rafting" },
      { type: "Snorkelling" },
    ],
  },
  {
    id: "snow",
    label: "Snow",
    icon: <Snowflake className="w-6 h-6 text-[#ff5100]" />,
    subtitle: "Shred fresh powder and carve perfect lines all season",
    image: "https://vmpvmjzursbjwkrgulyp.supabase.co/storage/v1/object/public/adventure-images/element-snow.jpeg",
    accent: "#ff5100",
    accentLight: "rgba(255,81,0,0.15)",
    accentBorder: "rgba(255,81,0,0.35)",
    tagBg: "rgba(255,81,0,0.18)",
    tagText: "#ff5100",
    comingSoon: true,
    items: [],
    previewItems: [
      { type: "Skiing" },
      { type: "Snowboarding" },
      { type: "Ice Climbing" },
      { type: "Snow Trekking" },
    ],
  },
    {
      id: "air",
      label: "Air",
      icon: <Wind className="w-6 h-6 text-[#ff5100]" />,
      subtitle: "Soar above the clouds and see the world differently",
      image: "https://vmpvmjzursbjwkrgulyp.supabase.co/storage/v1/object/public/adventure-images/element-air.jpeg",
      accent: "#ff5100",
      accentLight: "rgba(255,81,0,0.15)",
      accentBorder: "rgba(255,81,0,0.35)",
      tagBg: "rgba(255,81,0,0.18)",
      tagText: "#ff5100",
      comingSoon: true,
      items: [],
      previewItems: [
        { type: "Paragliding" },
        { type: "Skydiving" },
        { type: "Hot Air Balloon" },
        { type: "Hang Gliding" },
      ],
    },
];

export default function FindYourFormat() {
  const [openId, setOpenId] = useState<string | null>(null);

    return (
      <section id="styles" className="py-20 lg:py-28 px-5 lg:px-8 t-bg-page">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 lg:mb-12">
          <p className="text-[#ff5100] text-xs font-semibold tracking-[0.22em] mb-3 uppercase">
            DISCOVER YOUR GENRE
          </p>
          <h2 className="text-white text-3xl lg:text-5xl font-bold tracking-tight leading-tight">
            Adventure Lives in Every Element
          </h2>
          <div className="mt-4 w-12 h-0.5 bg-[#ff5100] rounded-full" />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {categories.map((cat) => {
            const isOpen = openId === cat.id;
            const countByType = Object.fromEntries(
              cat.items.map(({ type }) => [type, adventures.filter((a) => a.type === type).length])
            );
            const totalCount = Object.values(countByType).reduce((s, n) => s + n, 0);

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
                    style={{ aspectRatio: "16/9" }}
                  aria-expanded={isOpen}
                >
                    <Image
                      src={cat.image}
                      alt={cat.label}
                      fill
                      quality={100}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ 
                        objectFit: "cover",
                        filter: "brightness(1.05) contrast(1.1) saturate(1.1)" 
                      }}
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
                          <div className="flex items-center gap-2.5">
                            <span className="transition-colors duration-300">
                              {cat.icon}
                            </span>
                            <h3 className="text-white font-bold text-2xl leading-tight tracking-tight">
                              {cat.label}
                            </h3>
                          </div>
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
                            ? `${cat.previewItems?.length ?? 0} Types`
                            : `${cat.items.length} Adventure Types`}
                        </span>
                        {!cat.comingSoon && (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: cat.tagBg, color: cat.tagText }}
                          >
                            {totalCount} Adventures
                          </span>
                        )}
                        {cat.comingSoon && (
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: cat.tagBg, color: cat.tagText }}
                          >
                            Coming Soon
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
                                {cat.items.map(({ type }) => (
                                  <Link
                                    key={type}
                                    href={`/explore?type=${encodeURIComponent(type)}`}
                                    className="group/row flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors duration-150"
                                    onMouseEnter={(e) => {
                                      (e.currentTarget as HTMLElement).style.background =
                                        cat.accentLight;
                                    }}
                                    onMouseLeave={(e) => {
                                      (e.currentTarget as HTMLElement).style.background = "transparent";
                                    }}
                                  >
                                    <div className="flex items-center gap-2.5">
                                      <span className="text-white/70 group-hover/row:text-white text-sm font-medium transition-colors duration-150">
                                        {type}
                                      </span>
                                    </div>
                                  <div className="flex items-center gap-2">
                                  <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                    style={{ background: cat.tagBg, color: cat.tagText }}
                                  >
                                    {countByType[type]}
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
