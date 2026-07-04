import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPublishedStories, getStoryBySlug } from "@/lib/stories";
import type { StoryDB } from "@/lib/stories";
import { AVATARS } from "@/lib/avatars";
import { ChevronLeft, ArrowRight, Crown, Mountain, PenLine, Share2, MapPin } from "lucide-react";
import StoryShareBar from "@/components/ui/custom/StoryShareBar";
import StoryReactions from "@/components/ui/custom/StoryReactions";
import StoryComments from "@/components/ui/custom/StoryComments";
import StoryLikeButton from "@/components/ui/custom/StoryLikeButton";
import ReadingProgressBar from "@/components/ui/custom/ReadingProgressBar";
import Breadcrumbs from "@/components/ui/custom/Breadcrumbs";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import StoryShareButton from "@/components/ui/custom/StoryShareButton";

const BADGE_TAGS = ["Featured", "TTT Original"];

function pickAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATARS[Math.abs(hash) % AVATARS.length].src;
}

function mapStory(s: StoryDB) {
  const tags = s.tags ?? [];
  const pillTags = tags.filter(t => t !== "Featured" && t !== "TTT Original").slice(0, 2);
  return {
    id: s.id,
    slug: s.slug,
    title: s.title,
    excerpt: s.excerpt,
    author: s.author_name,
    authorRole: s.author_role,
    authorBio: s.author_bio,
    authorAvatar: s.author_avatar || pickAvatar(s.author_name),
    heroImage: s.hero_image,
    tags,
    pillTags,
    region: s.region as any,
    date: s.adventure_date,
    adventureDate: s.adventure_date,
    submittedBy: s.submitted_by || undefined,
    baseLikes: s.baseLikes ?? 50,
  };
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const stories = await getPublishedStories();
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const story = await getStoryBySlug(slug);
  if (!story) return {};
  const s = mapStory(story);
  return {
    title: `${s.title} — Trail to Tides`,
    description: s.excerpt,
    openGraph: {
      title: `${s.title} — Trail to Tides`,
      description: s.excerpt,
      url: `https://trailtotides.com/stories/${slug}`,
      images: [{ url: s.heroImage, width: 1200, height: 630, alt: s.title }],
      type: "article",
      publishedTime: s.date,
      authors: [s.author],
      tags: s.tags ?? [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${s.title} — Trail to Tides`,
      description: s.excerpt,
      images: [s.heroImage],
    },
    alternates: { canonical: `https://trailtotides.com/stories/${slug}` },
  };
}

// Generate a plausible article body from the excerpt + title
function buildBody(story: ReturnType<typeof mapStory>): string[] {
  // Each story gets 4–6 paragraphs synthesised from its metadata
  const openers: Record<string, string[]> = {
    "what-5000m-feels-like": [
      "The acclimatisation day at 3,800m felt like a formality. We moved slowly up the moraine, stopping every fifty steps to breathe, to look back at the valley floor where the tents looked like coloured seeds scattered by the wind.",
      "At 4,200m the headache arrived — not a sharp pain but a constant pressure behind the eyes, as if the sky itself were leaning on your skull. You eat what you can, drink litres of water, and try not to think about how much higher you have to go.",
      "The summit push begins in the dark, always. Head-torches trace a broken line up the ridge. No one speaks — not out of ceremony, but because speaking requires oxygen you don't have to spare. Your world narrows to the circle of light two metres in front of your boots.",
      "When the sun rises at altitude it doesn't warm you — not immediately. It turns the snowfield from blue to gold to blinding white in about twenty minutes, and for a moment the cold doesn't matter. You understand why people keep coming back.",
      "Coming down is harder than going up, in ways no guidebook explains. Your knees know it first. Then your head, which must think clearly again after hours of pure physical focus. The valley below looks impossibly green.",
    ],
    "1000km-ride-what-no-one-tells-you": [
      "Day one out of Manali the road is familiar: well-paved, tourist-busy, every dhaba full of other riders comparing gears. By evening, past Rohtang, the tourists thin and the road begins to say what it really is.",
      "Baralacha La at 4,890m is where the bike starts to feel sluggish — the engine starved for the oxygen it was built to breathe at sea level. You throttle more than you should. The carburetion lags. You learn to read the bike the way you'd read a tired horse.",
      "The Sarchu flats are a different kind of hard. Flat, wide, and absolutely unforgiving — crosswinds that don't announce themselves, gravel patches that appear in the middle of what looked like tarmac. I put the bike down once. Got up. Checked the panniers. Kept going.",
      "What nobody tells you about long rides isn't the physical difficulty — it's the mental accounting. Every morning you calculate distance, fuel, daylight, altitude, weather. You become briefly expert in logistics, then forget all of it the moment you reach the night's stop.",
      "The finish isn't a finish. You pull into Leh, park, and sit on the bike for a few minutes before getting off. You're not sure why. Something about not wanting the calculation to end.",
    ],
    "andaman-below-the-surface": [
      "The briefing before any wreck dive has the same components: entry point, maximum depth, no-decompression limit, exit plan. What no briefing covers is the moment you fin through the hold of a ship that sank in 1945 and realise the war is still there, perfectly preserved.",
      "Visibility in the Andamans runs to 30 metres on a good day. On a very good day it runs further, and the water goes from turquoise to a deep, saturated blue that has no equivalent on land. You stop registering depth and start registering colour.",
      "The reef at Havelock is the healthiest I've dived in the Indian Ocean. The reason is boring: it's far from major fishing vessels, the water temperature stays consistent, and the dive community here has been strict about moorings for fifteen years. Good reefs are made by boring decisions.",
      "Night dives are different in a way that's hard to explain to non-divers. In the day the reef performs for you — bright, busy, theatrical. At night it does what it actually does. Bioluminescence trails from your fins. Parrotfish sleep in mucous cocoons. The ocean is not a performance.",
      "Coming up from a deep dive is a meditation. The ascent is slow, governed by physics — nitrogen bubbles need time to leave your blood safely. You hang at five metres for three minutes and watch the surface above you shiver with light.",
    ],
    "dzukou-the-valley-nobody-knows": [
      "Nagaland gets overlooked by Indian adventure travellers in a way that should embarrass the travel industry. The permits are slightly complex, the flights are expensive, and the infrastructure is minimal. This is, entirely, why it remains one of the most beautiful places I have ever been.",
      "The trail to Dzükou starts at the edge of Viswema village, where the mobile network ends and the forest begins properly. The tree species change within a few hundred metres — tropical broadleaf giving way to oak, then to the rhododendrons that dominate the upper valley.",
      "The valley floor at 2,438m is flat and boggy in parts, carpeted with the Dzükou lily that only grows here. It flowers in July and August in a deep red-orange, so densely that the valley floor looks painted. We came in October, after the flowers, and found something quieter and stranger — the same plants dried to brown and cream, moving in wind.",
      "There are no lodges in Dzükou. There is one Forest Department rest house, four rooms, no electricity after 9pm. We cooked on gas, played cards by headtorch, and woke to mist so thick the valley had no edges.",
      "The political history of Nagaland is complicated, unresolved, and impossible to ignore if you spend any real time here. The locals speak of it plainly — with tiredness rather than bitterness. It changes how you think about the landscapes that politics leaves intact by accident.",
    ],
    "first-timer-on-the-rann": [
      "I was not prepared for the flatness. I grew up in Mumbai where the horizon is always interrupted — by buildings, by hills, by the dome of haze. At the Rann of Kutch, the land runs uninterrupted to the horizon in every direction, and the horizon is perfectly, disconcertingly level.",
      "We arrived at the white desert just after sunset, which is the only correct time to arrive. The salt flats take the last light and return it differently — not reflected but diffused, so the ground seems to glow from within. I understood immediately why people make the trip just for this.",
      "The temperature drops fast after dark. We'd been warned, and had ignored the warning partially, and paid for it at around 10pm when a wind came off the desert that had nothing between it and Central Asia. We put on everything we had brought.",
      "At 2am I woke and walked out of camp. The stars at the Rann are absurd. I know this is a thing people say — 'the stars were absurd' — but I have no other word for a sky where the Milky Way casts a shadow. I stood for forty minutes and said nothing.",
      "The drive out in the morning takes you past flamingo flocks at the waterline, past artisans' villages that have been making Rann embroidery for generations, past an India that exists at its own speed. I went back three months later.",
    ],
      "the-night-photi-la-tested-us": [
        "Friendship had survived four years across cities. But B never changes. If he calls, it\'s never casual. \'Parso ki flight book kar le.\' Leave approvals, minor family drama, borrowed riding gear -- done. We met A during a chaotic Delhi layover. Social-media baller. Real-life introvert. Perfect addition to the chaos. We landed in Ladakh sleep-deprived and overconfident. The air was thin, sharp, intoxicating. Two bikes waited. And no real plan beyond \'ride high.\'",
        "Within 48 hours, we had crossed Khardung La, stayed in Diskit, watched Pangong Lake change colors, and reached Hanle. The roads were rough. The landscapes unreal. The laughter constant. Then came the real target: Umling La -- 19,300 ft. The highest motorable road in the world. A local mentioned a shortcut. It wasn\'t a shortcut. It was a sandy ribbon carved into a mountainside so steep that stopping meant sliding backward. Engines screamed. Clutches burned. We refused to quit. And we made it. At the summit, we felt invincible. That feeling would not last.",
        "'Demchok is just 30 km from here.' Demchok -- India\'s last village on the China border. We should have turned back. Instead, we rode into thinner air and thicker uncertainty. Brake failures hit both B and me mid-descent. K and S -- the pros -- taught us engine braking on the spot. We reached Demchok by 3 PM. Ate at the army cafe. Watched steam rise from distant hot springs. Across a stream -- China. Officials engaged in a flag meeting. It felt surreal. Then the sky cracked open.",
        "The rain didn\'t stop. It intensified. By 4 PM, we were cramped in a broken shelter with army personnel. Hail struck the tin roof like warning shots. In Ladakh, you don\'t ride after dark. But staying meant being stranded. The shortcut we took? Destroyed. The only way back: six brutal hours via Umling La and Photi La. I had forgotten my rain liner. A jawaan handed me his poncho from personal ration and refused payment. We rode. Rain in the valley became snow at Umling La. One photo at the summit. No celebration this time. Just urgency.",
        "Darkness swallowed the road. No vehicles. No lights. No villages awake. Only engines echoing against mountain walls. At the base of Photi La, we reorganized. I admitted it: \'I\'m petrified.\' Formation set. Lights adjusted. Slow climb began. Halfway up, fog engulfed us. We were riding inside a cloud. Hairpin bends. Steep drops. Zero visibility. My clutch slipped. I dropped the bike. For a few minutes, it was just me and B in dense fog. Then B said something I will never forget. \'Bhai... mere peeche ek bike hai.\' There wasn\'t. No headlights. No sound. But he insisted -- a light in his rearview mirror, following off-road.",
        "We regrouped. Then we heard it. A loud horn. Clear. Close. Nothing behind us. Seconds later -- a landslide crashed ahead. When we moved forward cautiously, a massive boulder covered half the road. Had we been seconds earlier, we would have ridden straight into it. No one spoke. We descended in silence. We reached Hanle close to midnight. Relief felt physical. Then B began shivering violently -- burning with fever. The caretaker stepped out, observed quietly, and returned with prayer beads and a bowl of water. He chanted softly. \'He\'ll be fine by morning.\' And he was. Completely fine.",
        "Over morning kahwa, the caretaker said: \'Photi La is very dangerous. Many die there. Never cross at night.\' We narrated the horn. The light. The landslide. He nodded calmly. \'That biker was a good spirit. He protected you. He stopped you before the landslide.\' We didn\'t debate logic. Because the timing made sense. And in the mountains, sometimes timing is everything.",
        "We left Hanle that day in silence. K and S rode toward Manali. We headed back toward Leh. Before flying home, B insisted on visiting a monastery. People return from trips with photos and stories. We returned with gratitude, humility, and a quiet belief that the mountains decide. The Himalayas don\'t scare you to break you. They scare you to remind you: you are small, control is fragile, and sometimes, you are protected in ways you cannot explain.",
      ],
      "riding-through-a-revolution": [
      "We were three corporate workers fed up with our mundane days in the concrete jungle, so we decided to plan an escape. The destination was set: Nepal, in all its wild glory. We shipped our bikes from Mumbai to Gurgaon, got on the saddles, and rode out to Lucknow. By the time we crossed the Gorakhpur to Sunauli stretch, crossed the border, and dealt with the slow Nepali customs process, the sun was going down. We finally arrived in Butwal for the night, eager to crack open our first icy Gorkha beers the second we parked.",
      "It was a phenomenal feeling. Riding our own bikes through a foreign country washed away the rust of our daily routines. The pure wonder of childhood came rushing back as we took in the fresh air, the new roads, and the total freedom. The next day, on our way to Pokhara, we took a long two hour lunch just to stare at the mighty peaks in the distance. As we were getting ready to leave, a local rider pulled up next to us and asked if he could ride with us to Pokhara. Just like that, we were four.",
      "We woke up the next morning, checked the bikes, and got ready to head out. We noticed crowds gathering in Pokhara. It looked like the beginnings of a demonstration, but we brushed it off and rode out toward Nayapul on smooth tarmac. With our new rider friend leading the way, we turned toward Ghandruk. The views were amazing, right up until we hit our toughest challenge. The trail became a narrow path covered with massive boulders. Our bikes just would not budge. Between the four of us, we fell eleven times. We had to resort to pushing each bike up the grueling climb. It took everything in us not to quit. I have ridden a lot of difficult terrain, but the lonely tiredness of that stretch as the night became darker still haunts me.",
      "We somehow made it to Ghandruk. Thinking the worst was behind us, we settled into our rooms. That was when we realized exactly what those demonstrations in Pokhara really were — the early seeds of a quiet revolution that had been bubbling for months. That night, on Sept 8th 2024, under heavy police crackdowns, it erupted into the infamous violence of the Gen Z revolution. All of a sudden, we were stuck in a foreign country with closed borders and no idea what to do next. With nowhere else to go, Ghandruk became our safe haven, and Hotel Aagan became our home.",
      "We spent days holed up there, forging deep bonds with the hotel owner, Deep dai, and his family. As a gesture of goodwill, his brother-in-law Parmish guided us on a two day trek through a jungle full of leeches to see the incredible views of the Annapurna and Dhaulagiri ranges from Mulde Peak. When the roads finally seemed safe enough, Deep dai escorted us back to Pokhara. With our local rider friend still alongside us, we were now five. Pokhara bore the fresh marks of the violence that had just happened — municipal buildings broken, a hotel still on fire.",
      "The ride home would have been uneventful had my fried clutch not given out entirely just past Lucknow. It was frustrating to limp along at 60 kmph while my friends were cruising at double my speed. I became the turtle they would have to catch up to, or wait for at the next break. Somehow we made it to Delhi. We returned with only half the adventure we had planned, witnessed a revolution we never expected, and brought back more memories than we ever could have asked for.",
    ],
    "chadar-the-frozen-river": [
      "The Zanskar River freezes from the edges inward, and the ice that forms first is not always the ice that remains. Chadar — the sheet — forms and reforms through January, retreating when a warm spell comes, returning thicker. By the time trekkers arrive, the guides have been reading it for weeks.",
      "Our guide, Stanzin, had walked Chadar eleven times. He walked ahead of us and tapped the ice with a stick — a tap that sounded different on solid ice than on the hollow sections above air pockets or running water. We followed his footsteps exactly.",
      "The campsites are caves in the cliff face, used by locals for centuries before the trek became known. Inside them, away from the wind, the temperature rises to something survivable. The guides build fires from driftwood frozen into the river banks. The smoke goes up through a natural chimney in the rock.",
      "On day four, a section of ice ahead of us cracked while we watched — not catastrophically, but with a sound like a gunshot, and a new fracture line running three metres across the path. Stanzin redirected us to the shore, a scramble over boulders, then back onto safer ice downstream. No one spoke.",
      "I have trekked in many places. I have not been anywhere that required as complete a suspension of ordinary reality. On Chadar, the rules of the physical world are temporarily different. Ice is ground. The river is a road. Cold is not a condition but a character in the story.",
    ],
  };

  const generic = [
    "The approach takes longer than the map suggests — it always does, in the places worth going.",
    "There is a particular quality of silence in wild places that is not the absence of sound but the absence of human sound. You hear wind, water, birds, your own breath. The contrast with ordinary life is violent.",
    "Every serious adventure involves a moment where you wonder, briefly, why you came. It passes. What replaces it is harder to name — something that functions like clarity.",
    "The people who live in and around adventure destinations are usually the most interesting part of the trip, and the least written-about. Ask questions. Accept hospitality. Don't photograph people without permission.",
    "Coming home is strange. The ordinary world looks different for a few days — too fast, too loud, too predictable. Then it normalises, and you start planning the next one.",
  ];

  return openers[story.slug] ?? generic;
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const dbStory = await getStoryBySlug(slug);
  if (!dbStory) notFound();
  const story = mapStory(dbStory);
  const body = buildBody(story);

  const allStories = await getPublishedStories();
  const others = allStories.filter((s) => s.slug !== story.slug).slice(0, 3).map(mapStory);

  const articleStructuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: story.title,
    description: story.excerpt,
    image: story.heroImage,
    author: {
      "@type": "Person",
      name: story.author,
    },
    publisher: {
      "@type": "Organization",
      name: "Trail to Tides",
      logo: {
        "@type": "ImageObject",
        url: "https://trailtotides.com/logo.svg",
      },
    },
    datePublished: story.date,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://trailtotides.com/stories/${slug}`,
    },
    url: `https://trailtotides.com/stories/${slug}`,
    keywords: (story.tags ?? []).join(", "),
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <ReadingProgressBar />
      <ScrollToTop />
      <Navbar />

      <Breadcrumbs items={[
        { label: "Stories", href: "/stories" },
        { label: story.title },
      ]} />

      {/* Hero */}
      <section className="relative h-[55vh] md:h-[65vh] min-h-[400px] flex items-end overflow-hidden">
          <Image
            src={story.heroImage}
            alt={story.title}
            fill
              priority
              className="object-cover"
              style={{ 
                objectFit: "cover",
                filter: "brightness(1.1) contrast(1.15) saturate(1.15)" 
              }}
            />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

        {/* Back */}
        <Link
          href="/stories"
          className="absolute top-20 right-4 lg:right-8 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full"
        >
          <ChevronLeft className="w-4 h-4" />
          All Stories
        </Link>

        <div className="relative z-10 max-w-4xl mx-auto px-5 lg:px-8 pb-8 lg:pb-14 w-full">
          {/* Row 1: special badges */}
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {story.tags.includes("Featured") && (
                  <span className="flex items-center gap-1.5 bg-black text-[#ff5100] text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-[#ff5100]/20">
                    <Crown className="w-3 h-3" />
                    Featured
                  </span>
                )}
                {story.tags.includes("TTT Original") && (
                  <span className="flex items-center gap-1.5 bg-[#ff5100] text-black text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-[#ff5100]/20">
                    <Mountain className="w-3 h-3" />
                    TTT Original
                  </span>
                )}
            </div>
            {/* Row 2: pill tags — only pillTags if set, else first 2 non-badge tags */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {(story.pillTags ?? story.tags.filter(t => !BADGE_TAGS.includes(t)).slice(0, 2)).map(tag => (
                  <span key={tag} className="bg-white/10 backdrop-blur-sm border border-white/15 text-white/80 text-xs px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
                <span className="flex items-center gap-1 text-[11px] text-white/50 font-medium"><MapPin className="w-3 h-3" />{story.region}</span>
              </div>
          <h1 className="text-white text-2xl md:text-4xl lg:text-6xl font-bold tracking-tight leading-tight mb-3 max-w-3xl">
            {story.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden shadow-md shadow-[#ff5100]/20 shrink-0">
                {story.authorAvatar
                  ? <img src={story.authorAvatar} alt={story.author} className="w-full h-full object-cover" loading="eager" />
                  : <span className="w-full h-full flex items-center justify-center text-sm font-bold text-white bg-[#ff5100]/50">{story.author[0]}</span>}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  {story.submittedBy ? (
                    <Link href={`/profile/${story.submittedBy}`} className="text-white font-medium text-sm hover:text-[#ff5100] transition-colors">{story.author}</Link>
                  ) : (
                    <p className="text-white font-medium text-sm">{story.author}</p>
                  )}
                  </div>
                <p className="text-white/45 text-xs flex items-center gap-1 flex-wrap">{story.authorRole} &nbsp; {story.adventureDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <StoryLikeButton slug={story.slug} baseLikes={story.baseLikes} pill />
              <StoryShareButton title={story.title} slug={story.slug} />
            </div>
          </div>
        </div>
      </section>

      {/* Article */}
      <article className="max-w-2xl mx-auto px-5 lg:px-6 py-10 lg:py-20">
        {/* Lede */}
        <p className="text-white/80 text-lg lg:text-2xl font-light leading-relaxed mb-8 lg:mb-10 border-l-4 border-[#ff5100] pl-5">
          {story.excerpt}
        </p>

        {/* Body paragraphs */}
        <div className="space-y-6">
          {body.map((para, idx) => (
            <p key={idx} className="text-white/65 text-base lg:text-lg leading-[1.85] font-light">
              {para}
            </p>
          ))}
        </div>

        {/* Author card */}
          <div className="mt-10 bg-white/5 border border-white/10 rounded-2xl p-6 flex items-start gap-5">
            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-inner" style={{ border: "1.5px solid rgba(255,81,0,0.25)" }}>
              {story.authorAvatar
                ? <img src={story.authorAvatar} alt={story.author} className="w-full h-full object-cover" loading="eager" />
                : <span className="w-full h-full flex items-center justify-center text-xl font-bold text-[#ff5100] bg-[#ff5100]/20">{story.author[0]}</span>}
            </div>
            <div className="flex-1">
              <div>
                {story.submittedBy ? (
                  <Link href={`/profile/${story.submittedBy}`} className="text-white font-semibold text-base hover:text-[#ff5100] transition-colors">{story.author}</Link>
                ) : (
                  <p className="text-white font-semibold text-base">{story.author}</p>
                )}
              </div>
              <p className="text-white/40 text-sm mt-0.5">{story.authorRole}</p>
              {story.authorBio && (
                <p className="text-white/50 text-sm mt-2 leading-relaxed">{story.authorBio}</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-white/10">
            {story.tags.filter(t => !BADGE_TAGS.includes(t)).map((tag) => (
              <span
                key={tag}
                className="bg-white/8 text-white/40 text-xs px-3 py-1.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          <StoryShareBar title={story.title} slug={story.slug} />

          <StoryComments slug={story.slug} />

          {/* Share your story CTA */}
          <div className="mt-8 relative rounded-xl overflow-hidden flex items-center gap-4 px-4 py-3.5" style={{ background: "rgba(255,81,0,0.06)", border: "1px solid rgba(255,81,0,0.16)" }}>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,_rgba(255,81,0,0.08)_0%,_transparent_65%)] pointer-events-none" />
            <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center relative" style={{ background: "rgba(255,81,0,0.15)", border: "1px solid rgba(255,81,0,0.22)" }}>
              <PenLine className="w-3.5 h-3.5 text-[#ff5100]" />
            </div>
            <div className="flex-1 min-w-0 relative">
              <p className="text-white font-bold text-xs leading-snug">Got a story worth telling?</p>
              <p className="text-white/35 text-[11px] mt-0.5 leading-relaxed">Share yours — it might inspire the next journey.</p>
            </div>
            <Link
              href="/stories/submit"
              className="relative shrink-0 inline-flex items-center gap-1.5 text-white font-semibold px-3.5 py-1.5 rounded-lg text-xs transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 group whitespace-nowrap"
              style={{ background: "#ff5100", boxShadow: "0 4px 12px rgba(255,81,0,0.22)" }}
            >
              Share story
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
      </article>

      {/* More stories */}
      <section className="t-bg-surface2 py-12 lg:py-24 px-5 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8 lg:mb-10">
            <div>
              <p className="text-[#ff5100] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                Keep Reading
              </p>
              <h2 className="text-white text-2xl lg:text-3xl font-semibold tracking-tight">
                More from the trails
              </h2>
            </div>
            <Link
              href="/stories"
              className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs lg:text-sm font-medium transition-colors group"
            >
              All stories
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {others.map((s) => (
              <Link key={s.id} href={`/stories/${s.slug}`} className="group block">
                <div className="relative h-48 rounded-2xl overflow-hidden mb-4">
                    <Image
                      src={s.heroImage}
                      alt={s.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ objectFit: "cover" }}
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="bg-white/10 backdrop-blur-sm border border-white/15 text-white text-xs px-2.5 py-1 rounded-full">
                      {s.region}
                    </span>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-base leading-snug group-hover:text-[#ff5100] transition-colors mb-1">
                  {s.title}
                </h3>
                <p className="text-white/40 text-xs">
                  {s.adventureDate} · {s.region}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
