import { NextResponse } from "next/server";
import { stories as staticStories } from "@/lib/data";
import { createClient } from "@supabase/supabase-js";
import { StoryDB, saveStoryToStorage } from "@/lib/stories";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const STORAGE_BUCKET = "story-data";

export async function POST() {
  const log: string[] = [];

  try {
    // 1. Ensure bucket exists
    const { data: buckets } = await admin.storage.listBuckets();
    if (!buckets?.find((b) => b.name === STORAGE_BUCKET)) {
      await admin.storage.createBucket(STORAGE_BUCKET, { public: false });
      log.push("Created story-data bucket");
    }

    // 2. Check which stories already exist in Storage
    const { data: files } = await admin.storage.from(STORAGE_BUCKET).list("stories");
    const existingSlugs = new Set<string>();
    if (files?.length) {
      for (const f of files) {
        if (f.name.endsWith(".json")) existingSlugs.add(f.name.replace(".json", ""));
      }
    }

    // 3. Seed each static story with body content
    const storyBodies: Record<string, string> = {
      "the-night-photi-la-tested-us": [
        "Friendship had survived four years across cities. But B never changes. If he calls, it's never casual. 'Parso ki flight book kar le.' Leave approvals, minor family drama, borrowed riding gear -- done. We met A during a chaotic Delhi layover. Social-media baller. Real-life introvert. Perfect addition to the chaos. We landed in Ladakh sleep-deprived and overconfident. The air was thin, sharp, intoxicating. Two bikes waited. And no real plan beyond 'ride high.'",
        "Within 48 hours, we had crossed Khardung La, stayed in Diskit, watched Pangong Lake change colors, and reached Hanle. The roads were rough. The landscapes unreal. The laughter constant. Then came the real target: Umling La -- 19,300 ft. The highest motorable road in the world. A local mentioned a shortcut. It wasn't a shortcut. It was a sandy ribbon carved into a mountainside so steep that stopping meant sliding backward. Engines screamed. Clutches burned. We refused to quit. And we made it. At the summit, we felt invincible. That feeling would not last.",
        "'Demchok is just 30 km from here.' Demchok -- India's last village on the China border. We should have turned back. Instead, we rode into thinner air and thicker uncertainty. Brake failures hit both B and me mid-descent. K and S -- the pros -- taught us engine braking on the spot. We reached Demchok by 3 PM. Ate at the army cafe. Watched steam rise from distant hot springs. Across a stream -- China. Officials engaged in a flag meeting. It felt surreal. Then the sky cracked open.",
        "The rain didn't stop. It intensified. By 4 PM, we were cramped in a broken shelter with army personnel. Hail struck the tin roof like warning shots. In Ladakh, you don't ride after dark. But staying meant being stranded. The shortcut we took? Destroyed. The only way back: six brutal hours via Umling La and Photi La. I had forgotten my rain liner. A jawaan handed me his poncho from personal ration and refused payment. We rode. Rain in the valley became snow at Umling La. One photo at the summit. No celebration this time. Just urgency.",
        "Darkness swallowed the road. No vehicles. No lights. No villages awake. Only engines echoing against mountain walls. At the base of Photi La, we reorganized. I admitted it: 'I'm petrified.' Formation set. Lights adjusted. Slow climb began. Halfway up, fog engulfed us. We were riding inside a cloud. Hairpin bends. Steep drops. Zero visibility. My clutch slipped. I dropped the bike. For a few minutes, it was just me and B in dense fog. Then B said something I will never forget. 'Bhai... mere peeche ek bike hai.' There wasn't. No headlights. No sound. But he insisted -- a light in his rearview mirror, following off-road.",
        "We regrouped. Then we heard it. A loud horn. Clear. Close. Nothing behind us. Seconds later -- a landslide crashed ahead. When we moved forward cautiously, a massive boulder covered half the road. Had we been seconds earlier, we would have ridden straight into it. No one spoke. We descended in silence. We reached Hanle close to midnight. Relief felt physical. Then B began shivering violently -- burning with fever. The caretaker stepped out, observed quietly, and returned with prayer beads and a bowl of water. He chanted softly. 'He'll be fine by morning.' And he was. Completely fine.",
        "Over morning kahwa, the caretaker said: 'Photi La is very dangerous. Many die there. Never cross at night.' We narrated the horn. The light. The landslide. He nodded calmly. 'That biker was a good spirit. He protected you. He stopped you before the landslide.' We didn't debate logic. Because the timing made sense. And in the mountains, sometimes timing is everything.",
        "We left Hanle that day in silence. K and S rode toward Manali. We headed back toward Leh. Before flying home, B insisted on visiting a monastery. People return from trips with photos and stories. We returned with gratitude, humility, and a quiet belief that the mountains decide. The Himalayas don't scare you to break you. They scare you to remind you: you are small, control is fragile, and sometimes, you are protected in ways you cannot explain.",
      ].join("\n\n"),
      "riding-through-a-revolution": [
        "We were three corporate workers fed up with our mundane days in the concrete jungle, so we decided to plan an escape. The destination was set: Nepal, in all its wild glory. We shipped our bikes from Mumbai to Gurgaon, got on the saddles, and rode out to Lucknow. By the time we crossed the Gorakhpur to Sunauli stretch, crossed the border, and dealt with the slow Nepali customs process, the sun was going down. We finally arrived in Butwal for the night, eager to crack open our first icy Gorkha beers the second we parked.",
        "It was a phenomenal feeling. Riding our own bikes through a foreign country washed away the rust of our daily routines. The pure wonder of childhood came rushing back as we took in the fresh air, the new roads, and the total freedom. The next day, on our way to Pokhara, we took a long two hour lunch just to stare at the mighty peaks in the distance. As we were getting ready to leave, a local rider pulled up next to us and asked if he could ride with us to Pokhara. Just like that, we were four.",
        "We woke up the next morning, checked the bikes, and got ready to head out. We noticed crowds gathering in Pokhara. It looked like the beginnings of a demonstration, but we brushed it off and rode out toward Nayapul on smooth tarmac. With our new rider friend leading the way, we turned toward Ghandruk. The views were amazing, right up until we hit our toughest challenge. The trail became a narrow path covered with massive boulders. Our bikes just would not budge. Between the four of us, we fell eleven times. We had to resort to pushing each bike up the grueling climb. It took everything in us not to quit. I have ridden a lot of difficult terrain, but the lonely tiredness of that stretch as the night became darker still haunts me.",
        "We somehow made it to Ghandruk. Thinking the worst was behind us, we settled into our rooms. That was when we realized exactly what those demonstrations in Pokhara really were — the early seeds of a quiet revolution that had been bubbling for months. That night, on Sept 8th 2024, under heavy police crackdowns, it erupted into the infamous violence of the Gen Z revolution. All of a sudden, we were stuck in a foreign country with closed borders and no idea what to do next. With nowhere else to go, Ghandruk became our safe haven, and Hotel Aangan became our home.",
        "We spent days holed up there, forging deep bonds with the hotel owner, Deep dai, and his family. As a gesture of goodwill, his brother-in-law Parmish guided us on a two day trek through a jungle full of leeches to see the incredible views of the Annapurna and Dhaulagiri ranges from Mulde Peak. When the roads finally seemed safe enough, Deep dai escorted us back to Pokhara. With our local rider friend still alongside us, we were now five. Pokhara bore the fresh marks of the violence that had just happened — municipal buildings broken, a hotel still on fire.",
        "The ride home would have been uneventful had my fried clutch not given out entirely just past Lucknow. It was frustrating to limp along at 60 kmph while my friends were cruising at double my speed. I became the turtle they would have to catch up to, or wait for at the next break. Somehow we made it to Delhi. We returned with only half the adventure we had planned, witnessed a revolution we never expected, and brought back more memories than we ever could have asked for.",
      ].join("\n\n"),
    };

    let inserted = 0;
    let skipped = 0;

    for (const s of staticStories) {
      if (existingSlugs.has(s.slug)) {
        log.push(`SKIP ${s.slug} - already seeded`);
        skipped++;
        continue;
      }

      const submittedBy = s.submittedBy && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.submittedBy)
        ? s.submittedBy
        : null;

      const story: StoryDB = {
        id: s.id,
        slug: s.slug,
        title: s.title,
        excerpt: s.excerpt,
        body: storyBodies[s.slug] || "",
        author_name: s.author,
        author_role: s.authorRole || "",
        author_bio: s.authorBio || "",
        author_avatar: s.authorAvatar || "",
        hero_image: s.heroImage,
        read_time: s.readTime,
        tags: s.tags || [],
        region: s.region,
        date: s.date,
        status: "published",
        submitted_by: submittedBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const saved = await saveStoryToStorage(story);
      if (saved) {
        log.push(`SEEDED ${s.slug}`);
        inserted++;
      } else {
        log.push(`FAIL ${s.slug}`);
      }
    }

    // Also seed story views
    const viewsPayload = [
      { slug: "the-night-photi-la-tested-us", views: 342, updated_at: new Date().toISOString() },
      { slug: "riding-through-a-revolution", views: 156, updated_at: new Date().toISOString() },
    ];
    const viewsJson = JSON.stringify(viewsPayload);
    await admin.storage.from(STORAGE_BUCKET).upload("views/index.json", new TextEncoder().encode(viewsJson), {
      contentType: "application/json",
      upsert: true,
    });

    log.push(`Views seeded`);
    log.push(`DONE: ${inserted} inserted, ${skipped} skipped`);

    return NextResponse.json({ inserted, skipped, log });
  } catch (err: any) {
    log.push(`FATAL: ${err.message}`);
    return NextResponse.json({ error: err.message, log }, { status: 500 });
  }
}