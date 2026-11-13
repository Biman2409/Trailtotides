"use client";

import { ArrowUpRight } from "lucide-react";
import { operatorHref, recordOutbound } from "@/lib/outbound";

/** The operator's own site, tagged and counted like every other Book click */
export default function WebsiteLink({ url, operator }: { url: string; operator: string }) {
  return (
    <a
      href={operatorHref(url)}
      target="_blank"
      rel="noopener"
      onClick={() => recordOutbound({ url, operator, source: "operators_page" })}
      className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl font-bold text-[15px] text-white"
      style={{ background: "#ff5100" }}
    >
      Visit their website <ArrowUpRight className="w-4 h-4" />
    </a>
  );
}
