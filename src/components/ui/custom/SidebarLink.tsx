"use client";

import Link from "next/link";

interface Props {
  href: string;
  children: React.ReactNode;
}

export default function SidebarLink({ href, children }: Props) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center py-2.5 rounded-xl text-[11px] font-medium transition-all hover:brightness-150"
      style={{
        color: "var(--text-tertiary)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {children}
    </Link>
  );
}