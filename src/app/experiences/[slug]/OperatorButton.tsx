"use client";

interface Props {
  website: string;
  label?: string;
  variant?: "primary" | "secondary";
}

export default function OperatorButton({ website, label = "Get Details", variant = "primary" }: Props) {
  return (
    <button
      onClick={() => window.open(website, "_blank", "noopener,noreferrer")}
      className={`w-full text-sm font-medium py-2.5 rounded-xl transition-colors text-center ${
        variant === "primary"
          ? "bg-[#1e3d2f] hover:bg-[#2d5a42] text-white"
          : "bg-white border border-[#e0d8cc] hover:border-[#ff5722] text-[#1a1f2e] hover:text-[#ff5722]"
      }`}
    >
      {label}
    </button>
  );
}
