"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, TrendingUp, ArrowRight } from "lucide-react";
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
    <Link href={`/experiences/${adventure.slug}`} className="group block">
      <div
        className={`relative overflow-hidden rounded-2xl bg-[#1a1f2e] shadow-md hover:shadow-xl hover:shadow-black/20 transition-shadow duration-300 ${
          isLarge ? "h-[500px]" : "h-[360px]"
        }`}
      >
        {/* Image */}
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105 brightness-110 contrast-105 saturate-125"
          sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
        />

        {/* Vibrancy boost */}
        <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-br from-black/20 via-transparent to-black/10 pointer-events-none" />

        {/* Bottom read gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-full tracking-wide ${typeStyle[adventure.type] ?? "bg-[#c4622d] text-white"}`}>
            {adventure.type}
          </span>
          {(() => {
            const d = difficultyStyle[adventure.difficulty];
            return d ? (
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${d.bg} ${d.text}`}>
                {adventure.difficulty}
              </span>
            ) : null;
          })()}
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#c4622d]" />
            <span className="text-white/60 text-xs">{adventure.state}</span>
          </div>
          <h3 className="text-white font-semibold text-xl leading-snug mb-1">
            {adventure.name}
          </h3>
          <p className="text-white/75 text-sm line-clamp-2 mb-3 leading-relaxed">
            {adventure.tagline}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/50">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{adventure.durationDays}</span>
              </div>
              {adventure.altitude && (
                <div className="flex items-center gap-1.5 text-white/50">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-xs">{adventure.altitude}</span>
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#c4622d] group-hover:scale-110 transition-all duration-300">
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
