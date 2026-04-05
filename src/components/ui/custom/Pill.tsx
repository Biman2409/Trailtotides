"use client";

import React from "react";
import Link from "next/link";
import { typeStyle, difficultyStyle } from "@/lib/styles";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";

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

  const icon = type === "type" ? ADVENTURE_TYPE_ICONS[value]?.(10) : null;

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
