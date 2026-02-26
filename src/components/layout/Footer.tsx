import Link from "next/link";
import { Mountain, Instagram, Youtube, Twitter, Send, ArrowUpRight, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0a0e14] text-white border-t border-white/[0.03]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 lg:py-32">
        
        {/* Top Branding Section */}
        <div className="mb-24 flex flex-col items-center justify-center text-center">
          <Link href="/" className="group relative">
            <h1 className="text-[12vw] lg:text-[10vw] font-black leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/5 opacity-10 group-hover:opacity-20 transition-opacity duration-700 select-none">
              TRAIL TO TIDES
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#ff5100] flex items-center justify-center shadow-2xl shadow-[#ff5100]/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <Mountain className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
          </Link>
          <p className="mt-12 text-white/40 text-lg lg:text-xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed italic">
            &quot;We guide explorers to the most authentic adventures across the Indian subcontinent.&quot;
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-24">
          
          {/* Brand Info */}
          <div className="col-span-2 lg:col-span-2 pr-0 lg:pr-20">
            <h4 className="text-white font-bold text-sm uppercase tracking-[0.3em] mb-8">
              Compass Points
            </h4>
            <p className="text-white/30 text-sm leading-relaxed mb-8 max-w-xs font-light">
              Founded on the principles of exploration, sustainability, and authentic storytelling. Every trail verified, every tide documented.
            </p>
            <div className="flex items-center gap-5">
              {[
                { icon: Instagram, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Github, href: "#" },
              ].map((social, i) => (
                <a 
                  key={i}
                  href={social.href} 
                  className="text-white/20 hover:text-[#ff5100] hover:-translate-y-1 transition-all duration-300"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links 1 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff5100] mb-8">
              Explore
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
                    className="text-[13px] text-white/30 hover:text-white transition-colors duration-200 flex items-center justify-between group"
                  >
                    <span>{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:text-[#ff5100] transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff5100] mb-8">
              Discovery
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
                    className="text-[13px] text-white/30 hover:text-white transition-colors duration-200 flex items-center justify-between group"
                  >
                    <span>{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:text-[#ff5100] transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.3em] text-[#ff5100] mb-8">
              Platform
            </h4>
            <ul className="space-y-4">
              {[
                ["Interactive Map", "/map"],
                ["Compass AI", "/#compass-ai"],
                ["Explorer Stories", "/stories"],
                ["Privacy Policy", "/privacy"],
                ["Terms of Service", "/terms"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[13px] text-white/30 hover:text-white transition-colors duration-200 flex items-center justify-between group"
                  >
                    <span>{label}</span>
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:text-[#ff5100] transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Newsletter / Subtle CTA */}
        <div className="relative group overflow-hidden p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/[0.05] hover:border-[#ff5100]/20 transition-all duration-700">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#ff5100]/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="text-center lg:text-left">
              <h3 className="text-white text-2xl font-bold tracking-tight mb-2">Ready for the extraordinary?</h3>
              <p className="text-white/40 text-sm max-w-sm font-light">Join 10k+ explorers receiving curated bi-weekly adventure guides.</p>
            </div>
            
            <div className="w-full lg:w-auto flex flex-col sm:flex-row gap-4">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:bg-white/[0.08] focus:border-[#ff5100]/40 transition-all flex-1 lg:w-80 font-light"
              />
              <button className="bg-[#ff5100] hover:bg-[#ff7d47] text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-[#ff5100]/10 font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-2 group/btn">
                Subscribe
                <Send className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-10 border-t border-white/[0.03] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">Systems Operational</span>
          </div>
          
          <p className="text-white/20 text-[11px] tracking-[0.2em] font-medium uppercase">
            © 2026 Trail to Tides • Curating the extraordinary
          </p>
          
          <div className="flex items-center gap-6">
            <Link href="/" className="text-white/20 hover:text-white text-[11px] uppercase tracking-widest font-bold transition-colors">Back to Top</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
