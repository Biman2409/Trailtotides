import Link from "next/link";
import { Mountain, Instagram, Youtube, Twitter, Mail, Map as MapIcon, Compass, BookOpen, Send } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#10141d] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-4 pr-0 lg:pr-12">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="w-10 h-10 rounded-xl bg-[#ff5100] flex items-center justify-center shadow-lg shadow-[#ff5100]/20 group-hover:bg-[#ff7d47] transition-all duration-300">
                <Mountain className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-xl tracking-tight">Trail to Tides</span>
            </Link>
            <p className="text-white/45 text-sm leading-relaxed mb-8 max-w-sm">
              We guide explorers to the most authentic adventures across the Indian subcontinent. Verified, hand-picked, and curated for those who seek the extraordinary.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Youtube, href: "#", label: "Youtube" },
                { icon: Twitter, href: "#", label: "Twitter" },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-[#ff5100]/20 hover:scale-110 transition-all duration-300 border border-white/5"
                >
                  <social.icon className="w-4.5 h-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Group */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff5100] mb-6">
              Discover
            </h4>
            <ul className="space-y-4">
              {[
                ["Trekking", "/explore?type=Trekking"],
                ["Mountaineering", "/explore?type=Mountaineering"],
                ["Diving", "/explore?type=Diving"],
                ["Watersports", "/explore?type=Watersports"],
                ["Biking", "/explore?type=Biking"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/45 hover:text-white transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5100]/0 group-hover:bg-[#ff5100] transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions Group */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff5100] mb-6">
              Regions
            </h4>
            <ul className="space-y-4">
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
                    className="text-[13px] text-white/45 hover:text-white transition-all duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff5100]/0 group-hover:bg-[#ff5100] transition-all duration-200" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform Tools Group */}
          <div className="lg:col-span-4 lg:pl-8">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff5100] mb-6">
              Adventure Tools
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {[
                { label: "Interactive Map", href: "/map", icon: MapIcon, desc: "Explore destinations visually" },
                { label: "Compass AI", href: "/#compass-ai", icon: Compass, desc: "Your personal guide" },
                { label: "Stories", href: "/stories", icon: BookOpen, desc: "Travel logs & tips" },
              ].map((tool, i) => (
                <Link
                  key={i}
                  href={tool.href}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-[#ff5100]/30 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#ff5100]/10 flex items-center justify-center text-[#ff5100] group-hover:bg-[#ff5100] group-hover:text-white transition-all duration-300">
                      <tool.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white group-hover:text-[#ff5100] transition-colors">{tool.label}</p>
                      <p className="text-[11px] text-white/30 uppercase tracking-wider mt-0.5">{tool.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter / CTA Section (Subtle) */}
        <div className="mt-20 p-8 rounded-2xl bg-[#ff5100]/5 border border-[#ff5100]/10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-white font-bold text-lg">Ready for your next journey?</p>
            <p className="text-white/40 text-sm">Join our newsletter for exclusive adventure guides.</p>
          </div>
          <div className="flex w-full md:w-auto gap-2">
            <input 
              type="email" 
              placeholder="Email address" 
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#ff5100]/50 transition-all flex-1 md:w-64"
            />
            <button className="bg-[#ff5100] hover:bg-[#ff7d47] text-white p-2.5 rounded-xl transition-all shadow-lg shadow-[#ff5100]/20 active:scale-95">
              <Send className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="text-white/20 text-[12px] tracking-wide">
              © 2026 Trail to Tides. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-white/20 hover:text-[#ff5100] text-[12px] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-white/20 hover:text-[#ff5100] text-[12px] transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px] text-white/30 uppercase tracking-[0.15em] font-medium">All Systems Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
