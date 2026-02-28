import Link from "next/link";
import { Compass, Instagram, Youtube, Twitter, Mail, Linkedin, Mountain } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative">
        
        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/20 to-transparent" />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          
          {/* Brand Identity */}
          <div className="col-span-2 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/20">
                <Mountain className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-white font-black tracking-tighter text-xl uppercase">TRAIL TO TIDES</span>
            </div>
            <p className="text-white/30 text-[13px] leading-relaxed max-w-xs font-medium tracking-tight">
              Discover and compare epic adventures across India — handpicked by explorers, run by verified operators, mapped with precision — for you
            </p>
            <div className="flex items-center gap-4">
              {[Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="text-white/20 hover:text-[#ff5100] transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Platform Nav */}
          <div className="lg:col-span-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff5100]/80 mb-6">
              Platform
            </h4>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                {[
                  ["EDITORS CHOICE", "/#featured-adventures"],
                  ["SIGNATURE FEATURE", "/#map-cta"],
                  ["FROM THE FIELD", "/#stories"],
                  ["DISCOVER YOUR REGION", "/#regions"],
                  ["DISCOVER YOUR GENRE", "/#styles"],
                ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[11px] text-white/40 hover:text-white transition-all flex items-center group/link font-bold tracking-wider"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Write To Us */}
          <div className="col-span-2 md:col-span-2 lg:col-span-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff5100]/80 mb-6">
              Connect
            </h4>
            <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl relative overflow-hidden group/box">
              <p className="text-white/40 text-[12px] mb-4 font-medium leading-relaxed">Have an idea for a wild expedition or want to collaborate? Write to us.</p>
              
              <a 
                href="mailto:hello@trailtotides.com"
                className="relative z-10 flex items-center justify-between gap-2 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-[12px] font-bold text-white/60 hover:text-white hover:border-[#ff5100]/40 transition-all group/btn"
              >
                <span>hello@trailtotides.com</span>
                <Mail className="w-4 h-4 text-[#ff5100]" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-8">
            {["Terms", "Privacy"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-[10px] text-white/20 hover:text-white font-bold uppercase tracking-[0.2em] transition-colors">
                {item}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
              © 2026 TRAIL TO TIDES
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}

