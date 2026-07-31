import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CardFooterLinkProps {
  href: string;
  label: string;
  /** Hex accent color — defaults to the brand orange. */
  accentColor?: string;
}

/**
 * The "View all in [X]" full-width footer link used at the bottom of an
 * expanded region/category card — shared so FindByRegion and FindYourFormat
 * don't each hand-roll their own copy.
 */
export default function CardFooterLink({ href, label, accentColor = "#ff5100" }: CardFooterLinkProps) {
  return (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
      <Link
        href={href}
        className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all duration-150 hover:-translate-y-0.5"
        style={{ background: accentColor, boxShadow: `0 4px 14px ${accentColor}55` }}
      >
        {label}
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
