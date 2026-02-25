import Link from "next/link";
import { Mountain, Instagram, Youtube, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1f2e] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[#c4622d] flex items-center justify-center">
                <Mountain className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <span className="font-semibold text-lg tracking-tight">Trail to Tides</span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mt-3 max-w-xs">
              Every adventure across India, mapped and verified. Handpicked by explorers who've actually been there.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-white/38 hover:text-white hover:scale-110 transition-all duration-200">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/38 hover:text-white hover:scale-110 transition-all duration-200">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/38 hover:text-white hover:scale-110 transition-all duration-200">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white/30 mb-4">
              Explore
            </h4>
            <ul className="space-y-3">
                  {[
                    ["All Adventures", "/explore"],
                    ["Trekking", "/explore?type=Trekking"],
                    ["Biking", "/explore?type=Biking"],
                    ["Diving", "/explore?type=Diving"],
                  ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white/45 hover:text-white hover:translate-x-0.5 transition-all duration-200 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white/30 mb-4">
              Regions
            </h4>
            <ul className="space-y-3">
              {[
                ["Himalayas", "/explore?region=Himalayas"],
                ["Western Ghats", "/explore?region=Western+Ghats"],
                ["Desert", "/explore?region=Desert"],
                ["Islands", "/explore?region=Islands"],
                ["Coast", "/explore?region=Coast"],
                ["Northeast", "/explore?region=Northeast"],
              ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white/45 hover:text-white hover:translate-x-0.5 transition-all duration-200 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-white/30 mb-4">
              Platform
            </h4>
            <ul className="space-y-3">
              {[
                  ["Interactive Map", "/map"],
                  ["Stories", "/stories"],
                  ["Plan Your Adventure", "/plan"],
                  ["About", "/about"],
                  ["Contact", "/contact"],
                ].map(([label, href]) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-white/45 hover:text-white hover:translate-x-0.5 transition-all duration-200 inline-block"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © 2026 Trail to Tides. Built by people who've been out there.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-white/30 hover:text-white/60 text-sm transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-white/30 hover:text-white/60 text-sm transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
