"use client";

import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] relative overflow-hidden">
      {/* Subtle Gradient Accent */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/20 to-transparent" />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-24 relative z-10">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-16">
          
          {/* 1. About Us (Founding Story) */}
          <div className="space-y-6">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#ff5100] opacity-80">
              About Us
            </h4>
            <p className="text-white/50 text-base md:text-lg font-medium leading-[1.7] tracking-wide">
              We’re three IIM alumni united by one obsession: Adventure.
              We couldn’t find a platform that made exploring adventures in India simpler — so we built it.
              <br />
              <span className="text-white/30 text-sm mt-4 block">
                TrailToTides makes exploring India effortless, intelligent, and exciting.
              </span>
            </p>
          </div>

          {/* 2. Connect With Us */}
          <div className="flex flex-col items-center space-y-8 w-full">
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
                  className="group flex items-center justify-center transition-all duration-300 hover:-translate-y-1"
                  aria-label={`Visit our ${name}`}
                >
                  <Icon className="w-6 h-6 text-white/20 group-hover:text-[#ff5100] transition-colors duration-300" strokeWidth={1.5} />
                </a>
              ))}
            </div>
            
            <a 
              href="mailto:hello@trailtotides.com" 
              className="group flex items-center gap-4 bg-white/[0.02] border border-white/[0.05] hover:border-[#ff5100]/30 px-8 py-4 rounded-2xl transition-all duration-500 hover:bg-white/[0.04]"
            >
              <Mail className="w-4 h-4 text-white/20 group-hover:text-[#ff5100] transition-colors duration-300" />
              <span className="text-[13px] font-bold text-white/40 group-hover:text-white transition-colors duration-300 tracking-[0.12em]">
                hello@trailtotides.com
              </span>
            </a>
          </div>

          {/* 3. Brand Signature */}
          <div className="pt-8 w-full border-t border-white/[0.03]">
            <div className="flex flex-col items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-500 shadow-2xl shadow-[#ff5100]/20 group-hover:rotate-6">
                <Mountain className="w-7 h-7 text-white" strokeWidth={2.8} />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[#ff5100] font-black tracking-[-0.05em] text-[1.6rem] leading-none antialiased group-hover:text-white transition-colors duration-500 uppercase">
                  TRAIL TO TIDES
                </span>
                <span className="text-white/20 text-[10px] font-bold tracking-[0.4em] uppercase mt-2">
                  India's Adventure Engine
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Bottom Bar */}
        <div className="mt-20 pt-10 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">
          <p>© 2026 TRAIL TO TIDES</p>
          <div className="flex items-center gap-8">
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <span className="opacity-50">Designed by Explorers for Explorers</span>
          </div>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute bottom-0 right-1/2 translate-x-1/2 w-[60%] h-[80%] bg-[#ff5100]/[0.03] blur-[150px] rounded-full pointer-events-none" />
    </footer>
  );
}
