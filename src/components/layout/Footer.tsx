import Link from "next/link";
import { Mountain, Instagram, Youtube, Twitter, Send, ArrowUpRight, Github, Globe } from "lucide-react";

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
                <Compass className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-white font-black tracking-tighter text-xl uppercase">COMPASS.AI</span>
            </div>
            <p className="text-white/30 text-[13px] leading-relaxed max-w-xs font-medium tracking-tight">
              Architecting authentic discovery across the Indian subcontinent. We aggregate the extraordinary, from Himalayan summits to Andaman reefs.
            </p>
            <div className="flex items-center gap-4">
              {[Instagram, Twitter, Youtube, Github].map((Icon, i) => (
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

          {/* Quick Nav */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff5100]/80 mb-6">
              Expeditions
            </h4>
            <ul className="space-y-3">
              {[
                ["Himalayas", "/explore?region=Himalayas"],
                ["Western Ghats", "/explore?region=Western+Ghats"],
                ["Islands", "/explore?region=Islands"],
                ["Northeast", "/explore?region=Northeast"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/40 hover:text-white transition-all flex items-center group/link font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff5100]/80 mb-6">
              Disciplines
            </h4>
            <ul className="space-y-3">
              {[
                ["Trekking", "/explore?type=Trekking"],
                ["Diving", "/explore?type=Diving"],
                ["Biking", "/explore?type=Biking"],
                ["Alpine", "/explore?type=Mountaineering"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/40 hover:text-white transition-all flex items-center group/link font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / Dispatch */}
          <div className="col-span-2 md:col-span-2 lg:col-span-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#ff5100]/80 mb-6">
              The Dispatch
            </h4>
            <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl relative overflow-hidden group/box">
              <p className="text-white/40 text-[12px] mb-4 font-medium leading-relaxed">Join 12,000+ for bi-weekly deep dives into India&apos;s wildest corners.</p>
              
              <div className="relative z-10 flex gap-2">
                <input 
                  type="email" 
                  placeholder="Join our network" 
                  className="bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-[12px] outline-none focus:border-[#ff5100]/40 transition-all flex-1 font-medium"
                />
                <button className="bg-[#ff5100] text-white p-2.5 rounded-xl transition-all hover:bg-[#ff7d47] group/btn">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-8">
            {["Terms", "Privacy", "Security"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-[10px] text-white/20 hover:text-white font-bold uppercase tracking-[0.2em] transition-colors">
                {item}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-white/40 font-bold uppercase tracking-[0.1em]">Nodes Synchronized</span>
            </div>
            <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
              © 2026 COMPASS.AI
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}

