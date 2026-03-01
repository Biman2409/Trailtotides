import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-40 relative">
        
        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/25 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-24 relative z-10">
            
                {/* Brand Identity */}
                <div className="lg:col-span-4 space-y-10">
                    <Link href="/" className="flex items-center gap-3.5 group w-fit">
                        <div className="w-11 h-11 rounded-lg bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-300 shadow-2xl shadow-[#ff5100]/20">
                          <Mountain className="w-6 h-6 text-white" strokeWidth={2.8} />
                        </div>
                        <span className="text-[#ff5100] font-black tracking-[-0.075em] text-[1.45rem] uppercase leading-none antialiased">
                          TRAIL TO TIDES
                        </span>
                    </Link>
                    
                    <p className="text-white/40 text-[14px] leading-relaxed max-w-[320px] font-medium tracking-tight">
                      Discover and compare epic adventures across India — handpicked by explorers, run by verified operators, mapped with precision — for you
                    </p>
                </div>

                {/* Connect Section */}
                <div className="lg:col-span-5 lg:pl-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100]/80 mb-10">
                    Connect
                  </h4>
                  <div className="space-y-8">
                    <p className="text-white/45 text-[14px] font-medium leading-relaxed max-w-sm">
                      Have an idea for a wild expedition or want to collaborate? Feel free to connect with us.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                        <a 
                          href="mailto:hello@trailtotides.com"
                          className="text-[14px] font-bold text-[#ff5100] hover:text-white transition-colors relative group/email"
                        >
                          hello@trailtotides.com
                          <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-white transition-all duration-300 group-hover/email:w-full opacity-30" />
                        </a>

                        <div className="flex items-center gap-6">
                          {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                            <a 
                              key={i}
                              href="#" 
                              className="text-white/20 hover:text-[#ff5100] hover:scale-110 transition-all duration-300"
                            >
                              <Icon className="w-4 h-4" />
                            </a>
                          ))}
                        </div>
                    </div>
                  </div>
                </div>

                {/* Platform Nav */}
                <div className="lg:col-span-3 lg:pl-12">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100]/80 mb-10">
                    Platform
                  </h4>
                  <ul className="grid grid-cols-1 gap-y-5">
                    {[
                      ["AI ADVENTURE FINDER", "/#ai-finder"],
                      ["EDITORS CHOICE", "/#featured-adventures"],
                      ["ADVENTURE MAP", "/#map-cta"],
                      ["DISCOVER YOUR REGION", "/#regions"],
                      ["DISCOVER YOUR GENRE", "/#styles"],
                      ["STORIES", "/#stories"],
                    ].map(([label, href]) => (
                      <li key={label}>
                        <Link
                          href={href}
                          className="text-[12px] text-white/35 hover:text-white transition-all flex items-center group/link font-bold tracking-[0.1em]"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-300">{label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

          </div>

          {/* Bottom Bar */}
          <div className="mt-32 pt-10 border-t border-white/[0.03] flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-10">
              {["Terms", "Privacy"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="text-[10px] text-white/20 hover:text-white font-bold uppercase tracking-[0.25em] transition-colors">
                  {item}
                </Link>
              ))}
            </div>
            
            <p className="text-white/10 text-[10px] font-bold uppercase tracking-[0.3em]">
              © 2026 TRAIL TO TIDES — DESIGNED BY EXPLORERS FOR EXPLORERS
            </p>
          </div>

      </div>
    </footer>
  );
}
