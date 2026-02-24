"use client";

interface Props {
  website: string;
}

export default function OperatorButton({ website }: Props) {
  return (
    <button
      onClick={() => window.open(website, "_blank", "noopener,noreferrer")}
      className="block w-full mt-3 bg-[#1e3d2f] hover:bg-[#2d5a42] text-white text-sm font-medium py-2.5 rounded-xl transition-colors text-center"
    >
      Get Details
    </button>
  );
}
