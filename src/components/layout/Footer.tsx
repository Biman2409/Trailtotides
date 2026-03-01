"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain, ArrowUp } from "lucide-react";

export default function Footer() {
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const [buttonBottom, setButtonBottom] = useState(24);
  const lastScrollYRef = useRef(0);
  const footerRef = useRef<HTMLElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleScroll = () => {
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollYRef.current;
        lastScrollYRef.current = currentScrollY;
        
        if (footerRef.current && anchorRef.current) {
          const footerRect = footerRef.current.getBoundingClientRect();
          const anchorRect = anchorRef.current.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          
          const distFromBottom = viewportHeight - anchorRect.top;
          
          // Docking logic: button follows the anchor once it passes the threshold (24px)
          setButtonBottom(Math.max(24, distFromBottom));

          const isAtFooter = footerRect.top < viewportHeight;
          
          // Show condition: 
          // 1. If we are in the footer area (isAtFooter)
          // 2. OR if we are scrolling down and have passed 300px
          // Hide condition:
          // 1. Always hide if scrolling up AND NOT in footer area
          const shouldShow = isAtFooter || (scrollingDown && currentScrollY > 300);
          setShowFloatingButton(shouldShow);
        }
      };



    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

    return (
      <footer ref={footerRef} className="bg-[#05070a] text-white border-t border-white/[0.03] overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4 lg:py-6 relative">
        
        {/* Anchor point for docking the back to top button */}
        <div ref={anchorRef} className="absolute bottom-[4rem] left-1/2 -translate-x-1/2 w-10 h-10 pointer-events-none" />

        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/25 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 relative z-10 items-start">
            
            {/* Brand & Identity */}
            <div className="space-y-6">
                <Link href="/" className="flex items-center gap-4 group w-fit">
                    <div className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-300 shadow-2xl shadow-[#ff5100]/20">
                      <Mountain className="w-4 h-4 text-white" strokeWidth={2.8} />
                    </div>
                      <span className="text-[#ff5100] font-black tracking-[-0.075em] text-[1.125rem] uppercase leading-none antialiased">
                      TRAIL TO TIDES
                    </span>
                </Link>
            </div>

            {/* Platform Nav */}
            <div className="lg:pt-1">
              <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff5100]/80 mb-5 opacity-80">
                Platform
              </h4>
                  <ul className="grid grid-cols-1 gap-y-3">
                      {[
                        ["AI ADVENTURE FINDER", "/#ai-finder"],
                        ["ADVENTURE MAP", "/#map-cta"],
                        ["EDITORS CHOICE", "/#featured-adventures"],
                        ["DISCOVER YOUR REGION", "/#regions"],
                        ["DISCOVER YOUR GENRE", "/#styles"],
                        ["STORIES", "/#stories"],
                        ["LOGIN", "/auth/login"],
                      ].map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[10px] text-white/30 hover:text-white transition-all flex items-center group/link font-bold tracking-[0.12em]"
                      >
                        <span className="group-hover:translate-x-1.5 transition-transform duration-300">{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
            </div>

            {/* Legal Nav */}
            <div className="lg:pt-1">
              <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff5100]/80 mb-5 opacity-80">
                Legal
              </h4>
                  <ul className="grid grid-cols-1 gap-y-3">
                      {[
                        ["Terms", "/terms"],
                        ["Privacy", "/privacy"],
                      ].map(([label, href]) => (
                    <li key={label}>
                      <Link
                        href={href}
                        className="text-[10px] text-white/30 hover:text-white transition-all flex items-center group/link font-bold tracking-[0.12em]"
                      >
                        <span className="group-hover:translate-x-1.5 transition-transform duration-300">{label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
            </div>

            {/* About & Contact Column */}
            <div className="lg:-mt-28 space-y-10">
              <div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff5100]/80 mb-4 opacity-80">
                  ABOUT US
                </h4>
                <p className="text-white/30 text-[10px] font-medium leading-relaxed tracking-wider max-w-[200px]">
                  The premier map-based discovery platform for high-impact adventures across the Indian Subcontinent. 
                  Handpicked by explorers, run by verified operators, mapped with precision.
                </p>
              </div>

              <div>
                <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff5100]/80 mb-2 opacity-80">
                  CONTACT US
                </h4>
                <div className="space-y-3">
                  <p className="text-white/40 text-[11px] font-medium leading-relaxed">
                    Have an idea for a wild expedition or want to collaborate?<br />
                    Feel free to connect with us.
                  </p>
                  
                  <a 
                    href="mailto:hello@trailtotides.com"
                    className="text-[11px] font-bold text-[#ff5100] hover:text-white transition-colors relative group/email w-fit block"
                  >
                    hello@trailtotides.com
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#ff5100] transition-all duration-300 group-hover/email:w-full opacity-60" />
                  </a>
                  
                  <div className="flex items-center gap-5 pt-2">
                    {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                      <a 
                        key={i}
                        href="#" 
                        className="text-white/10 hover:text-[#ff5100] hover:scale-110 transition-all duration-300"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

      {/* Fixed Floating Back to Top - Moves to dock above terms/privacy when at footer */}
      <div 
        className={`fixed left-1/2 -translate-x-1/2 z-[1001] transition-opacity duration-500 ease-out ${
          showFloatingButton ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        style={{ bottom: `${buttonBottom}px` }}
      >
        <button
          onClick={scrollToTop}
          className="p-3 bg-white/[0.01] backdrop-blur-3xl border border-white/[0.02] rounded-full text-white/5 hover:text-[#ff5100]/60 hover:bg-white/[0.03] hover:border-white/[0.05] transition-all duration-500 group shadow-2xl"
          aria-label="Back to top"
        >
          <ArrowUp className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </div>



          {/* Bottom Bar */}
            <div className="pt-8 border-t border-white/[0.04] flex items-center justify-center relative z-10">
              <p className="text-white/20 text-[10px] font-bold tracking-[0.2em] text-center uppercase">
                © 2026 TRAIL TO TIDES — DESIGNED BY EXPLORERS FOR EXPLORERS
              </p>
            </div>

    </div>
  </footer>
  );
}
