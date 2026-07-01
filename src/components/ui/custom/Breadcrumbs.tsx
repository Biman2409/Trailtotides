import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export default function Breadcrumbs({ items }: Props) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs py-3 px-5 lg:px-8 max-w-7xl mx-auto w-full">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-[#ff5100] transition-colors"
        style={{ color: "var(--text-tertiary)" }}
      >
        <Home className="w-3 h-3" />
      </Link>
      <ChevronRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#ff5100] transition-colors"
                style={{ color: "var(--text-tertiary)" }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: "var(--text-secondary)" }} className="font-medium">
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="w-3 h-3" style={{ color: "var(--text-muted)" }} />
            )}
          </span>
        );
      })}
    </nav>
  );
}