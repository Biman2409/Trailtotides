// Server only: notes the Trail to Tides team added to each listing before there were traveller
// reviews. Shown as "Team note, not a traveller review", never averaged or counted
// (src/components/ui/custom/ReviewSection.tsx). Kept out of data.ts so the ~40 KB of text isn't
// in every page's JavaScript; only /api/reviews reads it.
import type { SeedReview } from "./data";

export const SEED_REVIEWS: Record<string, SeedReview[]> = {
  "manali-leh-bike-expedition": [
      { id: "sr-manali-1", username: "kartik_rao", avatar_id: 5, rating: 5, body: "Rode it on a Himalayan. Tanglang La in the rain scared me and I loved it anyway. You end up riding with strangers for hours and sharing chai at every dhaba, nobody plans that, it just happens.", created_at: "2025-07-18T06:42:00Z", user_id: "" },
      { id: "sr-manali-2", username: "neha_rides", rating: 5, body: "first high altitude ride for me. baralacha la at sunrise was the best part. get the bike serviced the day before and carry extra engine oil, roads after keylong are rough", created_at: "2025-06-30T08:15:00Z", user_id: "" },
      { id: "sr-manali-3", username: "aditya_b", rating: 4, body: "Landslide near Keylong cost us a full day so keep buffer days. Sarchu camp under the stars was my favourite night. Mid July to mid Aug is packed with bikers, go earlier if you can.", created_at: "2025-07-05T09:30:00Z", user_id: "" },
    ],
  "spiti-valley-cycling": [
      { id: "sr-spiti-cyc-1", username: "rahulcycles", avatar_id: 8, rating: 5, body: "Kunzum La (4,590m) on a loaded cycle. Still can't believe I pulled that off. Thin air, thin tyres. Carry at least two spare tubes, I used both.", created_at: "2025-08-20T11:05:00Z", user_id: "" },
      { id: "sr-spiti-cyc-2", username: "shruti_iyer", rating: 4, body: "September was a good call. Roads were clear and campsites mostly empty. Day 2 gave me an altitude headache so I took it slow, which helped. Key Monastery in the evening light is lovely from the saddle.", created_at: "2025-09-08T13:20:00Z", user_id: "" },
      { id: "sr-spiti-cyc-3", username: "mihir", rating: 5, body: "Chicham bridge is on the route and most people zip past it. Get off the cycle and look down for a minute! Hardest riding I've done in my life and I'd sign up again tomorrow.", created_at: "2025-09-20T15:48:00Z", user_id: "" },
    ],
  "ladakh-circuit": [
            { id: "sr-ladakh-1", username: "arjun_s", avatar_id: 9, rating: 5, body: "Made it to Umling La. GoPro frosted over, the Bullet misfired twice and I couldn't feel my face. Still the best day of the trip.", created_at: "2025-08-15T17:12:00Z", user_id: "" },
            { id: "sr-ladakh-2", username: "nandini_blr", rating: 5, body: "Five of us from Bangalore, 22 days, a bit over 2,000 km. Pangong at sunrise on day 10 is when it clicked for all of us. Plan 25 days if you can, we felt rushed in places.", created_at: "2025-07-30T19:36:00Z", user_id: "" },
            { id: "sr-ladakh-3", username: "vivek_lal", rating: 4, body: "My one bit of advice: don't attempt this solo on a rental. Go with a group or an organised trip. A breakdown at 5,000m with no signal is a real problem. With the right people it's the ride of a lifetime.", created_at: "2025-09-01T21:03:00Z", user_id: "" },
          ],
  "zanskar-valley-bike": [
      { id: "sr-zanskar-1", username: "sameer_offroad", avatar_id: 3, rating: 5, body: "Calling it a road is generous. River crossings, loose scree, landslide debris. Valley on the other side is worth it but beginners should skip this one.", created_at: "2025-08-22T22:27:00Z", user_id: "" },
      { id: "sr-zanskar-2", username: "leela_b", rating: 4, body: "Go with a team that knows when the river crossings are safe (that timing matters a lot) and runs a support vehicle. Take a full rest day near Padum for the monastery. Carry plenty of cash, there are no ATMs after Kargil.", created_at: "2025-09-03T06:42:00Z", user_id: "" },
      { id: "sr-zanskar-3", username: "keshav", rating: 5, body: "3 days with zero signal, woke up to a frozen tent on day 2, and the Zanskar river at sunrise was a blue I'd never seen. Please take a local guide, it's not optional out here.", created_at: "2025-08-30T08:15:00Z", user_id: "" },
    ],
  "kedarkantha-trek": [
    { id: "sr-kedarkantha-1", username: "priyanka_h", avatar_id: 4, rating: 5, body: "My first ever summit! Watching Bandarpunch and Swargarohini go pink at sunrise is something I still think about. Walking up through the pine forest with headlamps at night was special too.", created_at: "2025-01-18T09:30:00Z", user_id: "" },
    { id: "sr-kedarkantha-2", username: "aditya_snow", rating: 5, body: "3rd time doing Kedarkantha. January is the month: waist deep snow in the forest, clear sky at the top. The group was well run, and the hot food at camp in minus temps was surprisingly good.", created_at: "2025-01-28T11:05:00Z", user_id: "" },
    { id: "sr-kedarkantha-3", username: "tanya_kapoor", rating: 4, body: "Great for beginners but summit day is no joke. We started at 4am, topped out around 8:30 just as clouds rolled in. Sankri base has decent tents and toilets now. Minus one star because late December was very crowded.", created_at: "2025-12-27T13:20:00Z", user_id: "" },
  ],
  "sandakphu-phalut-trek": [
    { id: "sr-sandakphu-1", username: "ishaan_ghosh", rating: 5, body: "4:30am on Sandakphu. Everest, Kangchenjunga, Lhotse and Makalu all lit up together. About forty of us stood there totally quiet for ten minutes.", created_at: "2025-04-12T15:48:00Z", user_id: "" },
    { id: "sr-sandakphu-2", username: "sonal_walks", avatar_id: 6, rating: 5, body: "april = rhododendrons everywhere. red and pink canopy along the whole ridge. combine that with the mountain view at the top and it's hard to beat", created_at: "2025-04-18T17:12:00Z", user_id: "" },
    { id: "sr-sandakphu-3", username: "binoy", rating: 4, body: "Permits are a bit of paperwork but a decent operator sorts it. December is cold, though the views were clearer than spring. Teahouses on the ridge are basic but warm, and dal bhat with Darjeeling chai fixes most things. Phalut was quieter than Sandakphu.", created_at: "2025-12-08T19:36:00Z", user_id: "" },
  ],
  "tarsar-marsar-trek": [
    { id: "sr-tarsar-1", username: "faiza_mir", avatar_id: 1, rating: 5, body: "Eight years of trekking and Tarsar at dusk is still my favourite picture in my head. Pink peaks above, one shepherd crossing the meadow below. Kashmir's high valleys are on another level for colour.", created_at: "2025-07-25T21:03:00Z", user_id: "" },
    { id: "sr-tarsar-2", username: "ajay_j", rating: 5, body: "Most people only talk about Tarsar but Marsar was the more dramatic lake for me, and far fewer people go. Coming down from the pass into that bowl felt like finding a secret. Shepherds shared tea with us even though we had no common language.", created_at: "2025-08-05T22:27:00Z", user_id: "" },
    { id: "sr-tarsar-3", username: "divya", rating: 4, body: "The campsites on the meadows were lovely. Only issue: the trail between Tarsar and the pass isn't marked and our group took a wrong turn in morning fog. Stay close to the guide up there.", created_at: "2025-07-18T06:42:00Z", user_id: "" },
  ],
  "spiti-valley-bike": [
      { id: "sr-spiti-bike-1", username: "gaurav_thakur", avatar_id: 5, rating: 5, body: "This loop is what riding in India should feel like. Dhankar on its cliff, Pin Valley at golden hour, kids waving from monastery roofs. Never felt touristy once.", created_at: "2025-07-25T08:15:00Z", user_id: "" },
      { id: "sr-spiti-bike-2", username: "divya_m", rating: 5, body: "Did the loop in 10 days, could easily have used 14. Stay a night or two in Kibber, tiny village and perfect for a rest day.", created_at: "2025-08-10T09:30:00Z", user_id: "" },
      { id: "sr-spiti-bike-3", username: "tanvir", rating: 4, body: "Kaza to Losar before Kunzum La was the most surreal riding I've done. Brown desert hills, turquoise river and no traffic at all. Do book your Kaza stay in advance for July and August.", created_at: "2025-07-30T11:05:00Z", user_id: "" },
    ],
  "ali-bedni-bugyal": [
      { id: "sr-alibed-1", username: "supriya", rating: 5, body: "Sunset on the meadow with Trishul behind it. I didn't take a single photo, just sat there.", created_at: "2025-10-02T13:20:00Z", user_id: "" },
      { id: "sr-alibed-2", username: "rohit_loh", avatar_id: 2, rating: 4, body: "good first himalayan trek. the forest days are a slog but day 3 when you come out onto the bugyal makes up for it", created_at: "2025-09-18T15:48:00Z", user_id: "" },
      { id: "sr-alibed-3", username: "naina_joshi", rating: 5, body: "Went in May and the rhododendrons were in full bloom all the way up. Camping at Bedni with snow peaks on every side was the highlight of my year.", created_at: "2025-05-24T17:12:00Z", user_id: "" },
    ],
  "annapurna-base-camp": [
      { id: "sr-abc-1", username: "arjun_menon", rating: 5, body: "5am at ABC, Annapurna I turning pink. I'll remember that one forever.", created_at: "2025-10-15T19:36:00Z", user_id: "" },
      { id: "sr-abc-2", username: "meghna_p", avatar_id: 7, rating: 4, body: "Loved it overall. Teahouses above Chhomrong are very basic though, so manage expectations. Above the treeline it looks like a different planet.", created_at: "2025-04-20T21:03:00Z", user_id: "" },
      { id: "sr-abc-3", username: "vikash_n", rating: 5, body: "Got my best ever photo: Machhapuchhre reflected near the Modi Khola. Hire a local guide, the trail forks in a few places and signage is patchy.", created_at: "2025-10-30T22:27:00Z", user_id: "" },
    ],
  "annapurna-circuit": [
      { id: "sr-ac-1", username: "preetam_c", rating: 5, body: "Thorong La day: 4am start, around minus 15, headtorch on. By 9am I was over the top looking back down at Manang. Best decision I've made.", created_at: "2025-10-12T06:42:00Z", user_id: "" },
      { id: "sr-ac-2", username: "swathi", avatar_id: 6, rating: 5, body: "Manang to Muktinath in one go got me emotional, no shame. Came back a slightly different person.", created_at: "2025-04-28T08:15:00Z", user_id: "" },
      { id: "sr-ac-3", username: "kabir_w", rating: 4, body: "Around day 12 your legs start complaining but the pass pays it all back. Sort your permits in Kathmandu before you leave, saves a lot of hassle.", created_at: "2025-10-08T09:30:00Z", user_id: "" },
    ],
  "bagini-glacier": [
      { id: "sr-bag-1", username: "nikhil_garg", avatar_id: 10, rating: 5, body: "Changbang's face from the glacier is honestly scary, a huge wall of granite. Hard trek, but nothing technical.", created_at: "2025-09-10T11:05:00Z", user_id: "" },
      { id: "sr-bag-2", username: "anisha_d", rating: 4, body: "The moraine section wore me out. Then sunrise at the glacier camp and I forgot all about it. We hired a guide from Pipalkoti, recommend doing the same.", created_at: "2025-05-20T13:20:00Z", user_id: "" },
      { id: "sr-bag-3", username: "deepak_trek", rating: 5, body: "did this after har ki dun. completely different league. raw and remote and we saw maybe two other groups", created_at: "2025-06-05T15:48:00Z", user_id: "" },
    ],
  "bali-pass": [
      { id: "sr-bali-1", username: "surya_p", avatar_id: 3, rating: 5, body: "Pass day was the hardest day I've had in the mountains. 14 hours, knee deep snow, wind that went straight through my layers. The view from the top fixed all of it.", created_at: "2025-06-12T17:12:00Z", user_id: "" },
      { id: "sr-bali-2", username: "kamla", rating: 4, body: "When they say difficult they mean it. Come properly fit. You get Bandarpunch views almost the whole way up, which helps.", created_at: "2025-09-28T19:36:00Z", user_id: "" },
      { id: "sr-bali-3", username: "ritesh_b", rating: 5, body: "Bikat ran it really well. Going from the Har Ki Dun meadows to bare snowfields in a single day is wild.", created_at: "2025-05-30T21:03:00Z", user_id: "" },
    ],
  "buran-ghati": [
      { id: "sr-buran-1", username: "amit_r", avatar_id: 9, rating: 5, body: "The rappel!! 20 Himalayan treks and nothing compares to clipping in at the top of that snow wall. Pure adrenaline.", created_at: "2025-06-08T22:27:00Z", user_id: "" },
      { id: "sr-buran-2", username: "raksha_t", rating: 5, body: "Guides set up the ropes very well so the rappel itself felt safe. The tough bit is actually the snow slog before the pass. Worth it.", created_at: "2025-05-28T06:42:00Z", user_id: "" },
      { id: "sr-buran-3", username: "varun_h", rating: 4, body: "Camp below the pass looks straight at the Kinnaur Kailash range. Coming down into Sangla valley feels like walking into another world.", created_at: "2025-10-01T08:15:00Z", user_id: "" },
    ],
  "beas-kund": [
      { id: "sr-beas-1", username: "kavya", avatar_id: 4, rating: 5, body: "My very first trek and it was perfect for that. Distances were manageable and the lake at the end is so pretty.", created_at: "2025-08-14T09:30:00Z", user_id: "" },
      { id: "sr-beas-2", username: "harish_s", rating: 4, body: "Good warm up before harder routes. Dhundi meadow is a nice campsite. Bit crowded in August.", created_at: "2025-08-25T11:05:00Z", user_id: "" },
      { id: "sr-beas-3", username: "pooja_t", rating: 5, body: "short and sweet. shitidhar reflected in the kund is the best view i've had for a 3 day trip", created_at: "2025-07-30T13:20:00Z", user_id: "" },
    ],
  "bhrigu-lake": [
      { id: "sr-bhrigu-1", username: "reema_h", rating: 5, body: "In July the meadows below the lake are covered in wildflowers. I'd been to Manali many times and had no idea this was up there.", created_at: "2025-07-22T15:48:00Z", user_id: "" },
      { id: "sr-bhrigu-2", username: "anil", avatar_id: 2, rating: 4, body: "You gain height faster than it looks on paper, so go slow on day 2. Lake is dark blue sitting in a bowl of snow. Lovely.", created_at: "2025-08-18T17:12:00Z", user_id: "" },
      { id: "sr-bhrigu-3", username: "suchitra_w", rating: 5, body: "Great 4 day intro to the Himalaya. Camping next to the lake under the stars was the best night.", created_at: "2025-09-05T19:36:00Z", user_id: "" },
    ],
  "brahmatal": [
      { id: "sr-brah-1", username: "tanmay", avatar_id: 7, rating: 5, body: "Walking through the snowy forest at night with headlamps... still giving me goosebumps. Frozen lake with Trishul behind it. Wow.", created_at: "2025-01-15T21:03:00Z", user_id: "" },
      { id: "sr-brah-2", username: "asha_w", rating: 5, body: "Perfect first winter trek. The gear was solid and the guides managed our group really well at around minus 10.", created_at: "2025-02-08T22:27:00Z", user_id: "" },
      { id: "sr-brah-3", username: "kishore_b", rating: 4, body: "Cold nights, no getting around that. The summit view of Trishul and Nanda Ghunti makes up for it. January for the best snow.", created_at: "2025-01-28T06:42:00Z", user_id: "" },
    ],
  "dayara-bugyal": [
      { id: "sr-day-1", username: "prerna_d", avatar_id: 1, rating: 5, body: "Sunrise on the bugyal with Bandarpunch going orange looked like a painting. Easy enough for beginners.", created_at: "2025-10-10T08:15:00Z", user_id: "" },
      { id: "sr-day-2", username: "saurabh_g", rating: 4, body: "Went in November, autumn colours were incredible. Raithal is a sweet village. Camping up on the open meadow gave us a sky full of stars.", created_at: "2025-11-05T09:30:00Z", user_id: "" },
      { id: "sr-day-3", username: "latha", rating: 5, body: "Did this as a family and my 14 year old managed it easily. The meadow is huge, you can wander for hours.", created_at: "2025-06-08T11:05:00Z", user_id: "" },
    ],
  "deoriatal-chandrashila": [
      { id: "sr-dc-1", username: "amruta_h", rating: 5, body: "Deoria Tal at 6am with Chaukhamba mirrored in the water. Then the summit the next morning. Two great mornings in a row.", created_at: "2025-04-15T13:20:00Z", user_id: "" },
      { id: "sr-dc-2", username: "ravi_trek", avatar_id: 8, rating: 5, body: "Best beginner summit in Uttarakhand in my opinion. Seeing Kedarnath peak from the top was surreal.", created_at: "2025-10-20T15:48:00Z", user_id: "" },
      { id: "sr-dc-3", username: "seema", rating: 4, body: "The climb from Sari to Deoria Tal is short but steep. Give yourself a full day at the lake before moving on, we rushed it and regretted that.", created_at: "2025-05-05T17:12:00Z", user_id: "" },
    ],
  "everest-base-camp": [
      { id: "sr-ebc-1", username: "nidhi_e", rating: 5, body: "Two weeks building up to one moment, standing at EBC with Everest above you. Namche Bazaar is a highlight on its own. October gave us clear skies almost every day.", created_at: "2025-10-25T19:36:00Z", user_id: "" },
      { id: "sr-ebc-2", username: "kartik", avatar_id: 10, rating: 5, body: "Honestly my favourite moment wasn't base camp, it was Tengboche monastery with Ama Dablam behind it. It's the whole walk that makes this trek.", created_at: "2025-04-18T21:03:00Z", user_id: "" },
      { id: "sr-ebc-3", username: "deepa_khumbu", rating: 4, body: "Hard, cold, worth it. Altitude hit me badly above Dingboche. Build in proper rest days before Gorak Shep. You can hear the icefall cracking from camp, crazy sound.", created_at: "2025-10-30T22:27:00Z", user_id: "" },
    ],
  "gaumukh-tapovan": [
      { id: "sr-gau-1", username: "ishaan_g", avatar_id: 5, rating: 5, body: "Tapovan with Shivling right above you and sadhus meditating in caves nearby. Nowhere else I've been comes close.", created_at: "2025-06-01T06:42:00Z", user_id: "" },
      { id: "sr-gau-2", username: "meena_r", rating: 5, body: "Walking along the Gangotri glacier to Gaumukh felt very primal. Wear boots with good ankle support, the moraine is unforgiving.", created_at: "2025-05-18T08:15:00Z", user_id: "" },
      { id: "sr-gau-3", username: "naresh_t", rating: 4, body: "Above the glacier it gets physically tough but the Tapovan campsite is worth all of it. Bhagirathi peaks at sunset from camp, just sit and watch.", created_at: "2025-10-05T09:30:00Z", user_id: "" },
    ],
  "goechala": [
      { id: "sr-goechala-1", username: "binita_subba", avatar_id: 6, rating: 5, body: "No photo captures Kangchenjunga from viewpoint 3. You don't look at it so much as stand in front of a wall of ice.", created_at: "2025-10-18T11:05:00Z", user_id: "" },
      { id: "sr-goechala-2", username: "pankaj", rating: 5, body: "April means rhododendrons in full bloom and the forest is ridiculous. The whole trek is great, not just the viewpoint.", created_at: "2025-04-25T13:20:00Z", user_id: "" },
      { id: "sr-goechala-3", username: "trishna_sk", rating: 4, body: "Permits from Yuksom were straightforward. The guide is mandatory and ours ended up being the best part of the trip. Go in October for clear views.", created_at: "2025-10-22T15:48:00Z", user_id: "" },
    ],
  "hampta-pass": [
      { id: "sr-hamp-1", username: "radhika", rating: 5, body: "Green meadows behind you, brown moonscape ahead, all at the top of the pass. That one moment is why you do this trek.", created_at: "2025-08-10T17:12:00Z", user_id: "" },
      { id: "sr-hamp-2", username: "shubham_trek", avatar_id: 9, rating: 5, body: "added chandratal at the end and it made a perfect 6 day trip. chandratal at sunset is the best lake i've seen", created_at: "2025-07-22T19:36:00Z", user_id: "" },
      { id: "sr-hamp-3", username: "geetha_m", rating: 4, body: "The stream crossings on day 2 surprised me, quite deep in July. Not scary, just wasn't expecting it. Everything else was lovely.", created_at: "2025-07-15T21:03:00Z", user_id: "" },
    ],
  "har-ki-dun": [
      { id: "sr-hkd-1", username: "sunita_rawat", avatar_id: 1, rating: 5, body: "Camping at Har Ki Dun with Swargarohini straight above is the most beautiful valley floor I've seen. The old Duryodhana temple in the village was fascinating.", created_at: "2025-10-08T22:27:00Z", user_id: "" },
      { id: "sr-hkd-2", username: "vijay_trek", rating: 5, body: "November: bare trees, soft light, and we had the whole valley to ourselves. Easy enough for most people too.", created_at: "2025-11-02T06:42:00Z", user_id: "" },
      { id: "sr-hkd-3", username: "kamini", rating: 4, body: "Forest trail from Taluka to Osla is gorgeous. We did a village homestay one night and it was the warmest part of the trip. Some days felt long but the pace was fine overall.", created_at: "2025-05-14T08:15:00Z", user_id: "" },
    ],
  "kashmir-great-lakes": [
      { id: "sr-kgl-1", username: "zara_k", avatar_id: 4, rating: 5, body: "Vishansar at sunrise is a blue I didn't think was real. One of the most beautiful things I've seen in India.", created_at: "2025-08-05T09:30:00Z", user_id: "" },
      { id: "sr-kgl-2", username: "adnan", rating: 5, body: "7 lakes in 7 days, a sunset at nearly every one. Gadsar pass had knee deep snow in August which was a fun surprise.", created_at: "2025-07-28T11:05:00Z", user_id: "" },
      { id: "sr-kgl-3", username: "pooja_k", rating: 4, body: "Permit process at Sonamarg eats half a day, plan for it. Our Kashmiri guide knew every lake and every shortcut, made a huge difference.", created_at: "2025-08-12T13:20:00Z", user_id: "" },
    ],
  "kedartal": [
      { id: "sr-ktal-1", username: "rohini_g", rating: 5, body: "Kedartal at dawn with Thalaysagar reflected perfectly. The two days of boulders getting there are brutal. Still worth it.", created_at: "2025-06-10T15:48:00Z", user_id: "" },
      { id: "sr-ktal-2", username: "dinesh_h", avatar_id: 3, rating: 4, body: "Hardest non technical trek I've done. Six plus hours of boulder hopping wears you down. Lake made up for it.", created_at: "2025-09-20T17:12:00Z", user_id: "" },
      { id: "sr-ktal-3", username: "shalini_t", rating: 5, body: "Remote and properly hard. Kedarkharak campsite alone was worth it, Gangotri peaks all around.", created_at: "2025-05-30T19:36:00Z", user_id: "" },
    ],
  "kuari-pass": [
      { id: "sr-kuari-1", username: "arun", avatar_id: 7, rating: 5, body: "January, a foot of fresh snow, Nanda Devi sharp against a blue sky from the pass. Didn't say anything for a good few minutes.", created_at: "2025-01-20T21:03:00Z", user_id: "" },
      { id: "sr-kuari-2", username: "priya_gaur", rating: 5, body: "Best winter trek I've done. The forest above Khulara is beautiful and the view at the pass ties it all together.", created_at: "2025-02-15T22:27:00Z", user_id: "" },
      { id: "sr-kuari-3", username: "rohit_c", rating: 4, body: "Lord Curzon picked a good trail. Go slow and enjoy it. Coming down via Tali was really nice.", created_at: "2025-12-28T06:42:00Z", user_id: "" },
    ],
  "markha-valley": [
      { id: "sr-markha-1", username: "kartik_dorje", rating: 5, body: "Five days of walking through what looks like a Ladakhi painting. Hankar village, yak herders on the Nimaling plateau, then Kongmaru La. Each day better than the one before.", created_at: "2025-08-20T08:15:00Z", user_id: "" },
      { id: "sr-markha-2", username: "divya_markha", avatar_id: 5, rating: 5, body: "River crossing at Chilling was thigh deep with a strong current, honestly the most exciting bit. Bring poles. The valley after it is perfect.", created_at: "2025-07-10T09:30:00Z", user_id: "" },
      { id: "sr-markha-3", username: "suresh", rating: 4, body: "Acclimatise properly in Leh first. Kongmaru La at 5,200m hits even fit people. The plateau just before the pass was my favourite place on the whole trip.", created_at: "2025-09-05T11:05:00Z", user_id: "" },
    ],
  "pin-parvati-pass": [
      { id: "sr-pp-1", username: "nitin", avatar_id: 10, rating: 5, body: "Glacier crossing was terrifying and amazing at the same time. 15 Himalayan treks before this and none of them felt this big.", created_at: "2025-07-25T13:20:00Z", user_id: "" },
      { id: "sr-pp-2", username: "kaveri_s", rating: 5, body: "9 days, about 80 km, a glacier in the middle. Every day looked different. The Pin side is orange and ochre and silent, nothing like the Parvati side.", created_at: "2025-08-02T15:48:00Z", user_id: "" },
      { id: "sr-pp-3", username: "manish_pp", rating: 4, body: "Well run, but I wish I'd had some glacier experience before this. Don't underprepare. Views from the pass are incredible.", created_at: "2025-07-30T17:12:00Z", user_id: "" },
    ],
  "rupin-pass": [
      { id: "sr-rupin-1", username: "abhay", avatar_id: 8, rating: 5, body: "The waterfall campsite!! A 1,500 ft waterfall right next to your tent. And the snow tunnel on the way up was so much fun.", created_at: "2025-06-05T19:36:00Z", user_id: "" },
      { id: "sr-rupin-2", username: "sonal_t", rating: 5, body: "The gully above Upper Waterfall camp was close to vertical with snow in June. Properly challenging. Then you reach the pass and forget about it.", created_at: "2025-05-28T21:03:00Z", user_id: "" },
      { id: "sr-rupin-3", username: "tarun_r", rating: 4, body: "Easily in my top 3 Himalayan treks. Gorge, waterfall, meadow, snow, the pass, then the Kinnaur side going down. Bikat ran it really well.", created_at: "2025-10-12T22:27:00Z", user_id: "" },
    ],
  "valley-of-flowers": [
      { id: "sr-vof-1", username: "flora_h", avatar_id: 4, rating: 5, body: "August in the valley. First time I've ever seen a Himalayan blue poppy. After one morning there I understood the UNESCO tag.", created_at: "2025-08-08T06:42:00Z", user_id: "" },
      { id: "sr-vof-2", username: "gurmeet_singh", rating: 5, body: "Hemkund Sahib at dawn, the lake and the gurudwara with snow peaks around. Moving place whatever your faith is. The steps up are tough.", created_at: "2025-08-15T08:15:00Z", user_id: "" },
      { id: "sr-vof-3", username: "aishwarya_t", rating: 4, body: "Nature and spirituality in one trip. August is best for flowers but the trail gets busy, so leave Ghangaria early.", created_at: "2025-08-20T09:30:00Z", user_id: "" },
    ],
  "bajre-dara": [
      { id: "sr-bajre-1", username: "tenzin_s", avatar_id: 2, rating: 5, body: "December on Bajre Dara: crisp air, nobody else around, Kangchenjunga right above the frosty meadow. Surprised more people don't know about it.", created_at: "2025-12-20T11:05:00Z", user_id: "" },
      { id: "sr-bajre-2", username: "prerna_k", rating: 4, body: "Old rhododendron forest is beautiful even in winter. Meadow views were worth every cold night in the tent.", created_at: "2026-01-15T13:20:00Z", user_id: "" },
      { id: "sr-bajre-3", username: "nima_lepcha", rating: 4, body: "The drive in from Bagdogra takes most of a day so budget for it. After that it's quiet forest and then a huge open view of Kangchenjunga. February nights were properly cold, bring a good liner.", created_at: "2026-02-08T15:48:00Z", user_id: "" },
    ],
  "chandrakhani-pass": [
      { id: "sr-chandrak-1", username: "vikram_m", rating: 5, body: "The walk down into Malana was the best part for me. The village feels completely separate from the rest of India. Views from the pass are great as well.", created_at: "2025-06-18T17:12:00Z", user_id: "" },
      { id: "sr-chandrak-2", username: "isha_p", avatar_id: 6, rating: 4, body: "short but scenic. the climb to the pass is steep but doable, and the kullu view from the top was worth it", created_at: "2025-09-05T19:36:00Z", user_id: "" },
      { id: "sr-chandrak-3", username: "aakash_v", rating: 3, body: "Nice trek but we caught the tail of the monsoon. Two days of cloud and nothing from the pass. Malana has strict rules for outsiders (don't touch walls or people), fine, just read up first. Go in May or September.", created_at: "2025-07-22T21:03:00Z", user_id: "" },
    ],
  "dodital-darwa-pass": [
      { id: "sr-dodital-1", username: "subhash_r", avatar_id: 9, rating: 5, body: "Dodital at sunset with the forest reflected in the still water, then Darwa Pass views the next morning. Best two days of my trekking year.", created_at: "2025-05-28T22:27:00Z", user_id: "" },
      { id: "sr-dodital-2", username: "ananya", rating: 4, body: "Underrated! The forest sections are excellent, huge oaks and rhododendrons. Darwa Pass is tough but the view opens right up.", created_at: "2025-10-10T06:42:00Z", user_id: "" },
      { id: "sr-dodital-3", username: "pooja_negi", rating: 4, body: "Lovely forest walk up to Dodital and the lake is calm and green. Darwa Pass day is long with a steep last climb so start early. November gave us frost on the tents but clear Bandarpunch views.", created_at: "2025-11-02T08:15:00Z", user_id: "" },
    ],
  "doodhpathri": [
      { id: "sr-doodh-1", username: "amir_k", rating: 5, body: "July in Doodhpathri. Miles of green meadow, milky glacial streams, hardly any other trekkers. So peaceful.", created_at: "2025-07-20T09:30:00Z", user_id: "" },
      { id: "sr-doodh-2", username: "ritu_s", avatar_id: 1, rating: 4, body: "Very different from the high pass Kashmir treks, gentler but really beautiful. The shepherd camps add a lot.", created_at: "2025-08-10T11:05:00Z", user_id: "" },
      { id: "sr-doodh-3", username: "faisal_m", rating: 4, body: "Green as far as you can see and shepherds offered us tea at every camp. Rained most afternoons in late August and the trail got muddy, pack gaiters. Most relaxing week I've had in the hills.", created_at: "2025-08-24T13:20:00Z", user_id: "" },
    ],
  "gokyo-lakes": [
      { id: "sr-gokyo-1", username: "meera_n", avatar_id: 7, rating: 5, body: "Gokyo Ri at dawn with all four 8,000ers lit up. I teared up a little. Liked it more than EBC.", created_at: "2025-10-20T15:48:00Z", user_id: "" },
      { id: "sr-gokyo-2", username: "siddharth_p", rating: 5, body: "Less crowded than the main EBC trail and the views are better in my opinion. The valley feels remote even though the Khumbu is so popular.", created_at: "2025-04-18T17:12:00Z", user_id: "" },
      { id: "sr-gokyo-3", username: "raghav_iyer", rating: 3, body: "The trek itself deserves a 5. Our Lukla flight was cancelled two days running, which ate our buffer and we had to skip the rest day before Gokyo Ri. Keep at least two spare days. Third lake is worth the extra walk.", created_at: "2025-10-12T19:36:00Z", user_id: "" },
    ],
  "gulabi-kantha": [
      { id: "sr-gulabi-1", username: "nandita_g", rating: 5, body: "May on Gulabi Kantha. Pink slopes, white peaks, blue sky. I kept stopping every five minutes for photos.", created_at: "2025-05-15T21:03:00Z", user_id: "" },
      { id: "sr-gulabi-2", username: "deepak_t", avatar_id: 5, rating: 4, body: "Underrated Uttarkashi trek. Gangotri peaks from the ridge are superb and the trail is in good shape. Short and rewarding.", created_at: "2025-10-12T22:27:00Z", user_id: "" },
      { id: "sr-gulabi-3", username: "manish_rawat", rating: 5, body: "Did it in April with my teenage son, his first snow trek. Bandarpunch looked close enough to touch from the top. Short days, good campsites, and our guide was brilliant with first timers.", created_at: "2025-04-20T06:42:00Z", user_id: "" },
    ],
  "kareri-lake": [
      { id: "sr-kareri-1", username: "priya_d", avatar_id: 2, rating: 5, body: "My first proper mountain trek. Didn't expect the Dhauladhar to tower over the lake like that, so close to Dharamshala.", created_at: "2025-10-05T08:15:00Z", user_id: "" },
      { id: "sr-kareri-2", username: "rahul_mc", rating: 4, body: "Classic Dharamshala trek. The last bit to the lake over boulders is fun. Good start if you've never been above 3,000m.", created_at: "2025-06-10T09:30:00Z", user_id: "" },
      { id: "sr-kareri-3", username: "nikhil_b", rating: 3, body: "Pretty lake but please go on a weekday. Long weekend meant the shore was packed with groups and there was litter near the camps. Views are still good. Carry your trash back down.", created_at: "2025-05-18T11:05:00Z", user_id: "" },
    ],
  "khopra-danda": [
      { id: "sr-khopra-1", username: "lalit_n", avatar_id: 3, rating: 5, body: "Sunrise on Khopra Ridge, Dhaulagiri and Annapurna South both clear, and I was the only one up there.", created_at: "2025-10-25T13:20:00Z", user_id: "" },
      { id: "sr-khopra-2", username: "smita", rating: 4, body: "Good alternative to the busy ABC route. For photos the ridge camp might even beat ABC. Quiet trail.", created_at: "2025-04-22T15:48:00Z", user_id: "" },
      { id: "sr-khopra-3", username: "jyoti_m", rating: 4, body: "Community lodges were simple but warm, and the dal bhat refills never stopped. Climb to the ridge is steady, not hard. Clouds came in by 10am so be up there for sunrise.", created_at: "2025-11-08T17:12:00Z", user_id: "" },
    ],
  "lobuche-peak": [
      { id: "sr-lobuche-1", username: "arun_karki", avatar_id: 10, rating: 5, body: "Lobuche East summit with Everest right in front of you. The fixed rope sections were fine with our guide coaching us through.", created_at: "2025-05-12T19:36:00Z", user_id: "" },
      { id: "sr-lobuche-2", username: "rekha_s", rating: 4, body: "Hardest thing I've ever done. Pre dawn summit push in the cold with crampons and an ice axe is intense. Summit made it worth it.", created_at: "2025-10-15T21:03:00Z", user_id: "" },
      { id: "sr-lobuche-3", username: "karan_alpine", rating: 4, body: "Did this after EBC and that acclimatisation made summit day doable. The final ridge on fixed rope is exposed and slow when other teams are on it. Expensive, but the guide team was excellent.", created_at: "2025-04-30T22:27:00Z", user_id: "" },
    ],
  "manaslu-circuit": [
      { id: "sr-manaslu-1", username: "sunil_t", rating: 5, body: "Best long trek in Nepal right now. Larke Pass in the morning with Manaslu and Himlung right above. Prefer it to the Annapurna Circuit these days.", created_at: "2025-10-22T06:42:00Z", user_id: "" },
      { id: "sr-manaslu-2", username: "kavya_n", avatar_id: 8, rating: 5, body: "Remote villages, big passes, the 8,000m face right there. Barely saw other trekkers for 5 days.", created_at: "2025-04-28T08:15:00Z", user_id: "" },
      { id: "sr-manaslu-3", username: "vinod_p", rating: 3, body: "Trail and passes are world class, no complaints there. Jeep ride in was rough with landslide sections that added a day, and you need a licensed guide plus a restricted area permit. Teahouse food got repetitive after Samagaon.", created_at: "2025-10-06T09:30:00Z", user_id: "" },
    ],
  "mera-peak": [
      { id: "sr-mera-1", username: "arjun_thapa", avatar_id: 9, rating: 5, body: "Five 8,000m peaks from the summit. I've trekked a lot in the Himalaya and this panorama tops everything. Glacier approach is tiring but not technical.", created_at: "2025-05-08T11:05:00Z", user_id: "" },
      { id: "sr-mera-2", username: "sunita_e", rating: 5, body: "Best day of my life, summit at dawn with Everest right there. Our Sherpa guide was exceptional. Altitude is the real challenge, listen to your guide.", created_at: "2025-10-18T13:20:00Z", user_id: "" },
      { id: "sr-mera-3", username: "neha_summits", rating: 4, body: "Good first trekking peak if you're fit and patient with altitude. Glacier walk to high camp is long rather than technical. Had a rough night at high camp with a headache, take the acclimatisation days seriously.", created_at: "2025-10-28T15:48:00Z", user_id: "" },
    ],
  "panch-kedar": [
      { id: "sr-panchk-1", username: "govind_r", rating: 5, body: "Tungnath at dawn with Kedarnath peak behind the temple. Most moving place I've stood in. The whole circuit feels spiritual and the scenery is fantastic.", created_at: "2025-06-08T17:12:00Z", user_id: "" },
      { id: "sr-panchk-2", username: "aditi", avatar_id: 4, rating: 5, body: "12 days, well spent. Rudranath is the most remote and dramatic of the five temples, steep approach but worth it.", created_at: "2025-09-25T19:36:00Z", user_id: "" },
      { id: "sr-panchk-3", username: "shalini_v", rating: 4, body: "Madhyamaheshwar was my favourite, quiet and green, and the Chaukhamba view from Budha Madhyamaheshwar is unreal. Kedarnath itself was very crowded. Plan rest days, the climbs between temples add up.", created_at: "2025-10-04T21:03:00Z", user_id: "" },
    ],
  "pangarchulla-peak": [
      { id: "sr-panga-1", username: "harsh_a", avatar_id: 3, rating: 5, body: "Late March with 2 ft of snow. Crampons on at 3am and we hit the top just as Nanda Devi went pink.", created_at: "2026-03-28T22:27:00Z", user_id: "" },
      { id: "sr-panga-2", username: "simran", rating: 4, body: "April is a good window: enough snow to make it exciting, not too technical. The 360 view from the top is great. Early start is worth it.", created_at: "2025-04-10T06:42:00Z", user_id: "" },
      { id: "sr-panga-3", username: "abhinav_s", rating: 4, body: "Summit day is long. We left at 2:30am and got back to camp after 4pm. The boulder section near the top is slow in snow. Our leader turned two people around for being too slow, which was the right call.", created_at: "2026-03-15T08:15:00Z", user_id: "" },
    ],
  "panwali-kantha": [
      { id: "sr-panwali-1", username: "madhuri_g", avatar_id: 6, rating: 5, body: "Panwali Kantha in June: wildflowers everywhere, Kedarnath Dome perfectly clear, and literally no other trekkers.", created_at: "2025-06-22T09:30:00Z", user_id: "" },
      { id: "sr-panwali-2", username: "rohit_gh", rating: 4, body: "Wide open ridge, good camping, nice views of the Gangotri peaks. Less dramatic than Kedartal or Rupin but more peaceful. October colours on the meadow are stunning.", created_at: "2025-10-08T11:05:00Z", user_id: "" },
      { id: "sr-panwali-3", username: "sneha_bisht", rating: 5, body: "September after the rains: green meadows, clear mornings and almost nobody else on the ridge. We camped with shepherds' flocks below us.", created_at: "2025-09-20T13:20:00Z", user_id: "" },
    ],
  "phulara-ridge": [
      { id: "sr-phulara-1", username: "kiran_t", rating: 5, body: "Two days walking on an open ridge with Swargarohini in front of you the whole time. 20+ treks done and this is one of the most satisfying.", created_at: "2025-05-20T15:48:00Z", user_id: "" },
      { id: "sr-phulara-2", username: "ankit_s", avatar_id: 5, rating: 4, body: "underrated. constant mountain views for not much commitment. november colours in the forest below the ridge were beautiful", created_at: "2025-11-05T17:12:00Z", user_id: "" },
      { id: "sr-phulara-3", username: "varun_d", rating: 4, body: "The ridge walk is the highlight, a couple of hours with drops on both sides and Swargarohini ahead. Pushtara meadows were full of grazing horses. It's short, so add Har Ki Dun if you have spare days.", created_at: "2025-06-02T19:36:00Z", user_id: "" },
    ],
  "pin-bhaba-pass": [
      { id: "sr-pinbhaba-1", username: "rahul_s", avatar_id: 2, rating: 5, body: "Four days of green Bhaba Valley, then the pass, then the bare brown of Spiti. The change is a shock. One of India's best pass crossings.", created_at: "2025-08-18T21:03:00Z", user_id: "" },
      { id: "sr-pinbhaba-2", username: "nisha_k", rating: 4, body: "Underrated. Coming down the scree into Spiti is dramatic and the difference between the two sides is unlike anything I've seen.", created_at: "2025-07-25T22:27:00Z", user_id: "" },
      { id: "sr-pinbhaba-3", username: "tanya_r", rating: 4, body: "Kinnaur side green and full of streams, Spiti side bare and gold. Scree descent is hard on the knees, poles help. Drive out from Mudh to Kaza is long, don't book a flight the same day.", created_at: "2025-09-06T06:42:00Z", user_id: "" },
    ],
  "pindari-glacier": [
      { id: "sr-pindari-1", username: "anupam_k", avatar_id: 7, rating: 5, body: "Zero Point with Nanda Devi and Nanda Kot right above. Makes you feel small. The walk in through big oaks and rhododendrons is lovely too.", created_at: "2025-06-05T08:15:00Z", user_id: "" },
      { id: "sr-pindari-2", username: "leela_c", rating: 4, body: "Classic Kumaon trek. The glacier snout is smaller than I expected (it's retreating) but the ring of peaks around it is magnificent.", created_at: "2025-09-30T09:30:00Z", user_id: "" },
      { id: "sr-pindari-3", username: "harish_joshi", rating: 4, body: "KMVN rest houses made it easy for my parents to join us for the first stages. Khati is a lovely village. Road from Kathgodam is long and winding, carry motion sickness tablets.", created_at: "2025-05-26T11:05:00Z", user_id: "" },
    ],
  "ranthan-kharak": [
      { id: "sr-ranthan-1", username: "deepti_k", rating: 5, body: "Nanda Devi and Trishul from the meadow with no other trekkers in sight. Go before everyone finds out about it.", created_at: "2025-05-30T13:20:00Z", user_id: "" },
      { id: "sr-ranthan-2", username: "sanjay_m", avatar_id: 1, rating: 4, body: "The forest approach is long but the meadow at the end is huge. Panchachuli at dawn from there is magnificent.", created_at: "2025-10-05T15:48:00Z", user_id: "" },
      { id: "sr-ranthan-3", username: "mukesh_dhami", rating: 5, body: "Met one other group in six days. Villages on the way still feel untouched, and our cook was from the valley and knew every story. Sunrise on the meadow with the whole range lit up was my best camp ever.", created_at: "2025-09-24T17:12:00Z", user_id: "" },
    ],
  "roopkund": [
      { id: "sr-roopkund-1", username: "arvind_r", avatar_id: 10, rating: 5, body: "Skeletons visible in the clear water with Trishul right above. Creepy and spectacular at once.", created_at: "2025-09-28T19:36:00Z", user_id: "" },
      { id: "sr-roopkund-2", username: "meghna_t", rating: 4, body: "Even if you don't care about the lake, going via Ali Bedni Bugyal is worth it for the meadows alone.", created_at: "2025-06-12T21:03:00Z", user_id: "" },
      { id: "sr-roopkund-3", username: "shreya_n", rating: 3, body: "Ali and Bedni Bugyal meadows were the best part. Early June meant crowded campsites with several big groups on the same spots, and toilets were a problem. Go in late September if you can.", created_at: "2025-06-01T22:27:00Z", user_id: "" },
    ],
  "sar-pass": [
      { id: "sr-sarpass-1", username: "priyanka_k", avatar_id: 4, rating: 5, body: "Sliding down the snow on the far side of the pass was the most fun I've had on a trek. Parvati Valley below us the whole way. Great first pass.", created_at: "2025-06-08T06:42:00Z", user_id: "" },
      { id: "sr-sarpass-2", username: "gaurav_p", rating: 4, body: "Good intro to pass trekking from Kasol. Views from the pass are solid and the trail is well managed. The snow slide is the highlight, early June is the time for it.", created_at: "2025-05-25T08:15:00Z", user_id: "" },
      { id: "sr-sarpass-3", username: "sahil", rating: 3, body: "Fun trek and the snow slide is great, but our batch was close to 40 people and it felt more like a school trip. Kasol is a nice base. Pick a smaller operator if you want quiet.", created_at: "2025-05-30T09:30:00Z", user_id: "" },
    ],
  "satopanth-lake": [
      { id: "sr-satopanth-1", username: "vivek_b", rating: 5, body: "Most sacred feeling place I've been to in the mountains. Triangle shaped lake with Chaukhamba reflected in it. Hard approach though.", created_at: "2025-06-15T11:05:00Z", user_id: "" },
      { id: "sr-satopanth-2", username: "indira_g", avatar_id: 6, rating: 4, body: "Demanding but so rewarding. The gorge above Badrinath is spectacular and the lake's shape at 4,600m has to be seen to be believed.", created_at: "2025-10-08T13:20:00Z", user_id: "" },
      { id: "sr-satopanth-3", username: "yogesh_n", rating: 4, body: "Moraine walk after Chakratirtha is slow and tiring, pace yourself. Permits take time so let your operator start early. Lake with Chaukhamba behind it is worth all of it.", created_at: "2025-06-08T15:48:00Z", user_id: "" },
    ],
  "surya-top": [
      { id: "sr-surya-1", username: "tanvi_c", avatar_id: 8, rating: 5, body: "Sunrise from Surya Top with Bandarpunch, Srikanth and the Gangotri peaks all clear. Can't believe this trek isn't more famous.", created_at: "2025-05-22T17:12:00Z", user_id: "" },
      { id: "sr-surya-2", username: "rajiv_n", rating: 4, body: "Quiet and rewarding. Summit plateau has one of the best views in Uttarakhand. Seven days is a commitment but October clarity makes it worth it.", created_at: "2025-11-02T19:36:00Z", user_id: "" },
      { id: "sr-surya-3", username: "rashmi_k", rating: 5, body: "October skies were spotless. Small group of six, nobody else on the summit, and our guide named every peak from Bandarpunch round to Draupadi ka Danda.", created_at: "2025-10-18T21:03:00Z", user_id: "" },
    ],
  "rishikesh-river-rafting": [
      { id: "sr-raft-1", username: "ankita_s", avatar_id: 3, rating: 5, body: "Did the Shivpuri run with college friends, none of us had rafted before. Roller Coaster soaked everyone in the first ten seconds. The guide let us jump in on a calm stretch, best part of the day.", created_at: "2025-04-12T10:20:00Z", user_id: "" },
      { id: "sr-raft-2", username: "vikram_paddles", rating: 5, body: "Went from Kaudiyala in October, a proper full day on the river. The Wall is a real Grade IV, our raft nearly flipped. Bring a wetsuit top, the water was freezing in the morning.", created_at: "2025-10-18T16:45:00Z", user_id: "" },
      { id: "sr-raft-3", username: "meera", rating: 4, body: "Great first experience for my 15 year old and me. Three hours felt short. Book with a licensed operator and check there's a safety kayak, ours had one and it was reassuring.", created_at: "2025-05-03T13:10:00Z", user_id: "" },
    ],
};
