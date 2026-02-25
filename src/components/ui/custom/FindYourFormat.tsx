"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

const categories = [
  {
    id: "land",
    icon: "🏔️",
    label: "Land",
    subtitle: "Mountains, trails & terrain",
    bg: "bg-[#fdf6ee]",
    border: "border-[#e8ddd0]",
    headerBorder: "border-[#e8ddd0]",
    accent: "#c4622d",
    accentBg: "bg-[#c4622d]/10",
    accentText: "text-[#c4622d]",
    hoverRow: "hover:bg-[#c4622d]/10",
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
    icon: "🌊",
    label: "Water",
    subtitle: "Rivers, reefs & open sea",
    bg: "bg-[#eef5fd]",
    border: "border-[#cde0f5]",
    headerBorder: "border-[#cde0f5]",
    accent: "#2a7cc7",
    accentBg: "bg-[#2a7cc7]/10",
    accentText: "text-[#2a7cc7]",
    hoverRow: "hover:bg-[#2a7cc7]/10",
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
    icon: "❄️",
    label: "Snow",
    subtitle: "Glaciers, slopes & ice",
    bg: "bg-[#f4f8fb]",
    border: "border-[#d5e5f0]",
    headerBorder: "border-[#d5e5f0]",
    accent: "#4a8a9f",
    accentBg: "bg-[#4a8a9f]/10",
    accentText: "text-[#4a8a9f]",
    hoverRow: "hover:bg-[#6aaabf]/10",
    items: [
      { type: "Skiing", icon: "⛷️", count: 8 },
      { type: "Snowboarding", icon: "🏂", count: 5 },
      { type: "Ice Climbing", icon: "🧊", count: 4 },
      { type: "Snow Trekking", icon: "🥾", count: 22 },
    ],
  },
  {
    id: "air",
    icon: "🪂",
    label: "Air",
    subtitle: "Sky, altitude & free flight",
    bg: "bg-[#f5f0fd]",
    border: "border-[#ddd0f5]",
    headerBorder: "border-[#ddd0f5]",
    accent: "#7a5a98",
    accentBg: "bg-[#9a7ab8]/10",
    accentText: "text-[#7a5a98]",
    hoverRow: "hover:bg-[#9a7ab8]/10",
    items: [],
    comingSoon: true,
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
    <section className="py-24 lg:py-32 px-6 lg:px-8 bg-[#fafaf8]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="text-[#c4622d] text-xs font-semibold tracking-[0.22em] uppercase mb-3">
            Find your format
          </p>
          <h2 className="text-[#1a1f2e] text-4xl lg:text-5xl font-bold tracking-tight">
            Every way to go
          </h2>
          <div className="mt-5 w-14 h-0.5 bg-[#c4622d] rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6">
          {categories.map((cat) => {
            const isOpen = openId === cat.id;
            return (
              <div
                key={cat.id}
                className={`rounded-2xl ${cat.bg} border ${cat.border} overflow-hidden transition-all duration-300`}
              >
                {/* Header — always visible, click to toggle */}
                <button
                  onClick={() => setOpenId(isOpen ? null : cat.id)}
                  className={`w-full px-6 pt-6 pb-5 flex items-center gap-3 text-left transition-colors duration-150 ${
                    isOpen ? `border-b ${cat.headerBorder}` : ""
                  } hover:brightness-95`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#1a1f2e] font-bold text-base">{cat.label}</h3>
                    <p
                      className="text-xs mt-0.5 truncate"
                      style={{ color: cat.accent + "99" }}
                    >
                      {cat.subtitle}
                    </p>
                  </div>
                  <ChevronDown
                    className="w-4 h-4 shrink-0 transition-transform duration-300"
                    style={{
                      color: cat.accent,
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {/* Expandable content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {cat.comingSoon ? (
                    <div className="p-3">
                      <div className="flex flex-col gap-1 mb-4 opacity-40 pointer-events-none select-none">
                        {cat.previewItems?.map(({ type, icon }) => (
                          <div
                            key={type}
                            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                          >
                            <span className="text-lg">{icon}</span>
                            <span className="text-[#1a1f2e] text-sm font-medium">{type}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mx-2 rounded-xl bg-[#9a7ab8]/10 border border-[#9a7ab8]/20 px-3 py-3 text-center">
                        <p className="text-[#7a5a98] text-xs font-semibold">Coming Soon</p>
                        <p className="text-[#b8a8cc] text-xs mt-0.5 leading-snug">
                          Air adventures launching soon
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 flex flex-col gap-1">
                      {cat.items.map(({ type, icon, count }) => (
                        <Link
                          key={type}
                          href={`/explore?type=${encodeURIComponent(type)}`}
                          className={`group flex items-center justify-between px-3 py-2.5 rounded-xl ${cat.hoverRow} active:opacity-80 transition-colors duration-150`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{icon}</span>
                            <span
                              className="text-[#1a1f2e] text-sm font-medium transition-colors"
                              style={{ color: undefined }}
                            >
                              <span className="group-hover:hidden">{type}</span>
                              <span
                                className="hidden group-hover:inline"
                                style={{ color: cat.accent }}
                              >
                                {type}
                              </span>
                            </span>
                          </div>
                          <span
                            className={`text-xs font-semibold ${cat.accentBg} ${cat.accentText} px-2 py-0.5 rounded-full`}
                          >
                            {count}
                          </span>
                        </Link>
                      ))}
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
