import Link from "next/link";
import { Mountain, Instagram, Youtube, Twitter, Send, ArrowUpRight, Github, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0e14] text-white border-t border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 relative">
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-[#ff5100]/5 to-transparent blur-[100px] pointer-events-none" />

        {/* Architectural Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-12 lg:gap-8 mb-16 relative z-10">
          
          {/* Brand Identity column */}
          <div className="col-span-2 lg:col-span-4 lg:pr-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/20">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-black tracking-tighter text-xl uppercase">COMPASS.AI</span>
            </div>
            <p className="text-white/30 text-[13px] leading-relaxed mb-6 max-w-sm font-medium tracking-wide">
              Architecting authentic discovery across the Indian subcontinent. We aggregate the extraordinary, from Himalayan summits to Andaman reefs.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Github, href: "#" },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  className="w-9 h-9 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-[#ff5100] hover:border-[#ff5100]/30 hover:bg-[#ff5100]/5 transition-all duration-300"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-6">
              Expeditions
            </h4>
            <ul className="space-y-3.5">
              {[
                ["Himalayas", "/explore?region=Himalayas"],
                ["Western Ghats", "/explore?region=Western+Ghats"],
                ["Islands", "/explore?region=Islands"],
                ["Northeast", "/explore?region=Northeast"],
                ["Desert", "/explore?region=Desert"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/30 hover:text-white transition-all duration-300 flex items-center group/link font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 group-hover/link:text-[#ff5100] ml-2 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-6">
              Disciplines
            </h4>
            <ul className="space-y-3.5">
              {[
                ["Trekking", "/explore?type=Trekking"],
                ["Diving", "/explore?type=Diving"],
                ["Watersports", "/explore?type=Watersports"],
                ["Biking", "/explore?type=Biking"],
                ["Mountaineering", "/explore?type=Mountaineering"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/30 hover:text-white transition-all duration-300 flex items-center group/link font-medium"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 group-hover/link:text-[#ff5100] ml-2 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 lg:pl-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-6">
              The Dispatch
            </h4>
            <div className="bg-white/[0.02] border border-white/[0.05] p-5 rounded-2xl relative overflow-hidden group/box">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ff5100]/5 blur-3xl rounded-full" />
              <p className="text-white font-bold text-base mb-1.5 relative z-10">Curated Guides.</p>
              <p className="text-white/30 text-xs mb-4 font-medium leading-relaxed relative z-10">Join 12,000+ explorers for bi-weekly deep dives into India&apos;s wildest corners.</p>
              
              <div className="relative z-10 flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs outline-none focus:border-[#ff5100]/40 transition-all flex-1 font-medium"
                />
                <button className="bg-[#ff5100] hover:bg-[#ff7d47] text-white p-2 rounded-xl transition-all group/btn">
                  <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Global Network bar */}
        <div className="border-t border-white/[0.03] pt-10 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <Globe className="w-3 h-3 text-white/20" />
              <span className="text-[10px] text-white/30 font-bold uppercase tracking-[0.2em]">Global Aggregation Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            {["Terms", "Privacy", "Security"].map((item) => (
              <Link key={item} href={`/${item.toLowerCase()}`} className="text-[10px] text-white/20 hover:text-white font-bold uppercase tracking-[0.1em] transition-colors">
                {item}
              </Link>
            ))}
          </div>

          <p className="text-white/10 text-[9px] font-bold uppercase tracking-[0.2em] md:order-last">
            © 2026 COMPASS.AI
          </p>
        </div>

      </div>
    </footer>
  );
}
