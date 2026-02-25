import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { stories } from "@/lib/data";
import { ArrowRight, Clock, Crown, Mountain } from "lucide-react";

export default function StoriesPage() {
  const [featured, ...rest] = stories;

  return (
      <div className="min-h-screen bg-[#111820]">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 lg:px-8 bg-[#1a1f2e]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#c4622d] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            From the Field
          </p>
            <h1 className="text-white text-5xl lg:text-7xl font-semibold tracking-tight leading-none mb-4">
              Voices from the Edge
            </h1>
            <p className="text-white/50 text-lg max-w-xl mt-4">
                Not travel bloggers. Not influencers. Real people who pushed past the edge and had the guts to write it down.
            </p>
        </div>
      </section>

      {/* Featured story */}
      <section className="px-6 lg:px-8 -mt-1 bg-[#1a1f2e] pb-16">
        <div className="max-w-7xl mx-auto">
          <Link href={`/stories/${featured.slug}`} className="group block">
            <div className="relative h-[420px] lg:h-[540px] rounded-3xl overflow-hidden">
              <Image
                src={featured.heroImage}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                <div className="flex flex-col gap-2 mb-4">
                    <div className="flex items-center gap-2">
                      {featured.tags.includes("Featured") && (
                        <span className="flex items-center gap-1.5 bg-[#c4622d] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-[#c4622d]/30">
                          <Crown className="w-3 h-3" /> Featured
                        </span>
                      )}
                      {featured.tags.includes("TTT Original") && (
                        <span className="flex items-center gap-1.5 bg-[#c4622d] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg shadow-[#c4622d]/30">
                          <Mountain className="w-3 h-3" /> TTT Original
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {featured.tags.filter(t => ["Himalayas","Biking"].includes(t)).map(tag => (
                        <span key={tag} className="bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs px-3 py-1.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                <h2 className="text-white text-3xl lg:text-5xl font-semibold tracking-tight leading-tight mb-3 max-w-2xl group-hover:text-white/90 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-white/60 text-base max-w-2xl leading-relaxed mb-5 hidden lg:block">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-[#c4622d]/40 flex items-center justify-center text-xs font-bold text-white">
                    {featured.author[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{featured.author}</p>
                    <p className="text-white/40 text-xs">{featured.authorRole}</p>
                  </div>
                  <span className="ml-2 flex items-center gap-1 text-white/40 text-xs">
                    <Clock className="w-3.5 h-3.5" /> {featured.readTime}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* All stories grid */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            <h2 className="text-[#1a1f2e] text-2xl font-semibold mb-10">All Voices from the Edge</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((story) => (
                <Link key={story.id} href={`/stories/${story.slug}`} className="group block">
                  <div className="relative h-52 rounded-2xl overflow-hidden mb-5 shadow-md group-hover:shadow-xl group-hover:shadow-black/15 transition-shadow duration-300">
                    <Image
                      src={story.heroImage}
                      alt={story.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 flex-wrap">
                        {story.tags.filter(t => ["Himalayas","Biking"].includes(t)).map(tag => (
                          <span key={tag} className="bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs px-3 py-1.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                  </div>
                  <div>
                    <h3 className="text-[#1a1f2e] text-xl font-semibold leading-snug mb-2 group-hover:text-[#c4622d] transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-[#6b6560] text-sm leading-relaxed line-clamp-2 mb-4">
                      {story.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#e0d8cc] flex items-center justify-center text-xs font-bold text-[#6b6560]">
                          {story.author[0]}
                        </div>
                        <div>
                          <p className="text-[#1a1f2e] text-xs font-semibold">{story.author}</p>
                          <p className="text-[#9a9590] text-xs">{story.date}</p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-[#9a9590] text-xs">
                        <Clock className="w-3.5 h-3.5" /> {story.readTime}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

      {/* CTA */}
      <section className="py-20 px-6 lg:px-8 bg-[#f5f0e8]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-[#1a1f2e] text-3xl lg:text-5xl font-semibold tracking-tight mb-4">
            Got a story to tell?
          </h2>
          <p className="text-[#6b6560] text-base leading-relaxed mb-8 max-w-lg mx-auto">
            We feature stories from verified adventurers. If you've done something remarkable out there, we want to hear it.
          </p>
          <Link
            href="/list"
            className="inline-flex items-center gap-2 bg-[#1e3d2f] hover:bg-[#2d5a42] text-white font-medium px-8 py-4 rounded-xl text-base transition-colors group"
          >
            Share Your Story
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
