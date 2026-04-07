import Link from "next/link";
import { Mountain } from "@/lib/localIcons";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  href?: string;
}

export default function Logo({ size = "md", href = "/" }: LogoProps) {
  const iconSizes = { sm: "w-8 h-8", md: "w-9 h-9", lg: "w-11 h-11" };
  const mountainSizes = { sm: "w-4 h-4", md: "w-5 h-5", lg: "w-6 h-6" };
  const textSizes = { sm: "text-base", md: "text-lg", lg: "text-xl" };
  const cursiveSizes = { sm: "text-[13px]", md: "text-[15px]", lg: "text-[17px]" };

  return (
    <Link href={href} className="flex items-center gap-2.5 group">
      <div className={`${iconSizes[size]} rounded-xl bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-colors shadow-lg shadow-[#ff5100]/20`}>
        <Mountain className={`${mountainSizes[size]} text-white`} strokeWidth={2.5} />
      </div>
      <span className={`text-white ${textSizes[size]} leading-none tracking-tight`}>
        <span className="font-black uppercase">TRAIL</span>
        <span style={{ fontFamily: "var(--font-cursive)" }} className={`text-white/60 ${cursiveSizes[size]} normal-case tracking-normal font-normal mx-1`}>to</span>
        <span className="font-black uppercase">TIDES</span>
      </span>
    </Link>
  );
}
