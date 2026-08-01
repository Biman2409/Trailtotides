import Link from "next/link";
import { User, Settings } from "lucide-react";

const TABS = [
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

/**
 * Lightweight connective tissue between the two "my account" pages — plain
 * links with a server-known active state (no client JS needed, since each
 * page already knows which route it is at render time).
 */
export default function AccountTabs({ active }: { active: "/profile" | "/settings" }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-full" style={{ background: "var(--bg-surface-2)", border: "1px solid var(--border-subtle)" }}>
      {TABS.map((tab) => {
        const isActive = tab.href === active;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={
              isActive
                ? { background: "#ff5100", color: "#fff" }
                : { color: "var(--text-tertiary)" }
            }
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
