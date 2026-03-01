"use client";

import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] relative overflow-hidden">
      {/* Subtle Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-24 lg:gap-40">
            
            {/* Column 1: Identity, Platform, Legal */}
            <div className="space-y-16">
              {/* 1. Branding */}
              <div className="flex flex-col gap-6 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-500 shadow-2xl shadow-[#ff5100]/25 group-hover:rotate-6">
                    <Mountain className="w-6.5 h-6.5 text-white" strokeWidth={3} />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[#ff5100] font-black tracking-[-0.05em] text-[1.75rem] leading-none antialiased group-hover:text-white transition-colors duration-500 uppercase">
                        TRAIL TO TIDES
                      </span>
                    </div>
                  </div>
                </div>

              <div className="grid grid-cols-2 gap-16">
                {/* 2. Platform */}
                <div className="space-y-7">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-[#ff5100] opacity-90">
                    Platform
                  </h4>
                  <ul className="space-y-5">
                    {[
                      { label: "Explore", href: "/explore" },
                      { label: "Map View", href: "/map" },
                      { label: "Stories", href: "/stories" },
                      { label: "Plan Trip", href: "/plan" },
                    ].map((link) => (
                      <li key={link.label}>
                        <Link 
                          href={link.href}
                          className="text-[14px] font-bold text-white/35 hover:text-[#ff5100] transition-colors duration-300 tracking-[0.1em]"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Legal */}
                <div className="space-y-7">
                  <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-[#ff5100] opacity-90">
                    Legal
                  </h4>
                  <ul className="space-y-5">
                    {[
                      { label: "Terms of Service", href: "/terms" },
                      { label: "Privacy Policy", href: "/privacy" },
                    ].map((link) => (
                      <li key={link.label}>
                        <Link 
                          href={link.href}
                          className="text-[14px] font-bold text-white/35 hover:text-[#ff5100] transition-colors duration-300 tracking-[0.1em]"
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
            <div className="space-y-20">
              {/* 1. About Us */}
              <div className="space-y-6">
                <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-[#ff5100] opacity-90">
                  About Us
                </h4>
                  <div className="max-w-md">
                    <p className="text-white/45 text-[15px] font-medium leading-[1.8] tracking-wide">
                      We’re three IIM alumni united by one obsession: Adventure.
                      We couldn’t find a platform that made exploring adventures in India simpler — so we built it.
                    </p>
                  </div>
              </div>

              {/* 2. Contact Us */}
              <div className="space-y-7">
                <h4 className="text-[11px] font-black uppercase tracking-[0.45em] text-[#ff5100] opacity-90">
                  Contact Us
                </h4>
                <div className="flex flex-col gap-10">
                  <a 
                    href="mailto:hello@trailtotides.com" 
                    className="group flex items-center gap-5 bg-white/[0.015] border border-white/[0.04] hover:border-[#ff5100]/40 px-8 py-4 rounded-2xl w-fit transition-all duration-500 hover:bg-white/[0.035] shadow-lg shadow-black/5"
                  >
                    <Mail className="w-4.5 h-4.5 text-white/15 group-hover:text-[#ff5100] transition-colors duration-300" />
                    <span className="text-[13px] font-bold text-white/35 group-hover:text-white transition-colors duration-300 tracking-[0.14em]">
                      hello@trailtotides.com
                    </span>
                  </a>
                  
                  <div className="flex items-center gap-10">
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
                        <Icon className="w-5.5 h-5.5 text-white/15 group-hover:text-[#ff5100] transition-colors duration-300" strokeWidth={1.25} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        {/* Brand Bottom Bar */}
        <div className="mt-20 pt-10 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase text-center md:text-left">
          <p>© 2026 TRAIL TO TIDES</p>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 w-[60%] h-[80%] bg-[#ff5100]/[0.02] blur-[150px] rounded-full pointer-events-none" />
    </footer>
  );
}
