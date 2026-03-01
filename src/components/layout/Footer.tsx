"use client";

import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12 lg:py-16 relative">
      
      {/* Subtle Gradient Accent */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/25 to-transparent" />
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-x-32 relative z-10 items-start">
              
              {/* Column 1: Brand, Platform, Legal (Left Aligned) */}
              <div className="space-y-16">
                {/* 1. Brand */}
                <div className="flex flex-col items-start pt-0">
                  <Link href="/" className="flex items-center gap-4 group w-fit mb-4">
                    <div className="w-9 h-9 rounded-xl bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-300 shadow-2xl shadow-[#ff5100]/30">
                      <Mountain className="w-5 h-5 text-white" strokeWidth={2.8} />
                    </div>
                    <span className="text-[#ff5100] font-black tracking-[-0.075em] text-[1.25rem] uppercase leading-none antialiased">
                      TRAIL TO TIDES
                    </span>
                  </Link>
                </div>

                {/* 2. Platform */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100]/90 mb-6 opacity-90">
                    Platform
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5">
                    {[
                      ["AI Adventure Finder", "/#ai-finder"],
                      ["Adventure Map", "/#map-cta"],
                      ["Editors Choice", "/#featured-adventures"],
                      ["Discover Your Region", "/#regions"],
                      ["Discover Your Genre", "/#styles"],
                      ["Stories", "/#stories"],
                      ["Login", "/auth/login"],
                    ].map(([label, href]) => (
                      <li key={label}>
                        <Link href={href} className="text-[11px] text-white/35 hover:text-white transition-all font-bold tracking-[0.1em]">
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Legal */}
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100]/90 mb-6 opacity-90">
                    Legal
                  </h4>
                  <div className="flex items-center gap-x-10">
                    {[
                      ["Terms", "/terms"],
                      ["Privacy", "/privacy"],
                    ].map(([label, href]) => (
                      <Link key={label} href={href} className="text-[11px] text-white/35 hover:text-white transition-all font-bold tracking-[0.1em]">
                        {label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Column 2: About us, Contact us (Right Aligned) */}
              <div className="md:text-right flex flex-col md:items-end space-y-16">
                {/* 4. About us */}
                <div className="max-w-md">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100]/90 mb-6 opacity-90">
                    About Us
                  </h4>
                  <p className="text-white/40 text-[11px] font-medium leading-relaxed tracking-wider whitespace-pre-line md:text-right">
                    We’re three IIM alumni united by one obsession: Adventure.
                    We couldn’t find a platform that made exploring adventures in India simpler — so we built it.
                    TrailToTides makes exploring India effortless, intelligent, and exciting.
                  </p>
                </div>

                {/* 5. Contact us */}
                <div className="flex flex-col md:items-end">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100]/90 mb-6 opacity-90">
                    Contact Us
                  </h4>
                  <div className="flex items-center gap-6 mb-8 md:justify-end">
                    {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                      <a key={i} href="#" className="text-white/15 hover:text-[#ff5100] hover:scale-110 transition-all duration-300">
                        <Icon className="w-4.5 h-4.5" />
                      </a>
                    ))}
                  </div>
                  <a href="mailto:hello@trailtotides.com" className="text-[11px] font-bold text-white/20 hover:text-white/50 transition-colors tracking-widest uppercase block w-fit border border-white/5 px-4 py-2 rounded-lg hover:border-[#ff5100]/30">
                    hello@trailtotides.com
                  </a>
                </div>
              </div>

            </div>



              </div>

          {/* Bottom Bar */}
            <div className="pt-10 border-t border-white/[0.04] flex items-center justify-center relative z-10">
              <p className="text-white/20 text-[10px] font-bold tracking-[0.2em] text-center uppercase">
                © 2026 TRAIL TO TIDES — DESIGNED BY EXPLORERS FOR EXPLORERS
              </p>
              </div>

    </footer>

  );
}
