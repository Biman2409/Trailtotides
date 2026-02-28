import Link from "next/link";
import { Instagram, Youtube, Twitter, Mail, Linkedin, Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-32 relative">
        
        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/20 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-20 lg:gap-24 relative z-10">
          
          {/* Brand Identity */}
          <div className="lg:col-span-5 space-y-10">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-[#ff5100] flex items-center justify-center group-hover:bg-[#ff7d47] transition-all duration-300 shadow-xl shadow-[#ff5100]/20">
                <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-white font-black tracking-tighter text-xl uppercase leading-none">
                TRAIL TO TIDES
              </span>
            </Link>
            
            <p className="text-white/30 text-sm leading-relaxed max-w-sm font-medium tracking-tight">
              India&apos;s definitive adventure discovery engine. Handpicked expeditions, verified operators, and high-precision mapping — engineered for the modern explorer.
            </p>

            <div className="flex items-center gap-6">
              {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="text-white/10 hover:text-[#ff5100] hover:scale-110 transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Nav */}
          <div className="lg:col-span-4 lg:pl-12">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-10 opacity-80">
              Platform
            </h4>
            <ul className="grid grid-cols-1 gap-y-5">
              {[
                ["AI ADVENTURE FINDER", "/#ai-finder"],
                ["EDITORS CHOICE", "/#featured-adventures"],
                ["ADVENTURE MAP", "/#map-cta"],
                ["FROM THE FIELD", "/#stories"],
                ["DISCOVER YOUR REGION", "/#regions"],
                ["DISCOVER YOUR GENRE", "/#styles"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[12px] text-white/40 hover:text-white transition-all flex items-center group/link font-bold tracking-[0.1em]"
                  >
                    <span className="group-hover:translate-x-1.5 transition-transform duration-300">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Write To Us */}
          <div className="lg:col-span-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-10 opacity-80">
              Connect
            </h4>
            <div className="space-y-6">
              <p className="text-white/40 text-[13px] font-medium leading-relaxed">
                Have an idea for a wild expedition or want to collaborate? Write to our dispatch team.
              </p>
              
              <a 
                href="mailto:hello@trailtotides.com"
                className="flex items-center justify-between gap-4 bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-[13px] font-bold text-white/60 hover:text-white hover:border-[#ff5100]/40 hover:bg-white/[0.04] transition-all group/btn"
              >
                <span>hello@trailtotides.com</span>
                <Mail className="w-4 h-4 text-[#ff5100] group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-32 pt-10 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-10">
            {["Terms", "Privacy"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-[10px] text-white/20 hover:text-white font-bold uppercase tracking-[0.25em] transition-colors">
                {item}
              </Link>
            ))}
          </div>
          
          <p className="text-white/10 text-[10px] font-bold uppercase tracking-[0.3em]">
            © 2026 TRAIL TO TIDES — DESIGNED FOR THE BEYOND
          </p>
        </div>

      </div>
    </footer>
  );
}
