"use client";

import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] relative overflow-hidden">
      {/* Subtle Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
          
          {/* Left Side: Brand, Platform, Legal (Discovery Focus) */}
          <div className="lg:col-span-7 space-y-16">
            {/* 1. Brand Signature */}
            <div className="flex flex-col items-start pt-0 group">
              <Link href="/" className="flex items-center gap-4 group w-fit mb-6">
                <div className="w-10 h-10 rounded-xl bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-500 shadow-2xl shadow-[#ff5100]/20 group-hover:rotate-6">
                  <Mountain className="w-6 h-6 text-white" strokeWidth={2.8} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#ff5100] font-black tracking-[-0.05em] text-[1.4rem] leading-none antialiased group-hover:text-white transition-colors duration-500">
                    TRAIL TO TIDES
                  </span>
                  <span className="text-white/20 text-[9px] font-bold tracking-[0.3em] uppercase mt-1">
                    India's Adventure Engine
                  </span>
                </div>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 lg:gap-16">
              {/* 2. Platform Navigation */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ff5100] opacity-80 mb-6">
                  Platform
                </h4>
                <ul className="grid grid-cols-1 gap-y-4">
                  {[
                    ["AI Adventure Finder", "/#ai-finder"],
                    ["Adventure Map", "/#map-cta"],
                    ["Editor's Choice", "/#featured-adventures"],
                    ["Discover Your Region", "/#regions"],
                    ["Discover Your Genre", "/#styles"],
                    ["Stories", "/#stories"],
                    ["Partner Portal", "/auth/login"],
                  ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-[12px] text-white/40 hover:text-white transition-all duration-300 font-medium tracking-wide inline-block hover:translate-x-1">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 3. Legal Protocols */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ff5100] opacity-80 mb-6">
                  Legal
                </h4>
                <ul className="grid grid-cols-1 gap-y-4">
                  {[
                      ["Terms & Conditions", "/terms"],
                      ["Privacy Policy", "/privacy"],
                    ].map(([label, href]) => (
                    <li key={label}>
                      <Link href={href} className="text-[12px] text-white/40 hover:text-white transition-all duration-300 font-medium tracking-wide inline-block hover:translate-x-1">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

            {/* Right Side: Narrative & Contact (Identity Focus) */}
            <div className="lg:col-span-5 flex flex-col lg:items-end space-y-20">
              {/* 4. About Us (Founding Story) */}
              <div className="max-w-md lg:text-right">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ff5100] opacity-80 mb-8">
                  About Us
                </h4>
                <p className="text-white/40 text-[13px] font-medium leading-[1.8] tracking-wide whitespace-pre-line">
                  We’re three IIM alumni united by one obsession: Adventure.
                  We couldn’t find a platform that made exploring adventures in India simpler — so we built it.
                  
                  TrailToTides makes exploring India effortless, intelligent, and exciting.
                </p>
              </div>

              {/* 5. Contact Us */}
              <div className="flex flex-col lg:items-end space-y-10">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ff5100] opacity-80">
                  Connect With Us
                </h4>
                <div className="flex flex-col lg:items-end gap-8">
                  <div className="flex items-center gap-8 lg:justify-end">
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
                        className="group flex items-center justify-center transition-all duration-300"
                        aria-label={`Visit our ${name}`}
                      >
                        <Icon className="w-5 h-5 text-white/15 group-hover:text-[#ff5100] transition-colors duration-300" strokeWidth={1.5} />
                      </a>
                    ))}
                  </div>
                  
                  <a 
                    href="mailto:hello@trailtotides.com" 
                    className="group flex items-center gap-3"
                  >
                    <Mail className="w-4 h-4 text-white/20 group-hover:text-[#ff5100] transition-colors duration-300" />
                    <span className="text-[12px] font-bold text-white/30 group-hover:text-white transition-colors duration-300 tracking-[0.1em]">
                      hello@trailtotides.com
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Brand Bottom Bar */}
          <div className="mt-24 pt-12 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <p className="text-white/20 text-[10px] font-bold tracking-[0.2em] uppercase">
              © 2026 TRAIL TO TIDES
            </p>
            <p className="text-white/10 text-[10px] font-bold tracking-[0.2em] uppercase">
              DESIGNED BY EXPLORERS FOR EXPLORERS
            </p>
          </div>
        </div>

      {/* Background Decor */}
      <div className="absolute bottom-0 right-0 w-[40%] h-[60%] bg-[#ff5100]/[0.02] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-0 w-[30%] h-[40%] bg-[#ff5100]/[0.01] blur-[100px] rounded-full pointer-events-none" />
    </footer>
  );
}
