"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Adventure } from "@/lib/data";

const typeStyle: Record<string, string> = {
  // Land — orange
  Trekking:          "bg-[#c4622d] text-white",
  Biking:            "bg-[#c4622d] text-white",
  Cycling:           "bg-[#c4622d] text-white",
  "Rock Climbing":   "bg-[#c4622d] text-white",
  Mountaineering:    "bg-[#c4622d] text-white",
  "Camel Safari":    "bg-[#c4622d] text-white",
  "Jeep Safari":     "bg-[#c4622d] text-white",
  Sandboarding:      "bg-[#c4622d] text-white",
  "Urban Adventure": "bg-[#c4622d] text-white",
  Caving:            "bg-[#c4622d] text-white",
  // Water — blue
  Diving:            "bg-blue-500 text-white",
  Kayaking:          "bg-blue-500 text-white",
  // Snow — slate/white
  Skiing:            "bg-white text-gray-900",
  // Air — purple
  Paragliding:       "bg-purple-500 text-white",
  "Hot Air Balloon": "bg-purple-500 text-white",
};

const difficultyStyle: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: "bg-emerald-500", text: "text-white" },
  Intermediate: { bg: "bg-teal-500",    text: "text-white" },
  Advanced:     { bg: "bg-amber-500",   text: "text-white" },
  Expert:       { bg: "bg-orange-500",  text: "text-white" },
  Extreme:      { bg: "bg-red-500",     text: "text-white" },
};

interface AdventureCardProps {
  adventure: Adventure;
  size?: "default" | "large";
}

export default function AdventureCard({ adventure, size = "default" }: AdventureCardProps) {
  const isLarge = size === "large";

  return (
    <Link
      href={`/experiences/${adventure.slug}`}
      className="rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-2xl hover:shadow-black/40 hover:-translate-y-1"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Header / Image Area */}
      <div
        className="relative w-full overflow-hidden text-left block"
        style={{ height: isLarge ? "320px" : "220px" }}
      >
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#c4622d]/10" />

        {/* Title Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
            <MapPin className="w-3 h-3 text-[#c4622d]" />
            <span className="text-white text-[10px] font-medium tracking-wide uppercase">{adventure.state}</span>
          </div>
          <h3 className="text-white font-bold text-xl leading-tight tracking-tight mb-1 group-hover:text-[#f4956a] transition-colors">
            {adventure.name}
          </h3>
          <p className="text-white/60 text-xs leading-relaxed line-clamp-1">
            {adventure.tagline}
          </p>
        </div>
      </div>

      {/* Dashboard / Body */}
      <div className="px-5 bg-white/[0.02] border-t border-white/5 transition-colors group-hover:bg-white/[0.04]">
        <div className="py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase shadow-sm ${typeStyle[adventure.type] ?? "bg-[#c4622d] text-white"}`}>
              {adventure.type}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#c4622d]/15 text-[#f4956a] border border-[#c4622d]/20 uppercase tracking-tight">
              {adventure.difficulty}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
