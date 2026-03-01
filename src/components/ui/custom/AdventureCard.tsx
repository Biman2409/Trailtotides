"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin } from "lucide-react";
import type { Adventure, Month } from "@/lib/data";
import Pill from "./Pill";

interface AdventureCardProps {
  adventure: Adventure;
  size?: "default" | "large";
}

export default function AdventureCard({ adventure, size = "default" }: AdventureCardProps) {
  const isLarge = size === "large";
  const months: Month[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentMonth = months[new Date().getMonth()];
  const isSeasonActive = adventure.bestMonths.includes(currentMonth);

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
            quality={100}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            style={{ 
              objectFit: "cover",
              filter: "brightness(1.05) contrast(1.1) saturate(1.1)" 
            }}
            sizes={isLarge ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
          />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#ff5100]/10" />

            {/* Pills at the Top */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
              <Pill type="type" value={adventure.type} />
              <Pill type="difficulty" value={adventure.difficulty} />
            </div>

            {/* Season Badge at the Top Right */}
            {isSeasonActive && (
              <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <div className="bg-[#10b981]/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-white animate-ping absolute opacity-75" />
                    <div className="w-2 h-2 rounded-full bg-white relative shadow-[0_0_8px_white]" />
                  </div>
                  <span className="text-white text-[10px] font-bold tracking-[0.1em] uppercase">Season Active</span>
                </div>
              </div>
            )}

        {/* Title Content */}
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
            <MapPin className="w-3 h-3 text-[#ff5100]" />
            <span className="text-white text-[10px] font-medium tracking-wide">{adventure.state}</span>
          </div>
          <h3 className="text-white font-bold text-xl leading-tight tracking-tight mb-1 group-hover:text-[#ff5100] transition-colors">
            {adventure.name}
          </h3>
            <p className="text-white/60 text-xs leading-relaxed line-clamp-2 font-medium tracking-wide">
              {adventure.tagline}
            </p>
        </div>
      </div>
    </Link>
  );
}
