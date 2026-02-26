"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, TrendingUp, ArrowRight, Calendar, Users, Activity } from "lucide-react";
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
  const [isOpen, setIsOpen] = useState(false);
  const isLarge = size === "large";

  const details = [
    { label: "Best Season", value: adventure.bestSeason, icon: <Calendar className="w-3.5 h-3.5" /> },
    { label: "Group Size", value: adventure.groupSize, icon: <Users className="w-3.5 h-3.5" /> },
    { label: "Difficulty", value: adventure.difficulty, icon: <Activity className="w-3.5 h-3.5" /> },
    { label: "Terrain", value: adventure.terrain, icon: <MapPin className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 ${
        isOpen ? "shadow-2xl shadow-black/40 ring-1 ring-[#c4622d]/30" : "shadow-lg shadow-black/20"
      }`}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${isOpen ? "rgba(196,98,45,0.35)" : "rgba(255,255,255,0.08)"}`,
      }}
    >
      {/* Header / Image Area */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full overflow-hidden cursor-pointer group/header text-left"
        style={{ height: isLarge ? "320px" : "220px" }}
        aria-expanded={isOpen}
      >
        <Image
          src={adventure.heroImage}
          alt={adventure.name}
          fill
          className="object-cover transition-transform duration-700 group-hover/header:scale-105"
          sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        <div className="absolute inset-0 opacity-0 group-hover/header:opacity-100 transition-opacity duration-300 bg-[#c4622d]/10" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wider uppercase backdrop-blur-md ${typeStyle[adventure.type] ?? "bg-[#c4622d] text-white"}`}>
            {adventure.type}
          </span>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase transition-all duration-200"
            style={{
              background: isOpen ? "#c4622d" : "rgba(255,255,255,0.12)",
              color: "white",
              backdropFilter: "blur(6px)",
            }}
          >
            {isOpen ? "Close" : "Explore"}
          </span>
        </div>

        {/* Title Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
            <MapPin className="w-3 h-3 text-[#c4622d]" />
            <span className="text-white text-[10px] font-medium tracking-wide uppercase">{adventure.state}</span>
          </div>
          <h3 className="text-white font-bold text-xl leading-tight tracking-tight mb-1 group-hover/header:text-[#f4956a] transition-colors">
            {adventure.name}
          </h3>
          <p className="text-white/60 text-xs leading-relaxed line-clamp-1">
            {adventure.tagline}
          </p>
        </div>
      </button>

      {/* Dashboard / Body */}
      <div
        className="px-5 transition-all duration-300 ease-in-out overflow-hidden bg-white/[0.02]"
        style={{
          maxHeight: isOpen ? "400px" : "56px",
        }}
      >
        {/* Collapsed Summary Stats */}
        {!isOpen && (
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-white/40">
                <Clock className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium tracking-tight">{adventure.durationDays}</span>
              </div>
              {adventure.altitude && (
                <div className="flex items-center gap-1.5 text-white/40">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-medium tracking-tight">{adventure.altitude}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#c4622d]/15 text-[#f4956a] uppercase tracking-tighter">
                {adventure.difficulty}
              </span>
            </div>
          </div>
        )}

        {/* Expanded Items */}
        {isOpen && (
          <div className="py-5">
            <div className="grid grid-cols-2 gap-3 mb-5">
              {details.map((detail, idx) => (
                <div key={idx} className="flex flex-col gap-1.5 p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2 text-[#f4956a] opacity-80">
                    {detail.icon}
                    <span className="text-[10px] font-bold uppercase tracking-wider">{detail.label}</span>
                  </div>
                  <span className="text-white/80 text-xs font-medium truncate">{detail.value}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/5">
              <Link
                href={`/experiences/${adventure.slug}`}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 bg-[#c4622d] text-white shadow-lg shadow-[#c4622d]/25 hover:shadow-[#c4622d]/40 group/btn"
              >
                View Experience
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
