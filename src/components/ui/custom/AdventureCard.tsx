import Link from "next/link";
import Image from "next/image";
import { MapPin, Clock, TrendingUp, ArrowRight } from "lucide-react";
import type { Adventure } from "@/lib/data";

const typePillColors: Record<string, string> = {
  // Land — amber
  Trekking:        "bg-amber-500/20 text-amber-300",
  Mountaineering:  "bg-amber-500/20 text-amber-300",
  "Rock Climbing": "bg-amber-500/20 text-amber-300",
  Biking:          "bg-amber-500/20 text-amber-300",
  Cycling:         "bg-amber-500/20 text-amber-300",
  "Jeep Safari":   "bg-amber-500/20 text-amber-300",
  "Camel Safari":  "bg-amber-500/20 text-amber-300",
  Sandboarding:    "bg-amber-500/20 text-amber-300",
  Caving:          "bg-amber-500/20 text-amber-300",
  "Urban Adventure": "bg-amber-500/20 text-amber-300",
  // Water — sky
  Diving:          "bg-sky-500/20 text-sky-300",
  Kayaking:        "bg-sky-500/20 text-sky-300",
  // Snow — slate/white
  Skiing:          "bg-slate-400/20 text-slate-200",
};

const difficultyColors: Record<string, string> = {
  Beginner:     "bg-green-500/20 text-green-300",
  Intermediate: "bg-blue-500/20 text-blue-300",
  Advanced:     "bg-amber-500/20 text-amber-300",
  Expert:       "bg-orange-500/20 text-orange-300",
  Extreme:      "bg-red-500/20 text-red-300",
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
        className={`relative overflow-hidden rounded-2xl bg-[#1a1f2e] ${
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

          {/* Vibrancy boost — multiply layer to deepen shadows and enrich colour */}
          <div className="absolute inset-0 mix-blend-multiply bg-gradient-to-br from-black/20 via-transparent to-black/10 pointer-events-none" />

          {/* Bottom read gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* Top badges */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            <span className={`backdrop-blur-sm text-xs font-medium px-2.5 py-1.5 rounded-full ${typePillColors[adventure.type] ?? "bg-white/10 text-white/80"}`}>
              {adventure.type}
            </span>
          <span
            className={`text-xs font-medium px-3 py-1.5 rounded-full backdrop-blur-sm ${
              difficultyColors[adventure.difficulty]
            }`}
          >
            {adventure.difficulty}
          </span>
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
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#c4622d] transition-colors duration-300">
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
