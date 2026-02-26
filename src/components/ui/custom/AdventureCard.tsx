"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Adventure } from "@/lib/data";

const typeStyle: Record<string, string> = {
  // Land — orange
  Trekking:          "bg-[#f4845f] text-white",
  Biking:            "bg-[#f4845f] text-white",
  Cycling:           "bg-[#f4845f] text-white",
  "Rock Climbing":   "bg-[#f4845f] text-white",
  Mountaineering:    "bg-[#f4845f] text-white",
  "Camel Safari":    "bg-[#f4845f] text-white",
  "Jeep Safari":     "bg-[#f4845f] text-white",
  Sandboarding:      "bg-[#f4845f] text-white",
  "Urban Adventure": "bg-[#f4845f] text-white",
  Caving:            "bg-[#f4845f] text-white",
  // Water — blue
  Diving:            "bg-blue-500 text-white",
  Kayaking:          "bg-blue-500 text-white",
  // Snow — white
  Skiing:            "bg-white text-gray-900 border border-gray-100",
  // Air — purple
  Paragliding:       "bg-purple-600 text-white",
  "Hot Air Balloon": "bg-purple-600 text-white",
};

const difficultyStyle: Record<string, string> = {
  Beginner:     "bg-emerald-500 text-white",
  Intermediate: "bg-blue-400 text-white",
  Advanced:     "bg-amber-500 text-white",
  Expert:       "bg-orange-500 text-white",
  Extreme:      "bg-red-600 text-white",
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
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#f4845f]/10" />

        {/* Pills at the Top */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase shadow-sm ${typeStyle[adventure.type] ?? "bg-[#f4845f] text-white"}`}>
            {adventure.type}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight shadow-sm ${difficultyStyle[adventure.difficulty] ?? "bg-gray-500 text-white"}`}>
            {adventure.difficulty}
          </span>
        </div>

        {/* Title Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
            <MapPin className="w-3 h-3 text-[#f4845f]" />
            <span className="text-white text-[10px] font-medium tracking-wide uppercase">{adventure.state}</span>
          </div>
          <h3 className="text-white font-bold text-xl leading-tight tracking-tight mb-1 group-hover:text-[#f4845f] transition-colors">
            {adventure.name}
          </h3>
          <p className="text-white/60 text-xs leading-relaxed line-clamp-1">
            {adventure.tagline}
          </p>
        </div>
      </div>
    </Link>
  );
}
