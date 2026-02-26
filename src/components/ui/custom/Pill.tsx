import React from "react";
import { typeStyle, difficultyStyle } from "@/lib/styles";

interface PillProps {
  type: "type" | "difficulty";
  value: string;
  className?: string;
}

export default function Pill({ type, value, className = "" }: PillProps) {
  const styles = type === "type" ? typeStyle : difficultyStyle;
  const styleClass = styles[value] || "bg-gray-500 text-white";
  
  const baseClasses = "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-tight shadow-sm transition-all duration-300";
  
  return (
    <span className={`${baseClasses} ${styleClass} ${className}`}>
      {value}
    </span>
  );
}
