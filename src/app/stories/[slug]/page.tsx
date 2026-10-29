import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { getPublishedStories, getStoryBySlug } from "@/lib/stories";
import { mapStory, readMinutes, splitParagraphs, storyImage } from "@/lib/storyView";
import { ArrowRight, Crown, MapPin, Clock, Compass, Gauge, Heart } from "lucide-react";
import { ADVENTURE_TYPE_ICONS } from "@/lib/adventureIcons";
import ShareStoryCTA from "@/components/ui/custom/ShareStoryCTA";
import StoryCard from "@/components/ui/custom/StoryCard";
import StoryShareBar from "@/components/ui/custom/StoryShareBar";
import StoryComments from "@/components/ui/custom/StoryComments";
import StoryLikeButton from "@/components/ui/custom/StoryLikeButton";
import ReadingProgressBar from "@/components/ui/custom/ReadingProgressBar";
import Breadcrumbs from "@/components/ui/custom/Breadcrumbs";
import ScrollToTop from "@/components/ui/custom/ScrollToTop";
import StoryShareButton from "@/components/ui/custom/StoryShareButton";
import AdventureCard from "@/components/ui/custom/AdventureCard";
import { adventures } from "@/lib/data";
import { storyTags, storyKeywords } from "@/lib/storyTags";

// Suggest adventures whose place or activity type overlaps with the story.
function getSuggestedAdventures(story: { region: string; tags: string[] }, limit = 3) {
  const regionQuery = story.region.trim().toLowerCase();
  const tagSet = new Set(story.tags.map((t) => t.toLowerCase()));

  const scored = adventures
    .map((a) => {
      let score = 0;
      const stateLower = a.state.toLowerCase();
      if (regionQuery && (stateLower.includes(regionQuery) || regionQuery.includes(stateLower))) score += 3;
      if (tagSet.has(a.type.toLowerCase())) score += 2;
      if (tagSet.has(a.region.toLowerCase())) score += 1;
      return { adventure: a, score };
    })
    .filter((x) => x.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.adventure);
}

// The author tagline is set in the site script, like the logo tagline
const script = { fontFamily: "var(--font-script), cursive", fontWeight: 600 } as const;

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
  // Search results show about 160 characters; cut at a word, not mid-word
  const description = s.excerpt.length <= 160 ? s.excerpt : `${s.excerpt.slice(0, 157).replace(/\s+\S*$/, "")}…`;
  const { activity, tags, keywords } = storyContent(s);
  // "The Night Photi La Tested Us: Motorcycling in Ladakh" carries the search phrase in the title
  const title = activity && s.region ? `${s.title}: ${activity} in ${s.region}` : s.title;
  return {
    title,
    description,
    keywords,
    authors: [{ name: s.author }],
    openGraph: {
      title: `${s.title} — Trail to Tides`,
      description,
      url: `https://www.trailtotides.com/stories/${slug}`,
      images: [{ url: s.heroImage, width: 1200, height: 630, alt: s.title }],
      type: "article",
      // The adventure date is free text ("July 2022"); this needs a real date
      publishedTime: story.created_at,
      modifiedTime: story.updated_at,
      authors: [s.author],
      tags: tags.map((t) => t.label),
    },
    twitter: {
      card: "summary_large_image",
      title: `${s.title} — Trail to Tides`,
      description,
      images: [s.heroImage],
    },
    alternates: { canonical: `https://www.trailtotides.com/stories/${slug}` },
  };
}

// The full text of the stories we seeded by hand. Their database rows hold an empty
// or cut-short body, so this copy is used whenever it is the longer one.
function buildBody(story: ReturnType<typeof mapStory>): string[] | null {
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

  return openers[story.slug] ?? null;
}

