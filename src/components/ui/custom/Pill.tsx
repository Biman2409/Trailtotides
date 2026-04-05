"use client";

import React from "react";
import Link from "next/link";
import { typeStyle, difficultyStyle } from "@/lib/styles";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

// Per-type icon circle bg — slightly lighter/darker than the pill bg
const iconCircleStyle: Record<string, string> = {
  // Land — deeper orange
  Trekking:          "bg-[#cc4000]",
  Biking:            "bg-[#cc4000]",
  Cycling:           "bg-[#cc4000]",
  "Rock Climbing":   "bg-[#cc4000]",
  Scrambling:        "bg-[#cc4000]",
  Mountaineering:    "bg-[#cc4000]",
  "Jeep Safari":     "bg-[#cc4000]",
  "Camel Safari":    "bg-[#cc4000]",
  Caving:            "bg-[#cc4000]",
  Sandboarding:      "bg-[#cc4000]",
  "Urban Adventure": "bg-[#cc4000]",
  // Water — deeper blue
  Diving:            "bg-blue-700",
  Kayaking:          "bg-blue-700",
  Surfing:           "bg-blue-700",
  "River Rafting":   "bg-blue-700",
  Snorkelling:       "bg-blue-700",
  // Snow — gray circle on white pill
  Skiing:            "bg-gray-200",
  Snowboarding:      "bg-gray-200",
  "Ice Climbing":    "bg-gray-200",
  // Air — deeper purple
  Paragliding:       "bg-purple-800",
  Skydiving:         "bg-purple-800",
  "Hot Air Balloon": "bg-purple-800",
  "Hang Gliding":    "bg-purple-800",
};

interface PillProps {
  type: "type" | "difficulty" | "region" | "subRegion";
  value: string;
  className?: string;
  clickable?: boolean;
}

export default function Pill({ type, value, className = "", clickable = true }: PillProps) {
  let styleClass = "";
  let href = "/explore";

  if (type === "type") {
    styleClass = typeStyle[value] || "bg-gray-500 text-white";
    href = `/explore?type=${encodeURIComponent(value)}`;
  } else if (type === "difficulty") {
    styleClass = difficultyStyle[value] || "bg-gray-500 text-white";
    href = `/explore?difficulty=${encodeURIComponent(value)}`;
  } else if (type === "region") {
    styleClass = "bg-[#ff5100] text-white";
    href = `/explore?region=${encodeURIComponent(value)}`;
  } else if (type === "subRegion") {
    styleClass = "bg-white/15 text-white backdrop-blur-sm";
    href = `/explore?subRegion=${encodeURIComponent(value)}`;
  }

  const hasIcon = type === "type" && !!ADVENTURE_TYPE_ICONS[value];
  const circleBg = iconCircleStyle[value] ?? "bg-black/20";

  // Snow pills have dark icon color
  const isSnow = ["Skiing", "Snowboarding", "Ice Climbing"].includes(value);

  const baseClasses = [
    "inline-flex items-center leading-none rounded-full",
    "text-[10px] font-bold tracking-tight",
    "shadow-sm transition-all duration-300",
    hasIcon ? "pl-0.5 pr-2.5 py-0.5" : "px-2.5 py-1",
    styleClass,
    className,
  ].join(" ");

  const iconEl = hasIcon ? (
    <span
      className={[
        "flex items-center justify-center rounded-full mr-1.5 shrink-0",
        "w-[18px] h-[18px]",
        circleBg,
        isSnow ? "text-gray-700" : "text-white",
      ].join(" ")}
    >
      {ADVENTURE_TYPE_ICONS[value]?.(10)}
    </span>
  ) : null;

  const content = (
    <>
      {iconEl}
      {value}
    </>
  );

  if (clickable) {
    return (
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className={`${baseClasses} hover:scale-105 active:scale-95 cursor-pointer z-30`}
      >
        {content}
      </Link>
    );
  }

  return <span className={baseClasses}>{content}</span>;
}
