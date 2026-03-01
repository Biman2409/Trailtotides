"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain, ArrowUp } from "lucide-react";

export default function Footer() {
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingButton(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer ref={footerRef} className="bg-[#05070a] text-white border-t border-white/[0.03] overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 relative">
        
        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/25 to-transparent" />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-32 relative z-10 items-start">
          
                {/* Brand & Connect Identity */}
                <div className="space-y-6">
                    {/* Description Block */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-4 group w-fit">
                            <div className="w-9 h-9 rounded-lg bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-300 shadow-2xl shadow-[#ff5100]/20">
                              <Mountain className="w-5 h-5 text-white" strokeWidth={2.8} />
                            </div>
                              <span className="text-[#ff5100] font-black tracking-[-0.075em] text-[1.25rem] uppercase leading-none antialiased">
                              TRAIL TO TIDES
                            </span>
                        </Link>
                        
                            <p className="text-white/45 text-[13px] leading-relaxed max-w-[440px] font-medium tracking-tight">
                              Discover and compare epic adventures across Indian Subcontinent — handpicked by explorers, run by verified operators, mapped with precision — for you.
                            </p>
                    </div>

                    {/* Connect Block */}
                    <div className="space-y-4">
                      <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff5100]/80 opacity-80">
                        Connect
                      </h4>
                      <div className="space-y-4">
                        <p className="text-white/50 text-[13px] font-medium leading-relaxed max-w-xl">
                          Have an idea for a wild expedition or want to collaborate? Feel free to connect with us.
                        </p>
                        
                            <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
                                <a 
                                  href="mailto:hello@trailtotides.com"
                                  className="text-[13px] font-bold text-[#ff5100] hover:text-white transition-colors relative group/email w-fit"
                                >
                                  hello@trailtotides.com
                                  <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#ff5100] transition-all duration-300 group-hover/email:w-full opacity-60" />
                                </a>
                                
                                <div className="flex items-center gap-6">
                                  {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                                    <a 
                                      key={i}
                                      href="#" 
                                      className="text-white/15 hover:text-[#ff5100] hover:scale-110 transition-all duration-300 p-1"
                                    >
                                      <Icon className="w-[0.9rem] h-[0.9rem]" />
                                    </a>
                                  ))}
                                </div>
                            </div>

                      </div>
                    </div>
                </div>

                {/* Platform Nav */}
                <div className="lg:pt-0 w-full lg:max-w-[200px]">
                  <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-[#ff5100]/80 mb-6 opacity-80">
                    Platform
                  </h4>
                    <ul className="grid grid-cols-1 gap-y-3.5">
                        {[
                          ["EDITORS CHOICE", "/#featured-adventures"],
                          ["ADVENTURE MAP", "/#map-cta"],
                          ["DISCOVER YOUR REGION", "/#regions"],
                          ["DISCOVER YOUR GENRE", "/#styles"],
                          ["STORIES", "/#stories"],
                          ["LOGIN", "/auth/login"],
                        ].map(([label, href]) => (
                        <li key={label}>
                          <Link
                            href={href}
                            className="text-[10px] text-white/35 hover:text-white transition-all flex items-center group/link font-bold tracking-[0.12em]"
                          >
                            <span className="group-hover:translate-x-1.5 transition-transform duration-300">{label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>

                </div>


        </div>

      {/* Single Subtle Back to Top - Centered above bottom bar divider */}
      <div className="mt-8 mb-4 flex justify-center">
        <button
          onClick={scrollToTop}
          className={`p-3 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.03] rounded-full text-white/10 hover:text-[#ff5100] hover:bg-white/[0.05] hover:border-white/[0.1] transition-all duration-1000 group shadow-2xl ${
            showFloatingButton ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
          }`}
          aria-label="Back to top"
        >
          <ArrowUp className="w-3.5 h-3.5" strokeWidth={2.5} />
        </button>
      </div>


        {/* Bottom Bar */}
          <div className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-10">
              {["Terms", "Privacy"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="text-[9px] text-white/25 hover:text-white font-bold uppercase tracking-[0.3em] transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          
          <p className="text-white/12 text-[9px] font-bold uppercase tracking-[0.35em]">
            © 2026 TRAIL TO TIDES — DESIGNED BY EXPLORERS FOR EXPLORERS
          </p>
        </div>

    </div>
  </footer>
  );
}
