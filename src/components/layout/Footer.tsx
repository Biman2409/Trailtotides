"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin } from "lucide-react";
import { Mountain } from "@/lib/localIcons";
import { createClient } from "@/lib/supabase/client";
import MessageModal from "./MessageModal";
import { motion } from "framer-motion";

export default function Footer() {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user ? { email: user.email ?? "" } : null);
    };
    fetchUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? { email: session.user.email ?? "" } : null);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative overflow-hidden pb-20 lg:pb-0" style={{ background: "var(--bg-page)", borderTop: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}>
      {/* Subtle Gradient Accent — rust fading into pine, the brand duo */}
      <div className="absolute top-0 left-0 w-full h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(255,81,0,0.2) 35%, rgba(74,222,128,0.16) 65%, transparent)" }} />
      
      <div className="max-w-7xl mx-auto px-5 lg:px-10 py-12 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-24">

            {/* Column 1: Identity, Platform, Legal */}
            <div className="space-y-8 lg:space-y-10">
              {/* 1. Branding */}
              <div className="flex flex-col gap-4 group">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-500 shadow-xl shadow-[#ff5100]/20 group-hover:rotate-6">
                    <Mountain className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-[1.5rem] leading-none antialiased tracking-tight transition-colors duration-500" style={{ color: "var(--text-primary)" }}>
                      <span className="font-black uppercase">TRAIL</span>
                      <span style={{fontFamily: "var(--font-cursive)", color: "var(--text-secondary)"}} className="mx-1 text-[1.2rem] normal-case tracking-normal font-normal">to</span>
                      <span className="font-black uppercase">TIDES</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 lg:gap-12">
                {/* 2. Platform */}
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] opacity-90">
                    Platform
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { label: "Explore", href: "/explore" },
                      { label: "Map", href: "/map" },
                                            { label: "Matchmaker", href: "/matchmaker" },
                      { label: "Stories", href: "/stories" },
                      { label: "Operators", href: "/operators" },
                    ].map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-[14px] font-bold hover:text-[#ff5100] transition-colors duration-300 tracking-[0.1em]" style={{ color: "var(--text-tertiary)" }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Company + Legal */}
                <div className="space-y-5">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] opacity-90">
                    Company
                  </h4>
                  <ul className="space-y-4">
                    {[
                      { label: "About", href: "/about" },
                      { label: "Contact", href: "/contact" },
                      { label: "Terms of Service", href: "/terms" },
                      { label: "Privacy Policy", href: "/privacy" },
                    ].map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-[14px] font-bold hover:text-[#ff5100] transition-colors duration-300 tracking-[0.1em]" style={{ color: "var(--text-tertiary)" }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 2: Narrative & Connect */}
            <div className="space-y-8 lg:space-y-10">
              {/* 1. About Us */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] opacity-90">
                  About Us
                </h4>
                <div className="max-w-md">
                  <p className="text-sm font-medium leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
                    We&apos;re three IIM alumni united by one obsession: Adventure.
                    We couldn&apos;t find a platform that made exploring adventures in India simpler — so we built it.
                  </p>
                </div>
              </div>

              {/* 2. Contact Us */}
              <div className="space-y-5">
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] opacity-90">
                  Contact Us
                </h4>
                <div className="flex flex-col gap-5">
                  <button
                    onClick={() => user ? setIsModalOpen(true) : window.location.href = "mailto:hello@trailtotides.com"}
                    className="group flex items-center gap-2.5 px-4 py-2.5 rounded-xl w-fit transition-all duration-500"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
                  >
                    <Mail className="w-3.5 h-3.5 group-hover:text-[#ff5100] transition-colors duration-300 shrink-0" style={{ color: "var(--text-muted)" }} />
                    <span className="text-xs font-semibold group-hover:text-[#ff5100] transition-colors duration-300" style={{ color: "var(--text-tertiary)" }}>
                      hello@trailtotides.com
                    </span>
                  </button>

                  <div className="flex items-center gap-5 lg:gap-7">
                    {[
                      { Icon: Instagram, href: "https://instagram.com/trailtotides", name: "Instagram" },
                      { Icon: Twitter, href: "https://twitter.com/trailtotides", name: "Twitter" },
                      { Icon: Youtube, href: "https://youtube.com/@trailtotides", name: "Youtube" },
                      { Icon: Linkedin, href: "https://linkedin.com/company/trailtotides", name: "Linkedin" }
                    ].map(({ Icon, href, name }, i) => (
                      <a 
                        key={i} 
                        href={href} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-center transition-all duration-300 hover:-translate-y-1.5"
                        aria-label={`Visit our ${name}`}
                      >
                        <Icon className="w-5.5 h-5.5 group-hover:text-[#ff5100] transition-colors duration-300" strokeWidth={1.25} style={{ color: "var(--text-muted)" }} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Brand Bottom Bar */}
        <div className="mt-10 lg:mt-12 pt-6 flex flex-col items-center justify-center gap-3 relative z-10 text-[10px] font-bold tracking-[0.12em] lg:tracking-[0.18em] uppercase text-center" style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                <p>© 2026 <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#ff5100] to-[#ff8c47]">TRAIL</span> <span style={{fontFamily: "var(--font-cursive)"}} className="text-[var(--text-secondary)] text-[13px] normal-case tracking-normal font-normal">to</span> <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-[#3b82f6] to-[#60a5fa]">TIDES</span>. DESIGNED FOR EXPLORERS BY EXPLORERS</p>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 w-[60%] h-[80%] bg-[#ff5100]/[0.02] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-[45%] h-[60%] bg-[#4ade80]/[0.02] blur-[150px] rounded-full pointer-events-none" />

      {user && (
        <MessageModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          userEmail={user.email} 
        />
      )}
    </motion.footer>
  );
}
