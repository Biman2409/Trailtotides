import Link from "next/link";
import { Mountain, Instagram, Youtube, Twitter, Send, ArrowUpRight, Github, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0e14] text-white border-t border-white/[0.03] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-16 relative">
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#ff5100]/5 to-transparent blur-[120px] pointer-events-none" />

        {/* Hero Branding Section */}
        <div className="mb-32 flex flex-col items-center justify-center text-center relative z-10">
          <Link href="/" className="group relative">
            <h1 className="text-[14vw] lg:text-[12vw] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent transition-all duration-1000 select-none group-hover:from-white/20">
              TRAIL TO TIDES
            </h1>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-20 h-20 lg:w-28 lg:h-28 rounded-[2rem] bg-[#ff5100] flex items-center justify-center shadow-[0_0_60px_-15px_rgba(255,81,0,0.6)] group-hover:scale-110 group-hover:rotate-[15deg] transition-all duration-700 ease-out">
                <Mountain className="w-10 h-10 lg:w-14 lg:h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
              </div>
            </div>
          </Link>
          <p className="mt-16 text-white/30 text-xl lg:text-2xl font-light tracking-tight max-w-3xl mx-auto leading-relaxed italic">
            &quot;Architecting authentic discovery across the Indian subcontinent since 2026.&quot;
          </p>
        </div>

        {/* Architectural Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-12 gap-16 lg:gap-8 mb-32 border-t border-white/[0.03] pt-24">
          
          {/* Brand Identity column */}
          <div className="col-span-2 lg:col-span-4 lg:pr-16">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-8 h-8 rounded-lg bg-[#ff5100] flex items-center justify-center">
                <Mountain className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-black tracking-tighter text-xl uppercase">Trail to Tides</span>
            </div>
            <p className="text-white/20 text-[13px] leading-relaxed mb-10 max-w-sm font-medium tracking-wide">
              We aggregate the extraordinary. From Himalayan summits to Andaman reefs, we verify operators and map terrains so you can explore with absolute confidence.
            </p>
            <div className="flex items-center gap-6">
              {[
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Github, href: "#" },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center text-white/20 hover:text-[#ff5100] hover:border-[#ff5100]/30 hover:bg-[#ff5100]/5 transition-all duration-500"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div className="lg:col-span-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-10">
              Expeditions
            </h4>
            <ul className="space-y-5">
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
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-10">
              Disciplines
            </h4>
            <ul className="space-y-5">
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
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5100] mb-10">
              The Dispatch
            </h4>
            <div className="bg-white/[0.02] border border-white/[0.05] p-8 rounded-3xl relative overflow-hidden group/box">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff5100]/5 blur-3xl rounded-full" />
              <p className="text-white font-bold text-lg mb-2 relative z-10">Curated Guides.</p>
              <p className="text-white/30 text-xs mb-6 font-medium leading-relaxed relative z-10">Join 12,000+ explorers for bi-weekly deep dives into India&apos;s wildest corners.</p>
              
              <div className="relative z-10 flex gap-2">
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs outline-none focus:border-[#ff5100]/40 transition-all flex-1 font-medium"
                />
                <button className="bg-[#ff5100] hover:bg-[#ff7d47] text-white p-3 rounded-xl transition-all group/btn shadow-lg shadow-[#ff5100]/10">
                  <Send className="w-4 h-4 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Global Network bar */}
        <div className="border-t border-white/[0.03] pt-12 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
              <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Systems Operational</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Globe className="w-3 h-3 text-white/20" />
              <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em]">Global Aggregation Active</span>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <Link href="/terms" className="text-[10px] text-white/20 hover:text-white font-black uppercase tracking-[0.2em] transition-colors">Terms</Link>
            <Link href="/privacy" className="text-[10px] text-white/20 hover:text-white font-black uppercase tracking-[0.2em] transition-colors">Privacy</Link>
            <Link href="/security" className="text-[10px] text-white/20 hover:text-white font-black uppercase tracking-[0.2em] transition-colors">Security</Link>
          </div>
        </div>

        {/* Copyright & Signoff */}
        <div className="mt-16 text-center">
          <p className="text-white/10 text-[9px] font-black uppercase tracking-[0.5em]">
            © 2026 Trail to Tides • Curating the extraordinary from peaks to reefs
          </p>
        </div>

      </div>
    </footer>
  );
}
