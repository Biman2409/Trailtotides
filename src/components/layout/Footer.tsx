import Link from "next/link";
import { Mountain, Instagram, Youtube, Twitter, Send, ArrowUpRight, Github, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#05070a] text-white border-t border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 relative">
        
        {/* Subtle Gradient Accent */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#ff5100]/20 to-transparent" />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-8 lg:gap-12 relative z-10">
          
          {/* Brand Identity */}
          <div className="col-span-2 lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#ff5100] flex items-center justify-center shadow-md shadow-[#ff5100]/10">
                <Mountain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-black tracking-tighter text-lg uppercase">COMPASS.AI</span>
            </div>
            <p className="text-white/20 text-[12px] leading-relaxed max-w-xs font-medium tracking-tight">
              Architecting authentic discovery across the Indian subcontinent. We aggregate the extraordinary, from Himalayan summits to Andaman reefs.
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Twitter, Youtube, Github].map((Icon, i) => (
                <a 
                  key={i}
                  href="#" 
                  className="w-8 h-8 rounded-lg border border-white/[0.03] bg-white/[0.01] flex items-center justify-center text-white/20 hover:text-[#ff5100] hover:border-[#ff5100]/20 hover:bg-[#ff5100]/5 transition-all duration-300"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Nav */}
          <div className="lg:col-span-2">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff5100]/60 mb-5">
              Expeditions
            </h4>
            <ul className="space-y-2.5">
              {[
                ["Himalayas", "/explore?region=Himalayas"],
                ["Western Ghats", "/explore?region=Western+Ghats"],
                ["Islands", "/explore?region=Islands"],
                ["Northeast", "/explore?region=Northeast"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[12px] text-white/25 hover:text-white transition-all flex items-center group/link font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff5100]/60 mb-5">
              Disciplines
            </h4>
            <ul className="space-y-2.5">
              {[
                ["Trekking", "/explore?type=Trekking"],
                ["Diving", "/explore?type=Diving"],
                ["Biking", "/explore?type=Biking"],
                ["Alpine", "/explore?type=Mountaineering"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[12px] text-white/25 hover:text-white transition-all flex items-center group/link font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Dispatch */}
          <div className="col-span-2 md:col-span-2 lg:col-span-4">
            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-[#ff5100]/60 mb-5">
              The Dispatch
            </h4>
            <div className="bg-white/[0.01] border border-white/[0.03] p-4 rounded-xl relative overflow-hidden group/box">
              <p className="text-white/40 text-[11px] mb-3 font-medium leading-relaxed relative z-10">Join 12,000+ for bi-weekly deep dives into India&apos;s wildest corners.</p>
              
              <div className="relative z-10 flex gap-2">
                <input 
                  type="email" 
                  placeholder="Join our network" 
                  className="bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 text-[11px] outline-none focus:border-[#ff5100]/20 transition-all flex-1 font-medium"
                />
                <button className="bg-[#ff5100]/90 hover:bg-[#ff5100] text-white p-1.5 rounded-lg transition-all group/btn">
                  <Send className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 animate-pulse" />
              <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.15em]">Nodes Synchronized</span>
            </div>
            <div className="hidden sm:flex items-center gap-6">
              {["Terms", "Privacy"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase()}`} className="text-[9px] text-white/10 hover:text-white font-bold uppercase tracking-[0.1em] transition-colors">
                  {item}
                </Link>
              ))}
            </div>
          </div>
          
          <p className="text-white/10 text-[9px] font-bold uppercase tracking-[0.2em]">
            © 2026 COMPASS.AI
          </p>
        </div>

      </div>
    </footer>
  );
}

