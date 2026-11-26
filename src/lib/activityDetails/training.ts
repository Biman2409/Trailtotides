// Where to learn and train for each adventure, in India first. Rendered on every activity page as
// "Where to learn and train". Names only places and bodies that are long established; anything
// that changes year to year (dates, fees, which school runs what) points people to check.
import type { Block } from "@/lib/adventurepedia";

const CHECK = "Course dates, fees, age limits and medical requirements change. Check each institute's or school's own website before you plan around it.";

export const TRAINING: Record<string, Block[]> = {
  trekking: [
    { list: [
      "**At home:** stairs, hill walks and long walks with a loaded pack are the best trek training there is. Follow the [8-week plan](/adventurepedia/getting-fit#plan).",
      "**Weekend hikes near your city:** the Sahyadri forts around Mumbai and Pune, the hills around Bengaluru, the Aravallis near Delhi, and the Nilgiris. Local trekking clubs run them most weekends outside the monsoon.",
      "**Adventure courses at the national mountaineering institutes:** the Nehru Institute of Mountaineering (Uttarkashi), the Himalayan Mountaineering Institute (Darjeeling), the Manali institute (ABVIMAS) and the Jawahar Institute (Pahalgam) run short beginner courses in camping, navigation and mountain safety.",
      "**Wilderness first aid:** a weekend course is worth doing before you lead friends anywhere remote.",
    ] },
    { p: CHECK },
  ],
  mountaineering: [
    { list: [
      "**The national institutes** in the table above run the Basic and Advanced Mountaineering Courses, plus Search and Rescue and Method of Instruction courses for those who go on.",
      "**More institutes:** the National Institute of Mountaineering and Allied Sports (NIMAS) in Dirang, Arunachal Pradesh, and the Sonam Gyatso Mountaineering Institute in Gangtok, Sikkim.",
      "**Climbing walls:** the Indian Mountaineering Foundation's wall in New Delhi, and indoor walls in most big cities, build the rope skills and strength a course assumes.",
      "**Fitness:** months of stair and hill training with a heavy pack before a course or peak.",
    ] },
    { p: CHECK },
  ],
  "rock-climbing": [
    { list: [
      "**Indoor walls and bouldering gyms** in Bengaluru, Mumbai, Pune, Delhi, Hyderabad and Chennai, where most climbers in India start. Many run beginner and belay courses.",
      "**The Indian Mountaineering Foundation's wall** in New Delhi, one of the country's oldest.",
      "**Outdoor intro days** with guides at Hampi, Badami and the crags around Bengaluru and Pune.",
      "**The mountaineering institutes' courses** include rock craft: knots, belaying, climbing and abseiling.",
    ] },
    { p: CHECK },
  ],
  scrambling: [
    { list: [
      "**Rock-climbing basics** at an indoor wall or a beginner course teach the footwork and confidence scrambling needs.",
      "**Sahyadri trekking clubs** run graded fort and pinnacle trips around Mumbai and Pune, with ropes on the hard steps.",
      "**A mountaineering course** teaches rope work for exposed ground in the Himalaya.",
    ] },
  ],
  caving: [
    { list: [
      "**Meghalaya:** the Meghalaya Adventurers' Association in Shillong has led cave exploration in the state for decades, often with international caving teams. Local guides around Sohra (Cherrapunji) and the Jaintia Hills take beginners into easier caves.",
      "**Show caves** like Belum and Borra are the gentle way in.",
      "**Abroad:** formal caving courses (rope techniques for vertical caves) are rare in India; serious cavers often learn with clubs overseas.",
    ] },
  ],
  motorcycling: [
    { list: [
      "**Off-road and adventure riding schools** run weekend training near Bengaluru, Pune, Delhi and in the hills: slow control, standing up, gravel and water crossings.",
      "**Some motorcycle makers** run their own rider-training days and guided rides; ask your dealer.",
      "**Long rides at home** on consecutive days, with luggage, before any Himalayan trip.",
      "**First aid** for riders is worth a weekend: crashes often happen far from help.",
    ] },
  ],
  cycling: [
    { list: [
      "**Cycling clubs** in most cities run weekend group rides, from easy loops to long hill days.",
      "**Brevets (BRMs):** Audax India Randonneurs runs timed long-distance rides of 200 km and up across the country, the best way to build endurance for long tours.",
      "**Mountain-bike trails and coaching** around Bengaluru, Pune, Shimla and Manali.",
      "**Bike maintenance workshops** at good bike shops: learn to fix a puncture and adjust brakes before you tour.",
    ] },
  ],
  "jeep-safari": [
    { list: [
      "**No training needed.** What makes a better safari is knowing what to look for.",
      "**Go with a naturalist,** and join birding and nature walks run by local nature clubs and wildlife groups in your city.",
      "**Read up on the park** before you go: the animals, the zones and the rules.",
    ] },
  ],
  "urban-adventure": [
    { list: [
      "**Climbing walls and bouldering gyms** in most big cities.",
      "**Cycling clubs and night rides** for road skills and fitness.",
      "**Heritage and nature walk groups** that run regular walks with local guides.",
      "**Swimming pools,** for any water adventure you're planning next.",
    ] },
  ],
  "river-rafting": [
    { list: [
      "**Learn to swim** in a pool before white water. It isn't always required, but it makes everything calmer.",
      "**Start on an easy stretch** with an established Rishikesh, Kolad or Dandeli outfitter.",
      "**Going further:** Rishikesh outfitters run river-guide and swiftwater-rescue training for people who want to raft seriously. Ask the established camps.",
    ] },
  ],
  kayaking: [
    { list: [
      "**Rishikesh kayak schools** run multi-day beginner courses in the season: flat-water skills, the wet exit and the roll, then easy rapids.",
      "**Pools:** some city clubs teach the roll in a swimming pool, the easiest place to learn it.",
      "**Sea and flat-water kayaking** with operators in Goa, Karnataka's coast, Kerala's backwaters and the Andamans.",
      "**Kerala's Malabar River Festival** draws paddlers in the monsoon, and is a good place to meet the white-water scene.",
    ] },
  ],
  diving: [
    { list: [
      "**The Andamans:** Swaraj Dweep (Havelock) is India's busiest place to learn, with many PADI and SSI centres running Open Water courses most of the season.",
      "**Netrani, Karnataka:** courses from centres in Murudeshwar and nearby.",
      "**Goa and Puducherry:** dive centres run courses, often with pool sessions first.",
      "**City pool training:** some dive centres in Bengaluru, Mumbai, Delhi and other cities teach theory and pool skills at home, then finish the open-water dives on a trip.",
      "**Lakshadweep:** dive schools on the islands, with a permit to visit.",
    ] },
    { p: CHECK },
  ],
  surfing: [
    { list: [
      "**Surf schools** in Mulki (Karnataka), Kovalam and Varkala (Kerala), Puducherry, Mahabalipuram (Tamil Nadu), Goa and Gokarna run beginner lessons and multi-day camps.",
      "**Swim fitness:** laps in a pool build the paddling strength surfing needs.",
      "**The Surfing Federation of India** runs national competitions, if you get hooked.",
    ] },
  ],
  snorkelling: [
    { list: [
      "**Learn to swim** in a pool first, and practise with a mask and snorkel in the shallow end.",
      "**Calm beaches** in the Andamans and Lakshadweep, where guides give lessons in shallow water.",
      "**Dive centres** often run snorkelling trips and can teach basics like clearing the snorkel.",
    ] },
  ],
  skiing: [
    { list: [
      "**Indian Institute of Skiing and Mountaineering (IISM), Gulmarg:** government-run ski courses for beginners and beyond.",
      "**Jawahar Institute of Mountaineering and Winter Sports (JIM&WS):** winter skiing courses in Kashmir.",
      "**The Manali institute (ABVIMAS):** skiing courses on the slopes near Solang.",
      "**Auli:** Uttarakhand's tourism agency (GMVN) runs ski courses in the winter season.",
      "**Private instructors** at Gulmarg and Auli for lessons by the day.",
      "**At home:** leg strength, squats and balance work for a few weeks before you go.",
    ] },
    { p: CHECK },
  ],
  snowboarding: [
    { list: [
      "**Gulmarg** has the most snowboard instructors in India, private and through local schools.",
      "**The ski institutes** in Gulmarg, Kashmir and Manali sometimes run snowboarding alongside skiing; ask before you book.",
      "**At home:** balance boards, skateboarding and leg strength help the first days go faster.",
    ] },
    { p: CHECK },
  ],
  "ice-climbing": [
    { list: [
      "**A Basic Mountaineering Course** at a national institute teaches snow and ice craft: crampons, the ice axe and rope work.",
      "**Winter camps and courses** in Spiti and Ladakh introduce frozen-waterfall climbing on top-rope.",
      "**Climbing walls and dry-tooling:** indoor rock climbing builds the strength; some walls allow dry-tooling (climbing with axes) practice.",
    ] },
    { p: CHECK },
  ],
  "ice-skating": [
    { list: [
      "**Shimla's ice skating club** runs the open-air rink in winter, with sessions and coaching for beginners.",
      "**Leh:** ice hockey and skating camps run on frozen ponds in January and February; anyone can watch, and beginners can often join.",
      "**Indoor rinks** in a few big cities, for learning any time of year before you skate outdoors.",
    ] },
  ],
  paragliding: [
    { list: [
      "**Bir Billing, Himachal Pradesh:** many schools run beginner (P1 and P2) courses in the flying seasons.",
      "**Kamshet, Maharashtra:** near Pune, with several long-running schools and gentle training slopes, October to May.",
      "**Choose a school** that teaches ground handling, theory and weather, and uses radios and certified instructors.",
    ] },
    { p: CHECK },
  ],
  skydiving: [
    { list: [
      "**In India:** a few operators run tandem jumps and, at times, beginner courses, mostly as scheduled camps at airfields such as Dhana in Madhya Pradesh.",
      "**Abroad:** most Indian skydivers learn on an Accelerated Freefall (AFF) course at a drop zone overseas, where they can jump daily and log jumps quickly.",
      "**Wind tunnels** let you practise freefall body position, and help before or during a course.",
    ] },
    { p: CHECK },
  ],
  "hot-air-balloon": [
    { list: [
      "**As a passenger, no training is needed.** You get a safety briefing before take-off.",
      "**To fly a balloon,** you need a pilot licence from India's aviation regulator, the DGCA. Most Indian balloon pilots train abroad, then convert their licence.",
    ] },
  ],
  "hang-gliding": [
    { list: [
      "**Start with paragliding** at Bir Billing or Kamshet: it teaches the same air sense and weather reading.",
      "**Abroad:** most hang-glider pilots learn at schools overseas, where training hills and tandem flights are common.",
      "**Clubs in India:** if you find a local club, ask about the instructor's qualifications before your first tandem.",
    ] },
  ],
};
