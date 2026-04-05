"use client";

import React from "react";
import Link from "next/link";
import { typeStyle, difficultyStyle } from "@/lib/styles";
import {
  Footprints, Bike, Mountain, Anchor, Waves, Wind,
  Flame, Snowflake, Ship, Telescope, Globe, Zap,
  Triangle, CloudSnow, Fish, Tent, Car, Compass,
} from "lucide-react";

const TYPE_ICONS: Record<string, React.ReactNode> = {
  Trekking:          <Footprints className="w-2.5 h-2.5" />,
  Biking:            <Bike       className="w-2.5 h-2.5" />,
  Cycling:           <Bike       className="w-2.5 h-2.5" />,
  "Rock Climbing":   <Mountain   className="w-2.5 h-2.5" />,
  Scrambling:        <Triangle   className="w-2.5 h-2.5" />,
  Mountaineering:    <Mountain   className="w-2.5 h-2.5" />,
  "Camel Safari":    <Compass    className="w-2.5 h-2.5" />,
  "Jeep Safari":     <Car        className="w-2.5 h-2.5" />,
  Sandboarding:      <Flame      className="w-2.5 h-2.5" />,
  "Urban Adventure": <Globe      className="w-2.5 h-2.5" />,
  Caving:            <Tent       className="w-2.5 h-2.5" />,
  Diving:            <Anchor     className="w-2.5 h-2.5" />,
  Kayaking:          <Ship       className="w-2.5 h-2.5" />,
  Surfing:           <Waves      className="w-2.5 h-2.5" />,
  "River Rafting":   <Waves      className="w-2.5 h-2.5" />,
  Snorkelling:       <Fish       className="w-2.5 h-2.5" />,
  Skiing:            <Snowflake  className="w-2.5 h-2.5" />,
  Snowboarding:      <CloudSnow  className="w-2.5 h-2.5" />,
  "Ice Climbing":    <Zap        className="w-2.5 h-2.5" />,
  "Snow Trekking":   <Snowflake  className="w-2.5 h-2.5" />,
  Paragliding:       <Wind       className="w-2.5 h-2.5" />,
  Skydiving:         <Wind       className="w-2.5 h-2.5" />,
  "Hot Air Balloon": <Telescope  className="w-2.5 h-2.5" />,
  "Hang Gliding":    <Wind       className="w-2.5 h-2.5" />,
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

  const icon = type === "type" ? TYPE_ICONS[value] : null;

  const baseClasses = "text-[10px] font-bold px-2.5 py-1 rounded-full tracking-tight shadow-sm transition-all duration-300 inline-flex items-center gap-1";
  const finalClass = `${baseClasses} ${styleClass} ${className}`;

  const content = (
    <>
      {icon}
      {value}
    </>
  );

  if (clickable) {
    return (
      <Link
        href={href}
        onClick={(e) => e.stopPropagation()}
        className={`${finalClass} hover:scale-105 active:scale-95 cursor-pointer z-30`}
      >
        {content}
      </Link>
    );
  }

  return <span className={finalClass}>{content}</span>;
}
