import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { adventures } from "@/lib/data";
import CompassClient from "./CompassClient";

export const metadata: Metadata = {
  title: "Compass AI — Trail to Tides",
  description: "AI-powered adventure advisor. Tell Compass what you want and it'll find the perfect Indian adventure for you.",
};

export default function CompassPage() {
  return (
    <div className="flex flex-col h-screen" style={{ background: "var(--bg-page)" }}>
      <Navbar />
      <div className="flex-1 overflow-hidden pt-16 lg:pt-20">
        <div className="h-full max-w-2xl mx-auto">
          <CompassClient adventures={adventures} />
        </div>
      </div>
    </div>
  );
}