/** The full text and linked hashtags of a story; shared by the page and its metadata */
function storyContent(story: ReturnType<typeof mapStory>) {
  // The stored body, unless the hand-written seed copy has more of the story
  const seed = buildBody(story);
  const body = seed && seed.join(" ").length > story.body.trim().length ? seed : splitParagraphs(story.body);
  const activity = story.pillTags?.[0];
  const tags = storyTags({ tags: story.tags, region: story.region, text: [story.title, story.excerpt, ...body].join(" ") }, activity);
  return { body, activity, tags, keywords: storyKeywords(tags, story.region, activity) };
}

export default async function StoryPage({ params }: Props) {
  const { slug } = await params;
  const dbStory = await getStoryBySlug(slug);
  if (!dbStory) notFound();
  const story = mapStory(dbStory);
  const { body, activity, tags, keywords } = storyContent(story);
  const minutes = readMinutes([story.excerpt, ...body].join(" "));
  const hero = storyImage(story.heroImage);
  const liveTypes = new Set(adventures.map((a) => a.type as string));

  const allStories = await getPublishedStories();
  // Same activity first, then the newest
  const others = allStories.filter((s) => s.slug !== story.slug).map(mapStory)
    .sort((a, b) => Number(b.pillTags?.[0] === activity) - Number(a.pillTags?.[0] === activity))
    .slice(0, 3);
  const suggestedAdventures = getSuggestedAdventures(story);

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
        url: "https://www.trailtotides.com/icon",
      },
    },
    datePublished: dbStory.created_at,
    dateModified: dbStory.updated_at,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.trailtotides.com/stories/${slug}`,
    },
    url: `https://www.trailtotides.com/stories/${slug}`,
    keywords: keywords.join(", "),
    ...(activity ? { articleSection: activity } : {}),
    about: [
      ...(story.region ? [{ "@type": "Place", name: story.region }] : []),
      ...(activity ? [{ "@type": "Thing", name: activity }] : []),
    ],
    wordCount: [story.excerpt, ...body].join(" ").split(/\s+/).length,
    timeRequired: `PT${minutes}M`,
    inLanguage: "en-IN",
  };

  return (
    <div className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }}
      />
      <ReadingProgressBar targetId="story-article" />
      <ScrollToTop />
      <Navbar />

      {/* Hero: the photo, full bleed, with the title set over it */}
      <section className="relative h-[62vh] md:h-[72vh] min-h-[440px] max-h-[820px] flex items-end overflow-hidden">
        <Image src={hero.src} unoptimized={hero.unoptimized} alt="" fill priority sizes="100vw" className="photo-grade object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/30" />

        <div className="relative z-10 max-w-3xl mx-auto px-5 lg:px-8 pb-9 lg:pb-14 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {story.tags.includes("Featured") && (
              <span className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full backdrop-blur-md" style={{ background: "rgba(10,8,6,0.6)", border: "1px solid rgba(255,179,122,0.3)" }}>
                <Crown className="w-3 h-3" style={{ color: "#ffb37a" }} />
                <span className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "#ffd9b8" }}>Featured</span>
              </span>
            )}
            {activity && (
              <span className="inline-flex items-center gap-1.5 pl-2 pr-3 py-1 rounded-full backdrop-blur-md text-[10.5px] font-bold uppercase tracking-[0.14em] text-white" style={{ background: "rgba(255,81,0,0.85)" }}>
                {ADVENTURE_TYPE_ICONS[activity]?.(12)}{activity}
              </span>
            )}
          </div>

          <h1 className="text-white text-[32px] sm:text-5xl lg:text-6xl leading-[1.08] max-w-3xl" style={{ letterSpacing: "-0.025em" }}>
            {story.title}
          </h1>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-[13px] font-medium text-white/80">
            <span className="inline-flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{story.region}</span>
            {story.adventureDate && <span>{story.adventureDate}</span>}
            <span className="inline-flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />{minutes} min read</span>
          </p>
        </div>
      </section>

      {/* Everything below the hero sits on the topographic texture used across the site */}
      <div className="topo">
      {/* Byline bar: who wrote it, and like / share within reach */}
      <div style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <div className="max-w-3xl mx-auto px-5 lg:px-8 py-4 flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0" style={{ background: "var(--bg-surface-2)" }}>
            {story.authorAvatar && <Image src={story.authorAvatar} alt="" fill sizes="44px" className="object-cover" />}
          </div>
          <div className="min-w-0 mr-auto">
            <p className="text-[15px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>{story.author}</p>
            {story.authorRole && <p className="text-[16px] truncate leading-tight" style={{ ...script, color: "var(--text-tertiary)" }}>{story.authorRole}</p>}
          </div>
          <StoryLikeButton slug={story.slug} baseLikes={story.baseLikes} pill muted />
          <StoryShareButton title={story.title} slug={story.slug} muted />
        </div>
      </div>

      {/* Article */}
      <article id="story-article" className="max-w-2xl mx-auto px-5 lg:px-6 pt-4 pb-12 lg:pb-20">
        <div className="-mx-5 lg:-mx-8">
          <Breadcrumbs items={[{ label: "Stories", href: "/stories" }, { label: story.title }]} />
        </div>

        {/* Lede */}
        <p className="text-[20px] lg:text-[24px] leading-[1.5] mt-6 mb-10 lg:mb-12" style={{ fontFamily: "var(--font-display), Georgia, serif", color: "var(--text-primary)" }}>
          {story.excerpt}
        </p>

        {/* Body: the first paragraph opens with a drop cap */}
        <div className="space-y-6">
          {body.map((para, idx) => (
            <p key={idx}
              className={`text-[17px] lg:text-[18px] leading-[1.8] ${idx === 0 ? "first-letter:float-left first-letter:text-[64px] first-letter:leading-[0.9] first-letter:mr-3 first-letter:mt-1 first-letter:font-bold first-letter:text-[#ff5100]" : ""}`}
              style={{ color: "color-mix(in srgb, var(--text-primary) 88%, transparent)" }}>
              {para}
            </p>
          ))}
        </div>

        <p className="text-center text-xl mt-12 tracking-[0.6em]" aria-hidden style={{ color: "var(--accent-ink)" }}>···</p>

        {/* Author card */}
        <div className="mt-10 rounded-2xl p-6 flex items-start gap-4 sm:gap-5" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
          <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0" style={{ background: "var(--bg-surface-2)", border: "1.5px solid rgba(255,81,0,0.25)" }}>
            {story.authorAvatar && <Image src={story.authorAvatar} alt="" fill sizes="56px" className="object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--accent-ink)" }}>Written by</p>
            <p className="text-lg font-semibold mt-0.5" style={{ color: "var(--text-primary)" }}>{story.author}</p>
            {story.authorRole && <p className="text-[17px] leading-snug" style={{ ...script, color: "var(--text-tertiary)" }}>{story.authorRole}</p>}
            {story.authorBio && <p className="text-[14px] mt-2.5 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{story.authorBio}</p>}
          </div>
        </div>

        {/* Hashtags: every one links to a destination, trips, a guide or more stories, which is
            also how search engines find their way from this story to the rest of the site */}
        <nav aria-label="Topics in this story" className="mt-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] mb-3" style={{ color: "var(--text-tertiary)" }}>Topics in this story</p>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.href}>
                <Link href={tag.href} rel="tag" className="inline-flex items-center text-[13px] font-medium px-3 py-1.5 rounded-full transition-colors hover:text-[#ff5100] hover:border-[#ff5100]/40"
                  style={{ background: "var(--bg-surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border-subtle)" }}>
                  <span style={{ color: "var(--accent-ink)" }}>#</span>{tag.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <StoryShareBar title={story.title} slug={story.slug} />

        <StoryComments slug={story.slug} />
      </article>

      {/* The turn from reading to going: trips like this one, and a reason to join */}
      <section className="px-5 lg:px-8 pb-14 lg:pb-20">
        <div className="max-w-6xl mx-auto rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(255,81,0,0.14), rgba(255,81,0,0.03) 60%), var(--bg-surface)", border: "1px solid rgba(255,81,0,0.22)" }}>
          <div className="p-6 sm:p-10 lg:p-12">
            <div className="grid lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-12 items-end">
              <div>
                <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] mb-3" style={{ color: "var(--accent-ink)" }}>Inspired?</p>
                <h2 className="text-3xl sm:text-4xl lg:text-[44px] leading-[1.08]" style={{ color: "var(--text-primary)" }}>
                  {activity && story.region ? <>Your own {activity.toLowerCase()} story starts here.</> : <>Your own story starts here.</>}
                </h2>
                <p className="text-[15.5px] leading-relaxed mt-4 max-w-xl" style={{ color: "var(--text-secondary)" }}>
                  Trail to Tides is India&apos;s adventure platform. Find the trip, see if you&apos;re ready for it, and go with an operator people vouch for.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  { icon: Compass, t: "Compare trips and verified operators", d: "Prices, dates and reviews side by side." },
                  { icon: Gauge, t: "Know if you're ready", d: "ACE rates what each trip asks of your body." },
                  { icon: Heart, t: "Save, plan and log", d: "Keep a wishlist and a passport of where you've been." },
                ].map((x) => (
                  <li key={x.t} className="flex gap-3">
                    <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(255,81,0,0.14)" }}>
                      <x.icon className="w-4 h-4" style={{ color: "var(--accent-ink)" }} />
                    </span>
                    <div>
                      <p className="text-[14.5px] font-semibold" style={{ color: "var(--text-primary)" }}>{x.t}</p>
                      <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>{x.d}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link href={activity && liveTypes.has(activity) ? `/explore?type=${encodeURIComponent(activity)}` : "/explore"}
                className="group inline-flex items-center gap-2 bg-[#ff5100] hover:bg-[#ff7d47] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all hover:-translate-y-0.5" style={{ boxShadow: "0 6px 18px rgba(255,81,0,0.28)" }}>
                {activity && liveTypes.has(activity) ? `Find ${activity.toLowerCase()} trips` : "Explore adventures"}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href={`/auth/signup?next=${encodeURIComponent(`/stories/${story.slug}`)}`}
                className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-3 rounded-xl transition-colors hover:border-[#ff5100]/50"
                style={{ color: "var(--text-primary)", border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}>
                Join free
              </Link>
            </div>

            {suggestedAdventures.length > 0 && (
              <div className="mt-10 pt-8" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                <h3 className="text-[15px] font-semibold mb-5" style={{ color: "var(--text-primary)" }}>
                  Trips like this one
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {suggestedAdventures.map((adventure) => (
                    <AdventureCard key={adventure.id} adventure={adventure} size="default" />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* More stories */}
      {others.length > 0 && (
        <section className="t-bg-surface2 py-12 lg:py-20 px-5 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-8 lg:mb-10">
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "var(--accent-ink)" }}>Keep reading</p>
                <h2 className="text-2xl lg:text-3xl" style={{ color: "var(--text-primary)" }}>More from the trails</h2>
              </div>
              <Link href="/stories" className="flex items-center gap-1.5 hover:text-[#ff5100] text-sm font-semibold transition-colors group" style={{ color: "var(--text-tertiary)" }}>
                All stories <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 lg:gap-6">
              {others.map((s) => <StoryCard key={s.id} story={s} />)}
            </div>
          </div>
        </section>
      )}

      {/* Turn readers into writers */}
      <section className="px-5 lg:px-8 py-12 lg:py-16">
        <div className="max-w-3xl mx-auto">
          <ShareStoryCTA heading="Been somewhere worth writing about?" subtext={["Your story could be the one that gets someone out the door.", "We read every submission."]} />
        </div>
      </section>

      </div>

      <Footer />
    </div>
  );
}
