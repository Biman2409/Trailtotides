"use client";

import { useCompare } from "@/contexts/CompareContext";
import { Adventure } from "@/lib/data";
import { CheckCheck, ArrowRight } from "lucide-react";

interface Props {
  adventure: Adventure;
}

export default function CompareCTA({ adventure }: Props) {
  const { add, remove, isSelected, isFull } = useCompare();
  const selected = isSelected(adventure.id);

  function handleCompare() {
    if (selected) {
      remove(adventure.id);
    } else if (!isFull) {
      add(adventure);
      // Optional: scroll to a comparison section if you add one to this page
    }
  }

  return (
    <button
      onClick={handleCompare}
      disabled={!selected && isFull}
      className={`flex items-center justify-center gap-2 w-full font-semibold py-3.5 rounded-2xl text-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg group ${
        selected
          ? "bg-emerald-600 text-white shadow-emerald-600/20"
          : isFull
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-[#ff5100] text-white hover:bg-[#ff7d47] shadow-[#ff5100]/30"
      }`}
    >
      {selected ? (
        <>
          <CheckCheck className="w-4 h-4" />
          Added to Compare
        </>
      ) : (
        <>
          {isFull ? "Compare Full (6/6)" : "Compare this Adventure"}
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </>
      )}
    </button>
  );
}
