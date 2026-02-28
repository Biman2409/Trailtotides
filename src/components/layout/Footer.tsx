import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-40 relative">
        
        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/25 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-24 lg:gap-32 relative z-10">
          
            {/* Brand Identity */}
            <div className="lg:col-span-5 space-y-12">
                <Link href="/" className="flex items-center gap-4 group w-fit">
                    <div className="w-12 h-12 rounded-xl bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-300 shadow-2xl shadow-[#ff5100]/20">
                      <Mountain className="w-6 h-6 text-white" strokeWidth={2.8} />
                    </div>
                      <span className="text-[#ff5100] font-black tracking-[-0.075em] text-[1.45rem] uppercase leading-none antialiased">
                        TRAIL TO TIDES
                      </span>
                </Link>
                
                <div className="space-y-8">
                  <p className="text-white/40 text-base leading-relaxed max-w-sm font-medium tracking-tight">
                    Discover and compare epic adventures across India — handpicked by explorers, run by verified operators, mapped with precision — for you
                  </p>
                </div>
            </div>

            {/* Platform Nav */}
            <div className="lg:col-span-4 lg:pl-16">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-12 opacity-80">
                Platform
              </h4>
              <ul className="grid grid-cols-1 gap-y-6">
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
                      className="text-[13px] text-white/45 hover:text-white transition-all flex items-center group/link font-bold tracking-[0.1em]"
                    >
                      <span className="group-hover:translate-x-1.5 transition-transform duration-300">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Connect */}
            <div className="lg:col-span-3">
              <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-12 opacity-80">
                Connect
              </h4>
              <div className="space-y-8">
                <p className="text-white/45 text-[14px] font-medium leading-relaxed">
                  Have an idea for a wild expedition or want to collaborate? Feel free to connect with us.
                </p>
                
                <a 
                  href="mailto:hello@trailtotides.com"
                  className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 text-[14px] font-bold text-white/60 hover:text-white hover:border-[#ff5100]/40 hover:bg-white/[0.04] transition-all group/btn"
                >
                  <span>hello@trailtotides.com</span>
                  <Mail className="w-5 h-5 text-[#ff5100] group-hover:scale-110 transition-transform" />
                </a>

                <div className="pt-2">
                  <div className="flex items-center gap-6">
                    {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                      <a 
                        key={i}
                        href="#" 
                        className="text-white/20 hover:text-[#ff5100] hover:scale-110 transition-all duration-300"
                      >
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-40 pt-12 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-12">
            {["Terms", "Privacy"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-[11px] text-white/25 hover:text-white font-bold uppercase tracking-[0.25em] transition-colors">
                {item}
              </Link>
            ))}
          </div>
          
          <p className="text-white/15 text-[11px] font-bold uppercase tracking-[0.3em]">
            © 2026 TRAIL TO TIDES — DESIGNED FOR THE BEYOND
          </p>
        </div>

      </div>
    </footer>
  );
}
