// Stops and day plans for scripts/build-trail.mjs, one entry per trek.
// stops   overnight places and high points in walking order. A string is searched in
//         OpenStreetMap; { name, at: [lat, lng] } carries coordinates read off OpenStreetMap
//         (a place, a campsite, or the end of a named trail segment) for when the search can't
//         find it by name. q overrides the search text. A loop lists its start again at the end.
//         optional: true takes the stop only if the trek's OSM place list has it (by name or q),
//         and leaves it out otherwise, with it the days' visits to it.
//         ele: the stop's height in metres, over OpenStreetMap's, where OSM's tag is wrong
//         exact: true uses at as it is, without looking for a mapped place near it: for a pass or
//         summit placed from GPS tracks where OSM's point is off; ele then gives its published
//         height where the elevation model reads it lower. track: "<file>" follows the recorded
//         GPS track scripts/tracks/<file>.json on the leg into the stop.
// camps   camps between two stops: { name: [stopA, stopB, share, aka?, at?] }. at places a camp
//         OSM doesn't have from GPS tracks or trekkers' waypoints. Otherwise looked up in
//         OpenStreetMap by name and by the other names in aka, near where they should be; one it
//         doesn't have is put that share of the way along the trail from stop A to stop B, and
//         days that reach it are marked approximate.
// through points [lat, lng] the line is routed through, not stops: where OpenStreetMap has more
//         than one way between two stops and the router takes the wrong one
// near    added to place searches to pick the right one of several places with the same name
// side    out-and-back high points off the line, as points; extra: places only the days visit
// days    { to, via?, side?: "<side trip>", note } walks from last night's stop; side goes out and
//         back to a place in the side list first, routed and drawn (a summit, a lake off the line);
//         { rest, side? } stays put, optionally with a side trip. Only the days on foot: drives in
//         and out aren't listed.
// Treks with too little of their route on OpenStreetMap to place honestly aren't listed:
// (checked 2026-11-25; routes from operators' itineraries, then looked for on OSM by name, in
// Nominatim and in uploaded GPS traces). Treks that needed more (bagini-glacier, phulara-ridge,
// surya-top, ranthan-kharak, gulabi-kantha, doodhpathri) follow reference GPS tracks instead
// (research/gpx-sources.md). Still waiting for one:
//   bajre-dara      Melli Aching, Goru Jurey, Bhanjyang, the ridge, Lamathang, Khecheopalri: only the lake
//                   is mapped, and no GPS track of the route was found
//   panch-kedar     five separate temple walks joined by road drives: not one trail line

const LOHAJUNG = { name: "Lohajung", at: [30.1283, 79.6190] };
const SANKRI = { name: "Sankri", at: [31.07802, 78.18411] };
const GANGOTRI = { name: "Gangotri", at: [30.99437, 78.93987], ele: 3100 }; // OSM tags it 3,300 m
const DHAK = { name: "Dhak", at: [30.49886, 79.61134] };
// The cave temple on the valley floor where a Wikiloc track from Urgam ends (Kalpeshwar temple,
// 2018). OSM's Kalpeshwar Mandir is 500 m east, 130 m up the slope above the river
const KALPESHWAR = { name: "Kalpeshwar", at: [30.54961, 79.44892], exact: true };
const KHULLARA ={ name: "Khullara", at: [30.45968, 79.58748] };

// Rest-day acclimatisation hikes the itineraries describe, as side trips so the map, the GPX and
// the fly-through draw them. Points from OpenStreetMap (names as OSM has them, heights from OSM)
const NAMCHE_VIEW = { name: "Everest viewpoint above Namche", at: [27.81162, 86.71825], exact: true, ele: 3885 };
// OSM's Nangkartshang node is the 5,073 m shoulder people climb to from Dingboche, not the summit
const NANGKARTSHANG = { name: "Nangkartshang viewpoint", at: [27.90548, 86.83548], exact: true, ele: 5073 };

export const TREKS = {
  "everest-base-camp": {
    near: "Solukhumbu, Nepal",
    stops: ["Lukla", "Phakding", "Namche Bazaar", "Tengboche", "Dingboche", "Lobuche", "Gorak Shep", "Everest Base Camp"],
    side: ["Kala Patthar", NAMCHE_VIEW, NANGKARTSHANG],
    extra: ["Pheriche"],
    days: [
      { to: "Phakding", note: "Fly into Lukla in the morning and walk down the Dudh Kosi valley" },
      { to: "Namche Bazaar", note: "The big climb of the trek: the Namche hill, with a first view of Everest" },
      { rest: "Acclimatisation day: up to the Everest viewpoint above Syangboche, then back to sleep low in Namche", side: NAMCHE_VIEW.name },
      { to: "Tengboche", note: "Across the valley side to the monastery, facing Ama Dablam" },
      { to: "Dingboche", note: "Through Pangboche into the Imja valley" },
      { rest: "Acclimatisation day: up the ridge above Dingboche to the Nangkartshang viewpoint and back", side: NANGKARTSHANG.name },
      { to: "Lobuche", note: "Past the climbers' memorials at Thukla" },
      { to: "Gorak Shep", via: ["Everest Base Camp"], note: "On to Gorak Shep, then out to Base Camp and back" },
      { to: "Pheriche", side: "Kala Patthar", note: "Kala Patthar before sunrise for the Everest view, then down" },
      { to: "Namche Bazaar", note: "A long descent back through Pangboche and Tengboche" },
      { to: "Lukla", note: "Back to the airstrip. Flights out are early the next morning: keep a spare day, as weather cancels them" },
    ],
  },

  "gokyo-lakes": {
    near: "Solukhumbu, Nepal",
    stops: ["Lukla", "Phakding", "Namche Bazaar", "Dole", { name: "Machhermo", q: "Macchermo", at: [27.90288, 86.7156] }, "Gokyo"],
    side: ["Gokyo Ri", NAMCHE_VIEW],
    days: [
      { to: "Phakding", note: "Fly into Lukla in the morning and walk down the Dudh Kosi valley" },
      { to: "Namche Bazaar", note: "The big climb of the trek: the Namche hill, with a first view of Everest" },
      { rest: "Acclimatisation day: up to the Everest viewpoint above Syangboche, then back to sleep low in Namche", side: NAMCHE_VIEW.name },
      { to: "Dole", note: "Off the Everest trail, up the Gokyo valley past Mong La" },
      { to: "Machhermo", note: "A short day, to keep the height gain slow" },
      { to: "Gokyo", note: "Beside the Ngozumpa glacier past the first lakes to Gokyo, on the third" },
      { to: "Gokyo", side: "Gokyo Ri", note: "Gokyo Ri at dawn for Everest, Lhotse, Makalu and Cho Oyu, and back down" },
      { to: "Dole", note: "Down the valley" },
      { to: "Namche Bazaar", note: "Back to Namche" },
      { to: "Lukla", note: "Back to the airstrip. Flights out are early the next morning: keep a spare day, as weather cancels them" },
    ],
  },

  "annapurna-base-camp": {
    near: "Kaski, Nepal",
    stops: ["Nayapul", "Ulleri", "Ghorepani", { name: "Poon Hill", q: "Pun Danda", at: [28.40004, 83.68954] }, "Tadapani", { name: "Chhomrong", at: [28.42426, 83.81853] }, { name: "Bamboo", at: [28.45702, 83.85693] }, { name: "Deurali", at: [28.49756, 83.89833] }, { name: "Machapuchare Base Camp", q: "Machhapuchhare Base Camp", at: [28.52651, 83.90756] }, { name: "Annapurna Base Camp", at: [28.53076, 83.87785] }, "Jhinu Danda"],
    // Down Chhomrong's main path to Jhinu, not round by the trails west of the village. OSM's
    // path stops ~450 m above Jhinu's own paths, so that gap is drawn along the terrain
    through: [[28.4148, 83.8189], [28.4121, 83.8196], [28.4082, 83.8190]],
    days: [
      { to: "Ulleri", note: "Along the Bhurungdi river, then over 3,000 stone steps up to Ulleri" },
      { to: "Ghorepani", note: "Through rhododendron forest to the village under Poon Hill" },
      { to: "Tadapani", via: ["Poon Hill"], note: "Poon Hill at sunrise for Dhaulagiri and Annapurna, then along the ridge to Tadapani" },
      { to: "Chhomrong", note: "Down and up again to Chhomrong, the gateway to the sanctuary" },
      { to: "Bamboo", note: "Down Chhomrong's stairs, over the river and into bamboo forest" },
      { to: "Deurali", note: "Up the narrow Modi Khola gorge. Watch for avalanche warnings here in spring" },
      { to: "Annapurna Base Camp", via: ["Machapuchare Base Camp"], note: "Past Machapuchare Base Camp into the sanctuary, ringed by Annapurna's walls" },
      { to: "Bamboo", note: "Sunrise at base camp, then a long descent down the gorge" },
      { to: "Jhinu Danda", note: "Back over Chhomrong to the hot springs at Jhinu" },
    ],
  },

  "annapurna-circuit": {
    near: "Manang, Nepal",
    // Manang's acclimatisation climb: OSM's Kicho Tal (Ice Lake), 4,625 m
    side: [{ name: "Ice Lake (Kicho Tal)", at: [28.67988, 84.06126], exact: true, ele: 4625 }],
    stops: ["Dharapani", "Chame", "Upper Pisang", "Manang", "Yak Kharka", { name: "Thorong Phedi", at: [28.77678, 83.97264] }, { name: "Thorong La", at: [28.79353, 83.93876] }, { name: "Muktinath", at: [28.81692, 83.87145] }],
    days: [
      { to: "Chame", note: "After the drive up the Marsyangdi, walk through pine forest to Chame" },
      { to: "Upper Pisang", note: "Past the great curved rock face of Paungda Danda to Pisang" },
      { to: "Manang", note: "Up the dry upper valley, Annapurna II and III across it" },
      { rest: "Acclimatisation day in Manang: the long climb to Ice Lake (Kicho Tal) and back. A shorter option is Praken Gompa", side: "Ice Lake (Kicho Tal)" },
      { to: "Yak Kharka", note: "Out of the Manang valley up to the yak pastures" },
      { to: "Thorong Phedi", note: "A short day to the foot of the pass. Sleep early" },
      { to: "Muktinath", via: ["Thorong La"], note: "Start before dawn to cross Thorong La at 5,416 m, then a long, steep descent to Muktinath's temple" },
    ],
  },

  "khopra-danda": {
    near: "Myagdi, Nepal",
    stops: ["Nayapul", "Ulleri", "Ghorepani", "Swanta", "Khopra Danda"],
    // The sacred lake the day out from Khopra goes to: the trek's real high point (4,660 m as
    // published; 4,500-4,660 m are quoted)
    side: [{ name: "Khayer Lake", q: "Khayar Lake", ele: 4660 }],
    // Not on the map by name: placed on the trail where it reaches the camp's published height
    // (Upper Chistibung, 2,975 m)
    camps: { Chistibung: ["Swanta", "Khopra Danda", 0.5, [], [28.45682, 83.71329]] },
    days: [
      { to: "Ulleri", note: "Along the Bhurungdi river, then over 3,000 stone steps up to Ulleri" },
      { to: "Ghorepani", note: "Through rhododendron forest to the village under Poon Hill" },
      { to: "Swanta", note: "Off the main trail to a quiet Magar village" },
      { to: "Chistibung", note: "Up through forest to a high clearing" },
      { to: "Khopra Danda", note: "Onto the ridge facing Dhaulagiri and Annapurna South" },
      { to: "Khopra Danda", side: "Khayer Lake", note: "A long day out to the sacred Khayer Lake at 4,660 m and back" },
      { to: "Swanta", note: "Back down the way you came" },
      // Split in two: Swanta to the road in one go was 23 km with 750 m back up to Ghorepani
      { to: "Ulleri", note: "Back up to Ghorepani and down its stone steps to Ulleri" },
      { to: "Nayapul", note: "Down to the road" },
    ],
  },

  "manaslu-circuit": {
    near: "Gorkha, Nepal",
    // In the Budhi Gandaki gorge the elevation model reads the valley walls as 100-250 m steps over a
    // few hundred metres of path; a gentler cap on steps (45%) keeps the profile to the path
    maxGrade: 0.45,
    stops: ["Soti Khola", { name: "Machha Khola", q: "Machhakhola", at: [28.22931, 84.87377] }, "Jagat", "Deng", "Namrung", "Lho", { name: "Samagaun", q: "Samagau", at: [28.58467, 84.64404] }, "Samdo", { name: "Larkya La", ele: 5160, at: [28.66392, 84.52031] }, "Bimthang", { name: "Dharapani", at: [28.519, 84.35838] }],
    // Larke Phedi from OSM ("Larke Phedi (Dharmasala)", ele 4,475 m; 4,466 m on the elevation model)
    // Larkya La: 5,106 m and 5,160 m are both quoted; the trail tops out at 5,157 m on the model,
    // which reads passes low, so 5,160 m it is
    camps: { Dharmasala: ["Samdo", "Larkya La", 0.55, ["Larkya Phedi", "Dharamsala", "Dharamshala", "Larke Phedi"], [28.65892, 84.58443]] },
    days: [
      { to: "Machha Khola", note: "Up the Budhi Gandaki gorge on a path cut into its side" },
      { to: "Jagat", note: "Past the hot springs at Tatopani into the restricted area: permits are checked here" },
      { to: "Deng", note: "Through a narrow gorge into the Tibetan-Buddhist upper valley" },
      { to: "Namrung", note: "Through forest, with the first views of Manaslu" },
      { to: "Lho", note: "Past mani walls and monasteries, Manaslu straight ahead" },
      { to: "Samagaun", note: "A short day to the largest village of the upper valley" },
      { rest: "Acclimatisation day: up towards Manaslu Base Camp or Birendra Tal and back" },
      { to: "Samdo", note: "Up to the last village before Tibet" },
      { to: "Dharmasala", note: "A short climb to the stone huts below the pass" },
      { to: "Bimthang", via: ["Larkya La"], note: "Leave around 4 am to cross Larkya La at 5,160 m, then a long descent to Bimthang" },
      { to: "Dharapani", note: "Down through forest to join the Annapurna Circuit" },
    ],
  },

  "kedarkantha-trek": {
    near: "Uttarkashi, Uttarakhand",
    stops: [
      SANKRI,
      { name: "Juda Ka Talab", at: [31.05249, 78.1843] },
      { name: "Kedarkantha Base", at: [31.04507, 78.17887] },
      { name: "Kedarkantha", q: "Kedarkantha peak", at: [31.02257, 78.17188] },
      { name: "Hargaon", at: [31.05817, 78.18007] },
      SANKRI,
    ],
    days: [
      { to: "Juda Ka Talab", note: "Up through pine and oak forest to a small lake in a clearing" },
      { to: "Kedarkantha Base", note: "A short climb through oak and rhododendron to the open slopes below the peak" },
      { to: "Hargaon", via: ["Kedarkantha"], note: "The summit push starts around 3 am to top out at sunrise, then a long descent to camp" },
      { to: "Sankri", note: "Down through the forest to the road" },
    ],
  },

  "har-ki-dun": {
    near: "Uttarkashi, Uttarakhand",
    stops: [
      { name: "Taluka", at: [31.07782, 78.24579] },
      { name: "Osla", at: [31.1189, 78.34277] },
      { name: "Har Ki Dun", at: [31.15113, 78.43218], exact: true }, // where the mapped path reaches the meadow
    ],
    days: [
      { to: "Osla", note: "Drive from Sankri to Taluka, then walk up the Supin river through walnut and chestnut forest" },
      { to: "Har Ki Dun", note: "Through terraced fields above Osla, then up into the valley below Swargarohini" },
      { rest: "A day in the valley: walk towards the Jaundhar glacier or up to Maninda Tal. Not drawn on the map: no mapped path or GPS track reaches either" },
      { to: "Osla", note: "Back down the valley the way you came" },
      { to: "Taluka", note: "The last walk out along the Supin, then the drive back to Sankri" },
    ],
  },

  "bali-pass": {
    near: "Uttarkashi, Uttarakhand",
    // Below Lower Dhamni towards Janki Chatti there's no mapped path: guide points read off a Wikiloc
    // track (Janakichatti to Lower Dhamni via Jamunotri (41438326))
    gapGuides: [[[30.99836, 78.45408], [30.99774, 78.45481], [30.9968, 78.45584], [30.996, 78.45577], [30.99524, 78.45584], [30.9944, 78.45592], [30.99378, 78.45628]]],
    stops: [
      { name: "Taluka", at: [31.07782, 78.24579] },
      { name: "Seema", at: [31.11703, 78.34994] },
      { name: "Rainbasera", at: [31.11588, 78.40142] },
      { name: "Ruinsara Tal", at: [31.08119, 78.45786] },
      { name: "Odari", at: [31.06098, 78.46323] },
      { name: "Bali Pass", at: [31.03299, 78.43803], ele: 4940 }, // OSM 4,800 m (marked fixme); operators 4,900–4,950
      { name: "Janki Chatti", at: [30.97645, 78.43834] },
    ],
    // Not on the map by name: placed on the trail where it reaches the camp's published height
    // (3,400-3,415 m), beside a trekker's waypoint there (ultrajourneys.org)
    camps: { "Lower Damini": ["Bali Pass", "Janki Chatti", 0.4, ["Damini", "Lower Dhamni", "Dhamni", "Damni"], [30.99999, 78.45372]] },
    days: [
      { to: "Seema", note: "Drive from Sankri to Taluka, then up the Supin river to Seema" },
      { to: "Rainbasera", note: "Into the Ruinsara valley through forest and meadows" },
      { to: "Ruinsara Tal", note: "A short day to the lake below Swargarohini and Bandarpoonch" },
      { to: "Odari", note: "Up the valley over boulders and moraine to a rock-shelter camp" },
      { to: "Lower Damini", via: ["Bali Pass"], note: "The pass day: an early, steep climb to 4,950 m and a steep descent on the far side. Ropes are often needed" },
      { to: "Janki Chatti", note: "Down through forest to the road below Yamunotri" },
    ],
  },

  "dayara-bugyal": {
    near: "Uttarkashi, Uttarakhand",
    // Ridge down to the camp: guide points off a Wikiloc track (Dayara bugyal (May) (24988036))
    gapGuides: [[[30.83479, 78.54412], [30.8354, 78.54435], [30.83589, 78.545], [30.83633, 78.54562], [30.83658, 78.54628], [30.83645, 78.54711], [30.83589, 78.54767], [30.8354, 78.54831], [30.83488, 78.54892], [30.83436, 78.54951]]],
    stops: [
      { name: "Raithal", at: [30.81672, 78.60379] },
      { name: "Gui", at: [30.81448, 78.57426] },
      // The top of the meadow the trail crosses before dropping to the camp OSM marks as Dayara
      // Bugyal: the trek's high point, without a name of its own on the map
      { name: "Dayara Bugyal ridge", at: [30.83403, 78.54458], exact: true },
      // The camp on the meadow where three Wikiloc tracks (24988036, 170664573, 21838496) cross it,
      // 450 m north of OSM's point, which no track reaches
      { name: "Dayara Bugyal", at: [30.83415, 78.55024], exact: true },
    ],
    // The rest day's walk: OSM's Bakria (Bakaria Top), 3,804 m
    side: [{ name: "Bakaria Top", at: [30.82292, 78.54111], exact: true, ele: 3804 }],
    days: [
      { to: "Gui", note: "Up from Raithal village through oak and maple to a forest clearing" },
      { to: "Dayara Bugyal", via: ["Dayara Bugyal ridge"], note: "Out of the trees onto the rolling meadow, Bandarpoonch and Srikanth on the skyline" },
      { rest: "A day on the meadows: up to Bakaria Top for the views, and back", side: "Bakaria Top" },
      { to: "Raithal", note: "Down the way you came" },
    ],
  },

  "dodital-darwa-pass": {
    near: "Uttarkashi, Uttarakhand",
    // Stretches with no mapped path, closed from a reference GPS track on Wikiloc (Agoda to Dodital (13062978)):
    // guide points from where the line meets the track before each gap to where it meets it after
    gapGuides: [
      [[30.88739, 78.52235], [30.88704, 78.52242], [30.887, 78.52269], [30.88763, 78.52305]],
      [[30.89318, 78.5242], [30.89362, 78.52426], [30.89389, 78.52456], [30.89449, 78.52485]],
      // Up to Darwa Top along Darwa Pass via Darwa Top and Kanasar meadows to Seema (41402714)
      [[30.90874, 78.50603], [30.90856, 78.50543], [30.90849, 78.50462], [30.90831, 78.50382], [30.90848, 78.50314], [30.90859, 78.50233]],
    ],
    stops: [
      { name: "Sangam Chatti", at: [30.83588, 78.45063] },
      // Not in OSM by name: placed from ultrajourneys.org's map of the village
      { name: "Agoda", at: [30.84636, 78.48161] },
      { name: "Manjhi", at: [30.87492, 78.51945] },
      { name: "Dodital", q: "Dodi tal", at: [30.89725, 78.52606] },
      // Darwa Top, the high point of the ridge west of the lake where a Wikiloc track (41402714)
      // tops out; three tracks named Dodital to Darwa Pass stop lower, at the 3,800 m saddle north of
      // the lake that OSM calls the pass. No track goes on to the 4,129 m bump 800 m south that a
      // trekker's waypoint (ultrajourneys.org) marked. Operators give 4,150 m for the pass; the top
      // the treks reach reads 3,976 m on the elevation model and 3,966 m on the track, so its own
      // height is used
      { name: "Darwa Pass", at: [30.90859, 78.50183], exact: true },
    ],
    days: [
      { to: "Agoda", note: "Up from the road through fields to Agoda village" },
      { to: "Manjhi", note: "Into thick oak and rhododendron forest" },
      { to: "Dodital", note: "A short walk to the lake, said to be Ganesha's birthplace, ringed by forest" },
      { to: "Dodital", via: ["Darwa Pass"], note: "Up to Darwa Pass for Bandarpoonch and the Yamunotri valley, and back to the lake" },
      { to: "Manjhi", note: "Down through the forest" },
      { to: "Sangam Chatti", note: "Down to the road" },
    ],
  },

  "gaumukh-tapovan": {
    near: "Uttarkashi, Uttarakhand",
    stops: [
      GANGOTRI,
      { name: "Bhojbasa", at: [30.95045, 79.05151] },
      { name: "Gaumukh", at: [30.9245, 79.0829], exact: true }, // the end of the path facing the snout; OSM's point is 110 m out on the moraine
      // The meadow where OSM and ultrajourneys.org's waypoint agree; its published height (4,463 m).
      // The elevation model reads about 4,320 m
      // Not the 4,463 m operators quote: both mapped camps on the meadow read 4,311 m, and flat ground reads true
      { name: "Tapovan", at: [30.91443, 79.0765], exact: true },
    ],
    days: [
      { to: "Bhojbasa", note: "Along the Bhagirathi past Chirbasa's pines, the Bhagirathi peaks ahead" },
      { to: "Tapovan", via: ["Gaumukh"], note: "To Gaumukh, the snout of the Gangotri glacier, then a steep scramble up its side to Tapovan's meadow under Shivling" },
      { rest: "A day at Tapovan, under the face of Shivling" },
      { to: "Bhojbasa", note: "Back down past Gaumukh" },
      { to: "Gangotri", note: "Back along the river to the temple town" },
    ],
  },

  "valley-of-flowers": {
    near: "Chamoli, Uttarakhand",
    stops: [
      { name: "Pulna", at: [30.63576, 79.57163] },
      { name: "Ghangaria", at: [30.70145, 79.5938] },
    ],
    side: [
      // A turnaround in the valley's meadows, 4.5 km from Ghangaria along the mapped valley path
      // (published walks are 8-10 km there and back), not the entry gate 700 m from the village
      { name: "Valley of Flowers", at: [30.7268, 79.59554], exact: true },
      // The gurdwara at the lake, where two trekkers' waypoints agree (ultrajourneys.org). Its height
      // is the one published (4,329 m); the elevation model reads the lake shore lower, about 4,150 m
      { name: "Hemkund Sahib", at: [30.69909, 79.61747], exact: true, ele: 4329 },
    ],
    days: [
      { to: "Ghangaria", note: "Up the Lakshman Ganga on a paved mule path, busy with pilgrims, to the only village up here" },
      { to: "Ghangaria", side: "Valley of Flowers", note: "Into the valley itself: walk as far as you like among the flowers and back. No camping inside" },
      { to: "Ghangaria", side: "Hemkund Sahib", note: "A steep climb to the glacial lake and gurdwara at 4,300 m, and back down" },
      { to: "Pulna", note: "Back down to the road" },
    ],
  },

  "kuari-pass": {
    near: "Chamoli, Uttarakhand",
    // The pass where a recorded GPS track (ultrajourneys.org, Auli to Tali) crosses the ridge: 3,818 m
    // on the elevation model, as published (3,815 m). OSM's point is 800 m short, on the approach
    stops: [DHAK, KHULLARA, { name: "Kuari Pass", at: [30.44527, 79.57533], exact: true }],
    // Not on the map by name: placed on the trail where it reaches the camp's published height
    // (Gulling Top, about 2,900 m)
    camps: { Gulling: ["Dhak", "Khullara", 0.5, ["Guling", "Gulling Top"], [30.46828, 79.6011]] },
    days: [
      { to: "Gulling", note: "Drive from Joshimath to Dhak, then up past Tugasi village to a forest camp" },
      { to: "Khullara", note: "Through oak and rhododendron to a meadow facing Dronagiri and Hathi Ghoda" },
      { to: "Khullara", via: ["Kuari Pass"], note: "Up to the pass for the long row of peaks Lord Curzon came for, and back to camp" },
      { to: "Dhak", note: "Down the way you came to the road" },
    ],
  },

  "pangarchulla-peak": {
    near: "Chamoli, Uttarakhand",
    stops: [DHAK, KHULLARA, { name: "Pangarchulla", at: [30.42367, 79.59214], ele: 4590 }],
    // Not on the map by name: placed on the trail where it reaches the camp's published height
    // (Gulling Top, about 2,900 m)
    camps: { Gulling: ["Dhak", "Khullara", 0.5, ["Guling", "Gulling Top"], [30.46828, 79.6011]] },
    // OSM's path ends on the ridge past Kuari Pass; above it, guide points read off a Wikiloc track
    // (Chilled Pangarchulla trail), past Mini Pangarchulla to the top
    gapGuides: [
      [[30.44043, 79.58229], [30.43943, 79.58175], [30.43857, 79.58229], [30.43777, 79.5817], [30.43706, 79.58261], [30.43628, 79.58304], [30.43522, 79.58307], [30.43413, 79.58357], [30.43327, 79.58426], [30.43274, 79.58519], [30.43189, 79.58553], [30.43107, 79.58624], [30.43011, 79.58666], [30.4297, 79.58772], [30.42901, 79.58861], [30.42842, 79.58939], [30.42784, 79.59002], [30.42715, 79.59103], [30.42615, 79.59127], [30.42512, 79.59147], [30.42414, 79.59168]],
    ],
    days: [
      { to: "Gulling", note: "Drive from Joshimath to Dhak, then up past Tugasi village to a forest camp" },
      { to: "Khullara", note: "Through oak and rhododendron to a meadow facing Dronagiri and Hathi Ghoda" },
      { to: "Khullara", via: ["Pangarchulla"], note: "Summit day: start around 2 am, up snow and boulders to 4,590 m, and back the same day. Spikes or crampons needed" },
      { to: "Dhak", note: "Down the way you came to the road" },
    ],
  },

  "satopanth-lake": {
    near: "Chamoli, Uttarakhand",
    stops: [
      { name: "Mana", at: [30.77048, 79.49594] },
      // The lake where OSM and ultrajourneys.org's waypoint agree; its published height (4,600 m:
      // Wikipedia, Uttarakhand Tourism, operators). The elevation model reads about 4,340 m
      // Not the 4,600 m often quoted: the lake surface reads 4,346 m (one operator gives 4,400 m)
      { name: "Satopanth Lake", at: [30.74352, 79.357], exact: true },
    ],
    camps: { "Laxmi Van": ["Mana", "Satopanth Lake", 0.35, ["Laxmiban", "Lakshmi Van", "Laxmi Ban", "Lakshmiban"]], Chakrateertha: ["Mana", "Satopanth Lake", 0.75, ["Chakratirtha", "Chakra Tirth", "Chakrateerth", "Chakra Tirtha"]] },
    days: [
      { to: "Laxmi Van", note: "From India's last village along the Alaknanda, past the Vasudhara falls" },
      { to: "Chakrateertha", note: "Over moraine and boulders beside the Bhagirath Kharak glacier" },
      { to: "Satopanth Lake", note: "A steep climb onto the ridge and along to the triangular lake under Chaukhamba" },
      { to: "Laxmi Van", note: "Back down the valley" },
      { to: "Mana", note: "Out to Mana and Badrinath" },
    ],
  },

  "deoriatal-chandrashila": {
    near: "Rudraprayag, Uttarakhand",
    stops: [
      { name: "Sari", at: [30.51688, 79.13526] },
      { name: "Deoriatal", q: "Deoria Tal", at: [30.52211, 79.12754] },
      { name: "Chopta", at: [30.4827, 79.2067], exact: true } /* where the Tungnath path leaves the road (OSM GPS traces); "Chopta" in OSM is a roadside campsite 700 m south */,
      // The temple, placed from ultrajourneys.org's map; OSM's Tunganath is checked within 2 km
      { name: "Tungnath", q: "Tunganath", at: [30.4887, 79.21702] },
      { name: "Chandrashila", at: [30.48806, 79.22139], ele: 3690 }, // surveyed summit; the model reads 3,642 m
    ],
    // Not on the map by name: placed on the trail where it reaches the camp's published height
    // (about 2,750 m)
    camps: { "Rohini Bugyal": ["Deoriatal", "Chopta", 0.5, ["Rohini"], [30.5162, 79.20379]] },
    days: [
      { to: "Deoriatal", note: "A short, steady climb from Sari to the lake that mirrors Chaukhamba" },
      { to: "Rohini Bugyal", note: "Along a forested ridge to a quiet meadow" },
      { to: "Chopta", note: "Through forest to the meadows at Chopta" },
      { to: "Chopta", via: ["Tungnath", "Chandrashila"], note: "Up the paved path past Tungnath, the highest Shiva temple, to Chandrashila for sunrise, and back" },
    ],
  },

  "panwali-kantha": {
    near: "Tehri Garhwal, Uttarakhand",
    stops: [
      { name: "Ghuttu", at: [30.5289, 78.79015] },
      // The ridge on the meadow, before the camp OSM marks as Panwali Kantha: the trek's high
      // point, without a name of its own on the map
      { name: "Panwali Kantha ridge", at: [30.5629, 78.86516], exact: true },
      { name: "Panwali Kantha", at: [30.56968, 78.86745] },
    ],
    // Gaurmanda, the oak-forest camp every operator uses, where the trail reaches its published 2,525 m
    camps: { Gaurmanda: ["Ghuttu", "Panwali Kantha ridge", 0.5, ["Gairu", "Gaur Manda"], [30.53572, 78.83476]] },
    days: [
      { to: "Gaurmanda", note: "Up from Ghuttu through oak forest to a clearing ringed by banj oak" },
      { to: "Panwali Kantha", via: ["Panwali Kantha ridge"], note: "Onto the great meadow on the old pilgrim route to Kedarnath, the Gangotri and Kedar peaks in view" },
      { rest: "A day on the meadow, walking the ridge for the views" },
      { to: "Ghuttu", note: "Down the way you came. Some groups continue to Triyuginarayan instead" },
    ],
  },

  "pindari-glacier": {
    near: "Bageshwar, Uttarakhand",
    // Stretches with no mapped path, closed from a reference GPS track on Wikiloc (Khati to base camp (214436475)):
    // guide points from where the line meets the track before each gap to where it meets it after
    gapGuides: [
      [[30.1586, 79.97777], [30.15916, 79.9783], [30.15973, 79.9788], [30.16022, 79.97936], [30.16068, 79.97967]],
      [[30.18311, 79.99706], [30.18349, 79.99707], [30.18385, 79.9968], [30.18464, 79.99702]],
    ],
    stops: [
      { name: "Khati", at: [30.11209, 79.94006] },
      { name: "Dwali", at: [30.17736, 79.99532] },
      { name: "Phurkia", at: [30.21645, 79.99772] },
      // Zero Point from ultrajourneys.org's waypoint: 3,657 m on the elevation model, as published
      // (3,660 m). OSM's point is 800 m further up the moraine
      { name: "Zero Point", at: [30.25968, 79.99849], exact: true },
    ],
    days: [
      { to: "Dwali", note: "From Khati, the last village, along the Pindar river through dense forest" },
      { to: "Phurkia", note: "A short climb out of the forest towards the glacier" },
      { to: "Dwali", via: ["Zero Point"], note: "Out to Zero Point, the end of the trail facing the Pindari glacier and Nanda Kot, and back down" },
      { to: "Khati", note: "Back through the forest" },
    ],
  },

  roopkund: {
    near: "Chamoli, Uttarakhand",
    stops: [
      LOHAJUNG,
      { name: "Didna", at: [30.16473, 79.63419] },
      { name: "Ali Bugyal", at: [30.18229, 79.65865] },
      // The camp at Bedni Kund, the pond on the meadow (trekkers' waypoint, ultrajourneys.org)
      { name: "Bedni Bugyal", at: [30.20635, 79.66694], exact: true },
      // The lake's height as operators publish it (4,785-4,801 m) and the elevation model reads it
      // (~4,770 m), not OpenStreetMap's 5,029 m tag, which is the figure quoted for the area above
      { name: "Roopkund", q: "Rup Kund", at: [30.2621, 79.73172], ele: 4785 },
    ],
    // Both camps from trekkers' waypoints (ultrajourneys.org): the shelter at Patar Nachauni, Bhagwabasa
    camps: { "Patar Nachauni": ["Bedni Bugyal", "Roopkund", 0.35, ["Patal Nachani", "Patar Nachani", "Pathar Nachauni", "Patar Nachoni", "Pathar Nachuni"], [30.23664, 79.69218]], Bhagwabasa: ["Bedni Bugyal", "Roopkund", 0.75, ["Bhagwabas", "Bhagubasa", "Bagubasa", "Bhaguwabasa"], [30.24973, 79.71051]] },
    days: [
      { to: "Didna", note: "Down to the Neel Ganga and a steep climb through forest to Didna village" },
      { to: "Bedni Bugyal", via: ["Ali Bugyal"], note: "Out onto Ali Bugyal, one of the largest high meadows in the Himalaya, and along to Bedni" },
      { to: "Patar Nachauni", note: "A short day along the ridge, good for acclimatising" },
      { to: "Bhagwabasa", note: "Over Kalu Vinayak into rock and scree, the last camp below the lake" },
      { to: "Patar Nachauni", via: ["Roopkund"], note: "Up to the lake of skeletons at 4,800 m before dawn, then all the way back down" },
      // Out by Wan, as operators finish (10-15 km), not the 23 km back to Lohajung; the drive
      // from Wan isn't counted
      { to: "Wan", note: "Down past Bedni Bugyal and through forest to Wan village and the road" },
    ],
    extra: [{ name: "Wan", at: [30.20504, 79.61753] }],
  },

  "ali-bedni-bugyal": {
    near: "Chamoli, Uttarakhand",
    // Over Bedni Top the line follows a GPS track on Wikiloc (Ali Bedni day 3, 248099772): up from
    // the south to the top, down to the camp at Bedni Kund, and on west past Gharoli Patal towards
    // Wan. OSM's paths reach the top from the west instead (the top itself was a straight spur off
    // them) and leave the camp back south
    guide: [
      [],
      [],
      [[30.18834, 79.66685], [30.19074, 79.66573], [30.19295, 79.6671], [30.19544, 79.66841], [30.19778, 79.67001], [30.19842, 79.67193]],
      [[30.20133, 79.67329], [30.20231, 79.67287], [30.20263, 79.67172], [30.20308, 79.6708], [30.20354, 79.66986], [30.20394, 79.66884], [30.2042, 79.66794], [30.20484, 79.6673], [30.20554, 79.6664]],
      [[30.20565, 79.66496], [30.20412, 79.66216], [30.20219, 79.66024], [30.20191, 79.65785], [30.20247, 79.65556], [30.20369, 79.65425], [30.20402, 79.65304], [30.20439, 79.65249]],
    ],
    stops: [
      LOHAJUNG,
      { name: "Didna", at: [30.16473, 79.63419] },
      { name: "Ali Bugyal", at: [30.18229, 79.65865] },
      // The high point of the trek, crossed between the two meadows: 3,823 m on the elevation
      // model, as published (3,800-3,825 m)
      { name: "Bedni Top", at: [30.20007, 79.67382], exact: true },
      // The camp at Bedni Kund, the pond on the meadow (trekkers' waypoint, ultrajourneys.org)
      { name: "Bedni Bugyal", at: [30.20635, 79.66694], exact: true },
      { name: "Wan", at: [30.20504, 79.61753] },
    ],
    days: [
      { to: "Didna", note: "Down to the Neel Ganga and a steep climb through forest to Didna village" },
      { to: "Ali Bugyal", note: "Up through oak forest onto the open grass of Ali Bugyal" },
      { to: "Bedni Bugyal", via: ["Bedni Top"], note: "Along the meadow ridge and over Bedni Top, the highest point, with Trishul and Nanda Ghunti in front of you" },
      { to: "Wan", note: "Down through forest to Wan village and the road" },
    ],
  },

  brahmatal: {
    near: "Chamoli, Uttarakhand",
    stops: [
      LOHAJUNG,
      { name: "Bekaltal", q: "Bekal Tal", at: [30.14259, 79.5795] },
      { name: "Brahmatal", q: "Brahma Tal", at: [30.17779, 79.58802] },
    ],
    // The summit on the ridge north of the lake, near where a recorded GPS track (ultrajourneys.org)
    // crosses it: 3,727 m on the elevation model, as published (3,734 m)
    side: [{ name: "Brahmatal Top", at: [30.1951, 79.5877], exact: true }],
    days: [
      { to: "Bekaltal", note: "Through oak and rhododendron forest to a lake ringed by trees" },
      { to: "Brahmatal", note: "Up onto the ridge with Trishul and Nanda Ghunti, then down to the Brahmatal lake camp" },
      { to: "Brahmatal", side: "Brahmatal Top", note: "An early climb to the top for the widest view of the trek, then back to camp" },
      { to: "Lohajung", note: "Down through the forest to the road" },
    ],
  },

  "bhrigu-lake": {
    near: "Kullu, Himachal Pradesh",
    stops: [
      { name: "Gulaba", at: [32.32231, 77.20098] },
      { name: "Rola Kholi", q: "Raoli Kholi", at: [32.31551, 77.23825] },
      { name: "Bhrigu Lake", at: [32.29326, 77.2425] },
    ],
    days: [
      { to: "Rola Kholi", note: "Up from Gulaba through forest onto open meadows facing the Pir Panjal" },
      { to: "Rola Kholi", via: ["Bhrigu Lake"], note: "A steep climb to the lake at about 4,150 m, often still frozen, and back to camp" },
      { to: "Gulaba", note: "Down to the road" },
    ],
  },

  "beas-kund": {
    near: "Kullu, Himachal Pradesh",
    stops: [
      { name: "Dhundi", at: [32.35553, 77.12653] },
      { name: "Beas Kund", at: [32.36654, 77.08556] },
    ],
    // Not on the map by name: placed on the trail where it reaches the camp's published height
    // (3,270-3,300 m)
    camps: { Bakarthach: ["Dhundi", "Beas Kund", 0.5, ["Bakar Thach", "Bakkar Thach", "Bakarthatch"], [32.35047, 77.09612]] },
    days: [
      { to: "Bakarthach", note: "Up the Beas from Dhundi to a herders' meadow" },
      { to: "Bakarthach", via: ["Beas Kund"], note: "Over moraine to the glacial lake at the source of the Beas, under Hanuman Tibba, and back" },
      { to: "Dhundi", note: "Down to Dhundi and the drive to Manali" },
    ],
  },

  "chandrakhani-pass": {
    near: "Kullu, Himachal Pradesh",
    stops: [
      { name: "Rumsu", at: [32.11439, 77.17943] },
      // Over the pass on the trail as ultrajourneys.org recorded it (Rumsu to Malana)
      { name: "Malana", at: [32.0618, 77.26002], track: "chandrakhani" },
    ],
    // Chaklani, the meadow camp below the pass, from ultrajourneys.org's waypoint: 3,448 m on the
    // elevation model, as published (3,400-3,450 m). The pass where the recorded trail tops out:
    // 3,656 m, as published (3,660 m)
    // Naya Tapru, the forest camp operators use on the way up (published 3,179-3,200 m), isn't on the
    // map: placed on the recorded trail where it reaches that height. It splits the 1,400 m climb
    camps: { "Naya Tapru": ["Rumsu", "Malana", 0.2, ["Naya Thapru", "Nayatapru", "Naya Tapri"], [32.08299, 77.20076]], Chaklani: ["Rumsu", "Malana", 0.45, ["Chiklani", "Chaklani Thach", "Stalling"], [32.06749, 77.21231]], "Chandrakhani Pass": ["Rumsu", "Malana", 0.6, ["Chanderkhani Pass", "Chandrakhani", "Chanderkhani"], [32.06642, 77.23323]] },
    days: [
      { to: "Naya Tapru", note: "Up from Rumsu, above Naggar, through deodar forest to a clearing camp" },
      { to: "Chaklani", note: "A short climb out of the forest to the open meadow of Chaklani below the pass, to get used to the height" },
      { to: "Malana", via: ["Chandrakhani Pass"], note: "Over the grassy pass facing the Pir Panjal and Parvati ranges, then down to Malana, a village with its own rules: don't touch its walls or people" },
    ],
  },

  "kareri-lake": {
    near: "Kangra, Himachal Pradesh",
    stops: [
      { name: "Kareri", q: "Kareri village", at: [32.27896, 76.27862] },
      // Up the Nyund stream on the trail as ultrajourneys.org recorded it: OSM's paths take a longer
      // way round over the ridge to the east. Out of the village the track (scripts/tracks/kareri-lake.json) starts with
      // the lane two Wikiloc tracks (167737193, 13625439) and an OSM trace (3865398) all take, east
      // round the houses to the foot of the climb
      { name: "Kareri Lake", at: [32.32565, 76.27389], track: "kareri-lake" },
    ],
    // Rioti (Reoti) on that trail where it reaches the published 2,450 m
    camps: { Rioti: ["Kareri", "Kareri Lake", 0.6, ["Reoti", "Riyoti", "Rewati"], [32.30175, 76.27558]] },
    // Up the Nyund stream on OSM's Kareri–Kareri Lake Trail, not round by Raeel to the east. Its top
    // isn't joined to the paths at the lake, so the line is routed to its last point
    through: [[32.2980, 76.2744], [32.3106, 76.2686], [32.32502, 76.27329]],
    days: [
      { to: "Rioti", note: "Up the Nyund stream from Kareri village, crossing it on rocks and small bridges" },
      { to: "Kareri Lake", note: "A short climb to the lake below the Dhauladhar, with a small Shiva temple" },
      { to: "Kareri", note: "Back down the stream to the village" },
    ],
  },

  "hampta-pass": {
    near: "Kullu, Himachal Pradesh",
    stops: [
      { name: "Jobra", q: "Jobri", at: [32.2677, 77.2459] },
      // Balu ka Ghera is OSM's "Hamta la base camp", the flat sandy camp below the pass
      { name: "Balu ka Ghera", q: "Hamta la base camp", at: [32.2763, 77.3172] },
      { name: "Hampta Pass", q: "Hamta Pass", at: [32.2699, 77.3474] },
      { name: "Chhatru", at: [32.3195, 77.3653] },
    ],
    // Not on the map by name: Chika on the meadow after the first climb from Jobra, Shea Goru on
    // the Spiti side where the descent from the pass levels out
    camps: {
      Chika: ["Jobra", "Balu ka Ghera", 0.4, ["Chikka", "Chhika"]],
      "Shea Goru": ["Hampta Pass", "Chhatru", 0.45, ["Shia Goru", "Siagoru"]],
    },
    days: [
      { to: "Chika", note: "Drive from Manali to Jobra, then through maple and birch to the first meadow by the Rani nallah" },
      { to: "Balu ka Ghera", note: "Up the open valley, crossing streams, to the sandy flat below the pass" },
      { to: "Shea Goru", via: ["Hampta Pass"], note: "The long day: up to the pass at about 4,270 m, then a steep descent into the bare Spiti side" },
      { to: "Chhatru", note: "Down the valley to the road at Chhatru, for the drive to Chandratal" },
    ],
  },

  kedartal: {
    near: "Uttarkashi, Uttarakhand",
    // Stretches with no mapped path, closed from a reference GPS track on Wikiloc (gangotri-to-kedar-khadak (84498203)):
    // guide points from where the line meets the track before each gap to where it meets it after
    gapGuides: [
      [[30.96174, 78.94289], [30.96058, 78.94344], [30.95932, 78.94333], [30.95825, 78.94286], [30.95704, 78.94331], [30.95592, 78.94327], [30.95467, 78.94351], [30.95368, 78.94427], [30.95265, 78.94495], [30.95151, 78.94549], [30.95049, 78.94623], [30.94948, 78.9467], [30.94836, 78.9468], [30.94729, 78.94701], [30.94627, 78.94754], [30.94509, 78.948]],
    ],
    // Kedar Kharak and Kedartal where a Wikiloc track (Kedar Khadak to Kedartal (84498194)) starts
    // and ends: the camp on the path (OSM's campsite is 160 m off it) and the lake's north shore
    stops: [GANGOTRI, { name: "Kedar Kharak", at: [30.9368, 78.95052], exact: true }, { name: "Kedartal", at: [30.91536, 78.95745], exact: true }],
    // Bhoj Kharak isn't on the map by name: placed partway up the Kedar Ganga gorge
    camps: { "Bhoj Kharak": ["Gangotri", "Kedar Kharak", 0.55, ["Bhoj Kharak", "Bhojkharak", "Bhoj Khadak"]] },
    days: [
      { to: "Bhoj Kharak", note: "Straight up the Kedar Ganga gorge from Gangotri through pine and birch" },
      { to: "Kedar Kharak", note: "Past Spider Wall, a narrow ledge above the river, to the last meadow" },
      { to: "Kedartal", note: "Over moraine and boulders to the lake below Thalaysagar" },
      { to: "Bhoj Kharak", note: "Sunrise on Thalaysagar in the lake, then the long way down" },
      { to: "Gangotri", note: "Down the gorge to the temple town" },
    ],
  },

  "rupin-pass": {
    near: "Uttarkashi, Uttarakhand",
    stops: [
      { name: "Dhaula", at: [31.1315, 78.0766] },
      { name: "Sewa", at: [31.1738, 78.0747] },
      { name: "Buras Kandi", q: "Burans Kandi Campsite", at: [31.3057, 78.0904] },
      { name: "Dhanderas Thach", q: "Dhandreyas Thach Campsite", at: [31.322, 78.1287] },
      { name: "Upper Waterfall", q: "Upper Waterfall Campsite", at: [31.3326, 78.1448] },
      { name: "Rupin Pass", q: "Rupin Ghati", at: [31.3542, 78.1544] },
      { name: "Sangla Kanda", at: [31.39663, 78.23394], exact: true }, // on the path, as the track passes
      { name: "Sangla", at: [31.4259, 78.2637] },
    ],
    // Villages and a camp the map doesn't name: Jiskun and Jhaka up the Rupin valley, Ronti Gad below the pass
    camps: {
      // Jiskun and Ronti Gad on the path, where a Wikiloc track (Rupin Pass (135879090)) passes them;
      // OSM's points sit 100-180 m off it
      Jiskun: ["Sewa", "Buras Kandi", 0.35, ["Jiskoon"], [31.24379, 78.09847]],
      Jhaka: ["Sewa", "Buras Kandi", 0.65, ["Jakha"]],
      "Ronti Gad": ["Rupin Pass", "Sangla Kanda", 0.35, ["Ronthi Got", "Ronti Got"], [31.36299, 78.19624]],
    },
    days: [
      { to: "Sewa", note: "From the road at Dhaula along the Rupin river to Sewa and its old wooden temple" },
      { to: "Jiskun", note: "Up the valley side into Himachal, past orchards and fields" },
      { to: "Jhaka", note: "A short climb to the 'hanging village' clinging to the cliff" },
      { to: "Buras Kandi", note: "Through fir and rhododendron forest above the river" },
      { to: "Dhanderas Thach", note: "Into the open meadows below the great waterfall" },
      { to: "Upper Waterfall", note: "Steeply up beside the waterfall to a camp at its top" },
      { to: "Ronti Gad", via: ["Rupin Pass"], note: "Up the snow gully to the pass at about 4,650 m, facing Kinnaur Kailash, then down to Ronti Gad" },
      { to: "Sangla", note: "Down past the Sangla Kanda meadow to Sangla in the Baspa valley" },
    ],
  },

  "pin-bhaba-pass": {
    near: "Kinnaur, Himachal Pradesh",
    stops: [
      { name: "Kafnu", near: "Kinnaur, Himachal Pradesh" },
      { name: "Karah", q: "Karag", at: [31.7301, 77.9889] },
      { name: "Phutsirang", q: "Putling", at: [31.7624, 77.9852] },
      { name: "Pin Bhaba Pass", q: "Pin Bhaba La", at: [31.7803, 77.9968] },
      { name: "Mudh", near: "Spiti, Himachal Pradesh" },
    ],
    // Not on the map by name: Mulling in the Bhaba valley forest, Mangrup on the Spiti side below the pass
    camps: {
      Mulling: ["Kafnu", "Karah", 0.6, ["Muling"]],
      Mangrup: ["Pin Bhaba Pass", "Mudh", 0.35, ["Tiya", "Mangrup"]],
    },
    days: [
      { to: "Mulling", note: "From Kafnu up the Bhaba valley through forest and past the dam" },
      { to: "Karah", note: "Into open meadows beside the Bhaba river" },
      { to: "Phutsirang", note: "Up to the last camp below the pass" },
      { to: "Mangrup", via: ["Pin Bhaba Pass"], note: "Over the pass at about 4,900 m and down into the bare Pin valley of Spiti" },
      { to: "Mudh", note: "Along the Pin river to Mudh village and the road" },
    ],
  },

  "yulla-kanda": {
    near: "Kinnaur, Himachal Pradesh",
    stops: [{ name: "Yulla Khas", q: "Yula", at: [31.54743, 78.137] }, { name: "Yulla Kanda", at: [31.5906, 78.1408] }],
    camps: { "Yulla Kanda camp": ["Yulla Khas", "Yulla Kanda", 0.6, ["Yulla Kanda base"]] },
    days: [
      { to: "Yulla Kanda camp", note: "Up from Yulla Khas through pine and birch to the meadows" },
      { to: "Yulla Khas", via: ["Yulla Kanda"], note: "Up to the lake and its Krishna temple, then all the way down to the village" },
    ],
  },

  "rudranath-kalpeshwar": {
    near: "Chamoli, Uttarakhand",
    stops: [
      KALPESHWAR,
      { name: "Bansi Narayan", at: [30.54, 79.4096] },
      { name: "Dumak", at: [30.5072, 79.3831] },
      { name: "Rudranath", at: [30.5186, 79.3182] },
      // The trek's high point, the ridge with its stone cairns between Rudranath and Panar
      // (the Rudranath trek's Pitradhar)
      { name: "Pitradhar", at: [30.48826, 79.33259], exact: true, ele: 3757 },
      { name: "Sagar", at: [30.4398, 79.3213] },
    ],
    // Panar bugyal on the way down to Sagar, not on the map by name
    camps: { Panar: ["Pitradhar", "Sagar", 0.2, ["Panar Bugyal", "Pannar"]] },
    days: [
      { to: "Bansi Narayan", note: "From Kalpeshwar's cave temple up through oak forest to the old Vishnu temple" },
      { to: "Dumak", note: "Down to Dumak village" },
      { to: "Rudranath", note: "The long climb through forest and over open ridges to the rock shrine" },
      { to: "Panar", via: ["Pitradhar"], note: "Darshan at dawn, then over Pitradhar and down to the wide Panar meadows" },
      { to: "Sagar", note: "Through forest to Sagar village and the road" },
    ],
  },

  "bagini-glacier": {
    near: "Chamoli, Uttarakhand",
    // No mapped path up the Bagini valley. The camps, and guide points every 350 m, are read off
    // GPS tracks White Magic Guides recorded in October 2026 (research/gpx-sources.md); the line
    // between them is drawn along the terrain. The road now reaches about 3,085 m below
    // Dronagiri, so the walk starts there rather than at Jumma
    stops: [
      { name: "Dronagiri road end", at: [30.60738, 79.85053], exact: true, ele: 3085 },
      { name: "Dronagiri", at: [30.59875, 79.86214], exact: true, ele: 3466 },
      { name: "Langatuli", at: [30.59346, 79.89005], exact: true, ele: 3976 },
      { name: "Changabang Base Camp", at: [30.58123, 79.92157], exact: true, ele: 4413 },
    ],
    guide: [
      [[30.60638, 79.85243], [30.60388, 79.85353], [30.60344, 79.85630], [30.60161, 79.85834], [30.60002, 79.85929]],
      [[30.59886, 79.86574], [30.59786, 79.86906], [30.59824, 79.87071], [30.59861, 79.87398], [30.59863, 79.87697], [30.59840, 79.88022], [30.59697, 79.88300], [30.59550, 79.88590]],
      [[30.59215, 79.89338], [30.59027, 79.89620], [30.58968, 79.89942], [30.58948, 79.90264], [30.58907, 79.90597], [30.58807, 79.90892], [30.58652, 79.91169], [30.58480, 79.91441], [30.58338, 79.91732]],
    ],
    days: [
      { to: "Dronagiri", note: "From the road end up to Dronagiri, a Bhotia village that worships the mountain" },
      { rest: "Acclimatisation day in Dronagiri" },
      { to: "Langatuli", note: "Up the Bagini valley to a meadow camp beside the moraine" },
      { to: "Changabang Base Camp", note: "Over moraine to the base camp on the Bagini glacier, below Changabang's north face" },
      { to: "Dronagiri", note: "Back down the valley" },
      { to: "Dronagiri road end", note: "Down to the road" },
    ],
  },

  // The five Panch Kedar temples, each its own trek; scripts/build-circuit.mjs joins them, with the
  // drives between, into panch-kedar

  kedarnath: {
    near: "Rudraprayag, Uttarakhand",
    stops: [
      { name: "Gaurikund", at: [30.6534, 79.0268] },
      { name: "Kedarnath", q: "Shri Kedarnath Mandir", at: [30.7354, 79.0668] },
    ],
    camps: { "Kedarnath base camp": ["Gaurikund", "Kedarnath", 0.9, ["Kedarnath base camp"]] },
    side: [{ name: "Bhukund Bhairavnath temple", at: [30.73213, 79.07014], exact: true }],
    days: [
      { to: "Kedarnath", note: "The pilgrim path from Gaurikund up the Mandakini, past Rambara and Linchauli, to the temple below the Kedarnath peaks" },
      { rest: "Darshan at the temple, and the short climb to Bhukund Bhairavnath temple above it", side: "Bhukund Bhairavnath temple" },
      { to: "Gaurikund", note: "Back down the same path to Gaurikund" },
    ],
  },

  madhmaheshwar: {
    near: "Rudraprayag, Uttarakhand",
    // Up to the temple as two Wikiloc tracks walk it (Bon-P-Lan 118077703, Guy The Explorer 89441102)
    gapGuides: [[[30.6301, 79.21827], [30.6306, 79.21885], [30.63075, 79.21964], [30.63108, 79.22031], [30.63188, 79.22028], [30.63253, 79.22023], [30.63318, 79.22078], [30.6338, 79.22127], [30.63439, 79.22164]]],
    stops: [
      { name: "Ransi", near: "Ukhimath, Uttarakhand" },
      { name: "Gaundar", at: [30.6026, 79.1797] },
      { name: "Madhmaheshwar", q: "Madmameshwar Temple", at: [30.6352, 79.2215] },
    ],
    side: [{ name: "Budha Madhmaheshwar", q: "Budha Madmaheshwar Mandir", at: [30.6338, 79.2166] }],
    // Above Gaundar OSM has no path: guide points every 350 m read off a GPS track on Wikiloc
    // ("Madhyamaheswar to Ransi", research/gpx-sources.md), through Bantoli and Nanu to the temple
    guide: [
      [[30.59176, 79.14300], [30.59267, 79.14644], [30.59137, 79.14927], [30.58995, 79.15193], [30.58962, 79.15473], [30.59122, 79.15621], [30.59237, 79.15928], [30.59403, 79.16033], [30.59408, 79.16182], [30.59489, 79.16269], [30.59745, 79.16312], [30.59600, 79.16628], [30.59678, 79.16871], [30.59809, 79.17101], [30.60125, 79.17298], [30.60159, 79.17593]],
      [[30.60511, 79.18209], [30.60615, 79.18463], [30.60689, 79.18772], [30.60744, 79.18880], [30.60606, 79.19180], [30.60787, 79.19137], [30.60774, 79.19259], [30.60838, 79.19474], [30.61053, 79.19617], [30.61284, 79.19815], [30.61447, 79.20088], [30.61566, 79.20105], [30.61708, 79.20112], [30.61862, 79.20209], [30.61945, 79.20363], [30.62000, 79.20644], [30.62142, 79.20773], [30.62165, 79.20981], [30.62284, 79.20962], [30.62373, 79.21104], [30.62433, 79.21434], [30.62637, 79.21532], [30.62768, 79.21747], [30.62986, 79.21834]],
    ],
    days: [
      { to: "Gaundar", note: "From the road at Ransi down to the Madhmaheshwar Ganga and along it to Gaundar village" },
      { to: "Madhmaheshwar", note: "Up through Bantoli, Khatara and Nanu, oak and rhododendron forest, to the meadow temple" },
      { rest: "A morning at Budha Madhmaheshwar, the small shrine on the meadow above, facing Chaukhamba", side: "Budha Madhmaheshwar" },
      { to: "Ransi", note: "All the way back down to Ransi" },
    ],
  },

  "tungnath-chandrashila": {
    near: "Rudraprayag, Uttarakhand",
    stops: [
      { name: "Chopta", at: [30.4827, 79.2067], exact: true } /* where the Tungnath path leaves the road (OSM GPS traces); "Chopta" in OSM is a roadside campsite 700 m south */,
      { name: "Tungnath", q: "Tunganath", at: [30.4887, 79.21702] },
      { name: "Chandrashila", at: [30.48806, 79.22139], ele: 3690 }, // surveyed summit; the model reads 3,642 m
    ],
    days: [
      { to: "Chopta", via: ["Tungnath", "Chandrashila"], note: "Up the paved path through the Chopta meadows to Tungnath, the highest Shiva temple, then on to the Chandrashila summit for Chaukhamba, Kedarnath and Nanda Devi, and back down" },
    ],
  },

  rudranath: {
    near: "Chamoli, Uttarakhand",
    stops: [
      { name: "Sagar", at: [30.4398, 79.3213] },
      { name: "Pitradhar", at: [30.4883, 79.3326] },
      { name: "Rudranath", at: [30.5186, 79.3182] },
    ],
    // Lyuti and Panar bugyals, on the way up from Sagar, aren't on the map by name
    camps: {
      "Lyuti Bugyal": ["Sagar", "Pitradhar", 0.4, ["Lyuti", "Liti Bugyal"]],
      Panar: ["Sagar", "Pitradhar", 0.75, ["Panar Bugyal", "Pannar"]],
    },
    days: [
      { to: "Panar", note: "From Sagar village up through oak forest and the Lyuti meadows to the wide Panar bugyal" },
      { to: "Rudranath", via: ["Pitradhar"], note: "Over Pitradhar, with its stone cairns, and along the ridge to the rock shrine where Shiva is worshipped as a face" },
      { to: "Sagar", note: "Darshan at dawn, then the long way down to Sagar" },
    ],
  },

  kalpeshwar: {
    near: "Chamoli, Uttarakhand",
    stops: [
      { name: "Urgam", at: [30.5401, 79.4566] },
      KALPESHWAR,
      { name: "Bansi Narayan", at: [30.54, 79.4096] },
    ],
    days: [
      { to: "Bansi Narayan", via: ["Kalpeshwar"], note: "From Urgam through Devgram to Kalpeshwar, the cave temple open all year, then up through oak forest to the old Vishnu temple at Bansi Narayan" },
      { to: "Urgam", note: "Back down past Kalpeshwar to the Urgam valley" },
    ],
  },

  // The five below follow reference GPS tracks (research/gpx-sources.md): camps and guide points
  // (one list per leg, in walking order) are read off them, and the line between is routed over
  // OpenStreetMap's paths or drawn along the terrain here

  "phulara-ridge": {
    near: "Uttarkashi, Uttarakhand",
    // Out of Sankri the way six Wikiloc tracks take (Shankar_raju_g 31522546, afreen jaffer 44873971 and others), 280 m east of the line OSM's paths gave
    gapGuides: [[[31.07557, 78.1853], [31.07496, 78.18602], [31.07454, 78.18692], [31.07431, 78.18783], [31.07384, 78.18874], [31.07314, 78.18934], [31.07251, 78.19008], [31.07193, 78.19061], [31.07167, 78.19136], [31.07099, 78.19156], [31.07016, 78.1911], [31.0696, 78.1907], [31.06895, 78.19049], [31.06806, 78.18972], [31.06722, 78.18926], [31.06644, 78.18908]]],
    stops: [
      SANKRI,
      { name: "Sikolta Thach", at: [31.0408, 78.1866], exact: true },
      { name: "Bhoj Gadi", at: [31.0231, 78.2043], exact: true },
      { name: "Phulara Top", at: [31.029, 78.221], exact: true },
      { name: "Vijay Thach", at: [31.0469, 78.2176], exact: true },
      { name: "Taluka road", at: [31.07175, 78.21327], exact: true },
    ],
    guide: [
      [[31.06636, 78.18907], [31.06421, 78.18798], [31.06156, 78.18686], [31.05880, 78.18713], [31.05693, 78.18936], [31.05423, 78.18992], [31.05222, 78.18813], [31.05209, 78.18499], [31.05054, 78.18600], [31.04794, 78.18638], [31.04527, 78.18530], [31.04249, 78.18519]],
      [[31.03686, 78.18838], [31.03502, 78.18800], [31.03237, 78.18741], [31.03040, 78.18821], [31.02813, 78.18996], [31.02646, 78.19316], [31.02537, 78.19615], [31.02421, 78.19841], [31.02352, 78.20203]],
      [[31.02381, 78.20793], [31.02337, 78.21125], [31.02503, 78.21400], [31.02670, 78.21681]],
      [[31.02996, 78.21895], [31.03051, 78.21694], [31.03332, 78.21706], [31.03484, 78.21645], [31.03612, 78.21441], [31.03867, 78.21649], [31.04129, 78.21690], [31.04444, 78.21780]],
      [[31.04953, 78.22016], [31.04545, 78.21318], [31.04557, 78.21284], [31.04633, 78.21212], [31.04832, 78.21268], [31.05131, 78.21420], [31.05384, 78.21343], [31.05586, 78.21196], [31.05882, 78.21182], [31.06212, 78.21164], [31.06469, 78.21310], [31.06679, 78.21392], [31.06994, 78.21453]],
    ],
    days: [
      { to: "Sikolta Thach", note: "From Sankri up through pine and oak, past the Juda ka Talab lake, to a forest meadow" },
      { to: "Bhoj Gadi", note: "Steeply up through the last trees onto open meadows facing Kedarkantha" },
      { to: "Vijay Thach", via: ["Phulara Top"], note: "The ridge day: along the open crest past Phulara Top, with Swargarohini and Kala Nag ahead, then down to a meadow camp" },
      { to: "Taluka road", note: "Down through forest to the road between Sankri and Taluka" },
    ],
  },

  "surya-top": {
    near: "Uttarkashi, Uttarakhand",
    // A long straight: the path's shape from two Wikiloc tracks that agree (Surya top ih (241332541), and 2567250)
    gapGuides: [[[30.86277, 78.56592], [30.86243, 78.56626], [30.86217, 78.56668], [30.86181, 78.56709], [30.86144, 78.56753], [30.86113, 78.56791], [30.86092, 78.56801], [30.86075, 78.56856], [30.86057, 78.56901], [30.86045, 78.56957], [30.86019, 78.57001], [30.85985, 78.57023]]],
    stops: [
      { name: "Barsu", at: [30.84291, 78.60177], exact: true },
      { name: "Utron", at: [30.8597, 78.575], exact: true },
      { name: "Siyari", at: [30.8732, 78.5631], exact: true },
      { name: "Surya Top", at: [30.8834, 78.5661], exact: true },
      { name: "Barsu ka Gahra", at: [30.8614, 78.5797], exact: true },
      { name: "Barsu", at: [30.84291, 78.60177], exact: true },
    ],
    guide: [
      // From the village up the same path the descent track (last chain) comes down, then the way-up track
      [[30.84524, 78.60083], [30.84625, 78.59782], [30.84730, 78.59704], [30.84709, 78.59595], [30.84827, 78.59545], [30.84792, 78.59266], [30.84803, 78.59297], [30.84828, 78.59171], [30.84939, 78.59214], [30.85029, 78.59136], [30.85101, 78.58960], [30.85281, 78.58755], [30.85396, 78.58626], [30.85666, 78.58384], [30.85638, 78.58415], [30.85659, 78.58371], [30.85808, 78.58246], [30.86036, 78.58313], [30.86019, 78.58029], [30.85942, 78.57742]],
      [[30.86205, 78.57284], [30.86281, 78.57000], [30.86382, 78.56815], [30.86557, 78.56543], [30.86769, 78.56452], [30.87049, 78.56484]],
      [[30.87513, 78.55971], [30.87765, 78.56044], [30.87932, 78.56252], [30.88147, 78.56504]],
      [[30.88125, 78.56577], [30.88004, 78.56375], [30.87803, 78.56048], [30.87716, 78.55948], [30.87517, 78.55966], [30.87270, 78.56024], [30.87030, 78.56180], [30.86684, 78.56128], [30.86470, 78.56108], [30.86470, 78.56250], [30.86286, 78.56556], [30.86096, 78.56814], [30.85825, 78.57192], [30.85786, 78.57325], [30.85958, 78.57478], [30.86104, 78.57654], [30.85938, 78.57884]],
      [[30.86090, 78.58248], [30.85871, 78.58246], [30.85739, 78.58403], [30.85547, 78.58506], [30.85360, 78.58658], [30.85288, 78.58766], [30.85116, 78.58927], [30.85029, 78.59136], [30.84939, 78.59214], [30.84828, 78.59171], [30.84803, 78.59297], [30.84792, 78.59266], [30.84827, 78.59545], [30.84709, 78.59595], [30.84730, 78.59704], [30.84625, 78.59782], [30.84524, 78.60083]],
    ],
    days: [
      { to: "Utron", note: "From Barsu up through oak and rhododendron, past the Pichkiya clearing" },
      { to: "Siyari", note: "Over Phool Gally onto the open Siyari meadows" },
      { to: "Barsu ka Gahra", via: ["Surya Top"], note: "Summit day: up the ridge to Surya Top for sunrise on Bandarpunch, Srikanth and the Gangotri peaks, then down to Barsu ka Gahra" },
      { to: "Barsu", note: "Down through the forest to the village" },
    ],
  },

  "ranthan-kharak": {
    near: "Bageshwar, Uttarakhand",
    stops: [
      { name: "Gogina", at: [30.08111, 80.07651], exact: true },
      { name: "Namik", at: [30.0988, 80.0898], exact: true },
      { name: "Bajimanian Kharak", at: [30.0812, 80.1139], exact: true },
      { name: "Thal Tok", at: [30.0982, 80.1238], exact: true },
      { name: "Ranthan Top", at: [30.10801, 80.13376], exact: true },
    ],
    guide: [
      [[30.08407, 80.07630], [30.08385, 80.07517], [30.08501, 80.07677], [30.08772, 80.07707], [30.09028, 80.07918], [30.09301, 80.08054], [30.09520, 80.08273], [30.09798, 80.08379], [30.09752, 80.08515], [30.09891, 80.08554], [30.10025, 80.08759]],
      [[30.10011, 80.09451], [30.10165, 80.09597], [30.10089, 80.10195], [30.10089, 80.10281], [30.09978, 80.10560], [30.09850, 80.10889], [30.09714, 80.11079], [30.09399, 80.11133], [30.09137, 80.11091], [30.08929, 80.11177], [30.08788, 80.11264], [30.08476, 80.11375]],
      [[30.07983, 80.11536], [30.07888, 80.11801], [30.07974, 80.12180], [30.08292, 80.12309], [30.08499, 80.12434], [30.08785, 80.12339], [30.08920, 80.12092], [30.08796, 80.12244], [30.09170, 80.12249], [30.09506, 80.12333]],
      [[30.09677, 80.12662], [30.09729, 80.12962], [30.10003, 80.13016], [30.10344, 80.13111], [30.10462, 80.13306]],
    ],
    days: [
      { to: "Namik", note: "From the road at Gogina across the river and up to Namik village" },
      { to: "Bajimanian Kharak", note: "Through dense forest to the first high meadow" },
      { to: "Thal Tok", note: "Up through the herders' kharaks to the meadow below the top" },
      { to: "Thal Tok", via: ["Ranthan Top"], note: "Up to Ranthan Top for Nanda Devi, Trishul and Panchachuli, and back down to camp" },
      { to: "Namik", note: "Back down through the forest" },
      { to: "Gogina", note: "Down to the road" },
    ],
  },

  "gulabi-kantha": {
    near: "Uttarkashi, Uttarakhand",
    // The summit: where a Wikiloc track up from Seema Thatch (Kanasar to Bainkula, Mridul 2015,
    // 13063359) tops out on the ridge, 2.8 km and about 600 m above camp, as operators give the
    // summit day (6 km there and back, ~550 m up, a steep finish). 3,852 m on the GPS, 3,836 m on
    // the elevation model; operators quote 4,000-4,023 m, a height no ground within 3 km reaches
    side: [{ name: "Gulabi Kantha", at: [30.89961, 78.47833], exact: true, guide: [[30.91053, 78.46862], [30.90932, 78.4701], [30.90811, 78.47089], [30.90664, 78.46993], [30.90498, 78.47116], [30.90356, 78.47084], [30.90291, 78.47299], [30.90203, 78.47512], [30.9003, 78.47667]] }],
    stops: [
      { name: "Hanuman Chatti", at: [30.9312, 78.3996] },
      { name: "Kandola", at: [30.9189, 78.4301], exact: true },
      { name: "Seema Thatch", at: [30.91115, 78.4669], exact: true },
    ],
    guide: [
      [[30.92971, 78.40440], [30.92736, 78.40568], [30.92660, 78.40856], [30.92451, 78.41108], [30.92356, 78.41408], [30.92352, 78.41748], [30.92157, 78.42045], [30.92081, 78.42340], [30.91979, 78.42649]],
      [[30.91803, 78.43286], [30.91629, 78.43572], [30.91410, 78.43786], [30.91498, 78.44107], [30.91477, 78.44564], [30.91350, 78.44642], [30.91142, 78.44857], [30.90887, 78.45001], [30.90868, 78.45329], [30.90866, 78.45616], [30.90899, 78.45992], [30.90935, 78.46292], [30.90996, 78.46551]],
    ],
    days: [
      { to: "Seema Thatch", note: "From Hanuman Chatti up past Nishni village and the Kandola shepherds' huts to the high meadow camp" },
      { to: "Seema Thatch", side: "Gulabi Kantha", note: "Summit day: about 3 km up through bushes and meadows, steep at the end, to Gulabi Kantha for Bandarpunch, Swargarohini and the Gangotri peaks, and back" },
      { to: "Hanuman Chatti", note: "Back down past Kandola and Nishni" },
    ],
  },

  doodhpathri: {
    near: "Budgam, Jammu and Kashmir",
    // The guide points over the pass and past Pam Sar are placed from OSM's map, not a GPS track
    mapOnly: [[33.8197, 74.45135], [33.8213, 74.4504]],
    // A long straight on the way down to Tosa Maidan: the shape of the path from a Wikiloc track (Greater lakes trek Tosamaidan (82554051))
    gapGuides: [[[33.89199, 74.48546], [33.89257, 74.48547], [33.89305, 74.4856], [33.89356, 74.48572], [33.89372, 74.48639], [33.89419, 74.48675], [33.89473, 74.48674], [33.89528, 74.4869], [33.89568, 74.48722], [33.89604, 74.48768]]],
    stops: [
      // Where trekkers set off: four Wikiloc tracks (161261096, 86280598, 85918567, 172878113)
      // start at the meadow's road end, 1.6 km south of OSM's Doodhpathri point
      { name: "Doodhpathri", at: [33.84666, 74.56889], exact: true },
      { name: "Gurwansar", q: "Gurwansar campsite", at: [33.8036, 74.4626] },
      // The trek's high point: the pass OSM marks north of Gurwansar (unnamed there)
      { name: "Pass above Gurwansar", at: [33.8075, 74.4581], exact: true },
      // Where the Greater Lakes track finishes on the meadow; OSM's point is 500 m on, past where
      // any track goes
      { name: "Tosa Maidan", at: [33.91065, 74.51622], exact: true },
    ],
    // Not on the map by name: Ashtaar below the Pir Panjal, Duriem on the way down to Tosa Maidan
    camps: {
      Ashtaar: ["Doodhpathri", "Gurwansar", 0.55, ["Ashtar", "Ashitaar"]],
      Duriem: ["Pass above Gurwansar", "Tosa Maidan", 0.45, ["Durium"]],
    },
    // Doodhpathri to Gurwansar on OSM's paths; from past Pam Sar to Tosa Maidan, over the lakes
    guide: [
      // Doodhpathri to Gurwansar as a Wikiloc track walks it (Gurwansar Lakes (161261096)); OSM's
      // paths take other lines up the valley
      [[33.84479, 74.56786], [33.84437, 74.56471], [33.84263, 74.56206], [33.84114, 74.55986], [33.83964, 74.55691], [33.83931, 74.55371], [33.83817, 74.55088], [33.83613, 74.54863], [33.83624, 74.54689], [33.83534, 74.54364], [33.83464, 74.54029], [33.83425, 74.53742], [33.83208, 74.53539], [33.83012, 74.53283], [33.82852, 74.53045], [33.82659, 74.52806], [33.82531, 74.52556], [33.82287, 74.52368], [33.82004, 74.52258], [33.81911, 74.51951], [33.81808, 74.51634], [33.81719, 74.51305], [33.81776, 74.50998], [33.81934, 74.50732], [33.82122, 74.50465], [33.82314, 74.50224], [33.82371, 74.49957], [33.82196, 74.49671], [33.82157, 74.49333], [33.82047, 74.49014], [33.81932, 74.48707], [33.8178, 74.4844], [33.81537, 74.48251], [33.8133, 74.48024], [33.81124, 74.47796], [33.81044, 74.47499], [33.80943, 74.47177], [33.80799, 74.46882], [33.80689, 74.46574], [33.80486, 74.46346]],
      // Gurwansar to Duriem "via Pamsar Lake" (operators): over the pass OSM marks north of
      // Gurwansar, past Pam Sar to Pathri ki Gali, where the Greater Lakes track turns back. No GPS
      // track walks this stretch (none of ~290 on Wikiloc, none on OSM), so it is drawn along the
      // terrain through those mapped points and shown as having no tracking data
      [],
      [[33.8197, 74.45135], [33.8213, 74.4504], [33.825592, 74.44163], [33.82950, 74.44043], [33.83252, 74.43934], [33.83515, 74.43945], [33.83830, 74.43866], [33.84253, 74.43951], [33.84542, 74.43883], [33.84832, 74.43932], [33.85197, 74.43853], [33.85428, 74.43966], [33.85759, 74.43815], [33.86002, 74.43696], [33.86346, 74.43703], [33.86431, 74.43804], [33.86484, 74.44239], [33.86569, 74.44766], [33.86657, 74.45086], [33.86706, 74.45520], [33.86990, 74.45949], [33.87157, 74.46296], [33.87207, 74.46503], [33.87350, 74.46873], [33.87579, 74.47155], [33.87877, 74.47383], [33.88027, 74.47647], [33.88349, 74.47975], [33.88538, 74.48186], [33.88853, 74.48443], [33.89149, 74.48537], [33.89404, 74.48667], [33.89801, 74.48851], [33.90012, 74.48946], [33.90315, 74.49243], [33.90466, 74.49764], [33.90630, 74.49947], [33.90660, 74.50382], [33.90603, 74.50692], [33.90509, 74.51087], [33.90395, 74.51524], [33.90702, 74.51516], [33.90872, 74.51526], [33.90883, 74.51592], [33.9093, 74.51636], [33.91008, 74.51636]],
    ],
    days: [
      { to: "Ashtaar", note: "From the Doodhpathri meadows up the valley past shepherds' huts" },
      { to: "Gurwansar", note: "Up to the lake below the Pir Panjal ridge" },
      { to: "Duriem", via: ["Pass above Gurwansar"], note: "Over the pass above Gurwansar, past Pam Sar and over the high lakes" },
      { to: "Tosa Maidan", note: "Down to the great meadow of Tosa Maidan and the road" },
    ],
  },

  triund: {
    near: "Kangra, Himachal Pradesh",
    stops: [
      { name: "Galu Devi", q: "Galu Devi Mandir", at: [32.25459, 76.3259] },
      { name: "Triund", at: [32.26144, 76.35455] },
    ],
    // The main trail past Magic View Café, not the steeper paths up from Bhagsu
    through: [[32.25582, 76.34275]],
    days: [
      { to: "Triund", note: "From Galu Devi temple above Dharamkot through oak and rhododendron forest, past Magic View Café, then up the rocky switchbacks to the ridge below the Dhauladhar" },
      { to: "Galu Devi", note: "Sunrise on the Dhauladhar, then back down the same trail" },
    ],
  },

  "sar-pass": {
    near: "Kullu, Himachal Pradesh",
    stops: [
      { name: "Kasol", at: [32.01043, 77.3166] },
      // The village OSM lacks: a stop, so the climb goes through it and its height is its own
      { name: "Grahan", at: [31.9713, 77.3479] },
      // From Grahan over the pass to Barshaini on the trail as ultrajourneys.org recorded it; the
      // pass where it tops out, at their waypoint, with its published height (4,200-4,220 m; the
      // elevation model reads 4,125 m)
      { name: "Sar Pass", at: [31.96247, 77.38869], exact: true, ele: 4200, track: "sar-pass" },
      { name: "Biskeri Thach", q: "Biskeri", at: [31.95217, 77.40626], track: "sar-pass" },
      { name: "Barshaini", at: [31.99913, 77.44969], track: "sar-pass" },
    ],
    // On that trail: Min Thach the meadow at 3,240-3,290 m (published 3,200-3,400 m), Nagaru where
    // it reaches the published 3,800 m
    camps: { "Min Thach": ["Grahan", "Sar Pass", 0.4, ["Mingthach", "Min Thatch", "Mangthach"], [31.96853, 77.36943]], Nagaru: ["Grahan", "Sar Pass", 0.75, ["Nagaroo", "Nagru"], [31.97023, 77.37833]] },
    days: [
      { to: "Grahan", note: "Up from Kasol along the Grahan stream to a remote village" },
      { to: "Min Thach", note: "A steep climb through forest to an open shoulder" },
      { to: "Nagaru", note: "Up onto snow to the high camp, exposed and windy" },
      { to: "Biskeri Thach", via: ["Sar Pass"], note: "Across the pass at 4,200 m and down a long snow slide on your back" },
      { to: "Barshaini", note: "Down through meadows and forest to the road in the Parvati valley" },
    ],
  },

  "pin-parvati-pass": {
    near: "Kullu, Himachal Pradesh",
    stops: [
      { name: "Barshaini", at: [31.99913, 77.44969] },
      { name: "Kheerganga", at: [31.99481, 77.51094] },
      { name: "Tunda Bhuj", at: [31.9711, 77.59167] },
      { name: "Thakur Kuan", at: [31.95332, 77.64521] },
      { name: "Odi Thach", at: [31.9269, 77.70268] },
      { name: "Mantalai", at: [31.86775, 77.78228], exact: true, ele: 4120 }, // on the path by the lake (OSM's point is 150 m out); // OSM 4,248 m; operators 4,100–4,150
      { name: "Pin Parvati Pass", at: [31.8355, 77.84444], ele: 5319 },
      // The Spiti side from ultrajourneys.org's recorded trail ("Shepherd Camp to Mudh"): the
      // shepherds' camp below the glacier where it starts, and its end above Tiya's meadows
      { name: "Pin Valley Camp", at: [31.83555, 77.88726], exact: true },
      { name: "Tiya", at: [31.88552, 78.01213], exact: true, track: "pin-valley" },
      { name: "Mud", at: [31.959, 78.03241] },
    ],
    days: [
      { to: "Kheerganga", note: "Up the Parvati valley from Barshaini to the hot springs" },
      { to: "Tunda Bhuj", note: "Along the river through the last of the forest" },
      { to: "Thakur Kuan", note: "Past waterfalls on a narrow, exposed path" },
      { to: "Odi Thach", note: "Across Pandu Pul, a natural rock bridge, to open meadows" },
      { to: "Mantalai", note: "To the sacred lake at the source of the Parvati" },
      { rest: "Acclimatisation day at Mantalai" },
      { to: "Pin Valley Camp", via: ["Pin Parvati Pass"], note: "A long day over glacier to the pass at 5,320 m and down into Spiti. Crevasses: rope up" },
      { to: "Tiya", note: "Down the Pin valley's moraine and meadows" },
      { to: "Mud", note: "Out to Mud village and the road" },
    ],
  },

  "buran-ghati": {
    near: "Shimla, Himachal Pradesh",
    stops: [
      { name: "Janglik", at: [31.31716, 78.00958] },
      { name: "Dayara Thach", q: "Dehra Thach", at: [31.34772, 78.0609] }, // OSM spells it Dehra
      { name: "Litham", at: [31.3624, 78.10387], exact: true }, // on the path; OSM's point is 110 m off it
      { name: "Buran Ghati", at: [31.38742, 78.14567] },
      { name: "Munirang", at: [31.41578, 78.1545] }, // OSM's campsite below the pass, unnamed there
      { name: "Barua", at: [31.4682, 78.17846] },
    ],
    // Not in OSM: placed where the line reaches ~4,050 m, the height trek operators give for Dhunda
    camps: { Dhunda: ["Litham", "Buran Ghati", 0.68, ["Dunda", "Dhunda Camp"]] },
    days: [
      { to: "Dayara Thach", note: "Up from Janglik through forest onto one of the finest meadows in Himachal" },
      { to: "Litham", note: "Down through birch to Litham, below the Chandranahan waterfall" },
      // The Chandranahan lakes aren't in OpenStreetMap and published coordinates are too rough to place
      // them (31.37, 78.10 is beside Litham, the lakes are ~700 m higher): an acclimatisation day, the
      // walk named but not drawn
      { rest: "Acclimatisation day at Litham: an optional walk up to the Chandranahan lakes (about 4,260 m) at the source of the Pabbar, and back. Not drawn on the map" },
      { to: "Dhunda", note: "A steep climb to the snowy camp below the pass" },
      { to: "Munirang", via: ["Buran Ghati"], note: "Up to the pass at 4,570 m, then a roped rappel down the snow wall on the far side" },
      { to: "Barua", note: "Down through forest and apple orchards into Kinnaur" },
    ],
  },

  "kashmir-great-lakes": {
    near: "Ganderbal, Jammu and Kashmir",
    // Stretches with no mapped path, closed from a reference GPS track on Wikiloc (KGL 1 (114927915) and KGL 4 (114915491)):
    // guide points from where the line meets the track before each gap to where it meets it after
    gapGuides: [
      [[34.33829, 75.19437], [34.33847, 75.19392], [34.33856, 75.19354], [34.3387, 75.19283]],
      [[34.44309, 74.99691], [34.44251, 74.99661], [34.4425, 74.99657], [34.44181, 74.99625], [34.44134, 74.99577]],
    ],
    stops: [
      { name: "Sonamarg", at: [34.30239, 75.29656] },
      // The camps, not the middle of the lakes: OSM's Vishensar Campsite, and at Gadsar (no mapped
      // campsite) the lakeshore spot on the trail where uploaded GPS tracks gather
      { name: "Vishansar Lake", q: "Vishensar Campsite", at: [34.39103, 75.12633] },
      { name: "Gadsar Lake", q: "Gadsar", at: [34.42207, 75.06428] },
      { name: "Gangbal Lake", q: "Gangbal campsite", at: [34.42556, 74.94058] },
      { name: "Naranag", at: [34.35023, 74.97212] },
    ],
    // The rest day's walk: OSM's Krishansar lake
    side: [{ name: "Kishansar", at: [34.39651, 75.10157], exact: true }],
    camps: {
      Nichnai: ["Sonamarg", "Vishansar Lake", 0.45, ["Nichinai", "Nichnai Camp"]],
      "Nichnai Pass": ["Sonamarg", "Vishansar Lake", 0.7, ["Nichinai Pass", "Nichinai Bal", "Nichnai Bal"]],
      "Gadsar Pass": ["Vishansar Lake", "Gadsar Lake", 0.5, ["Gadsar Bal"]],
      // On the path; OSM's camp point is 150 m off it
      Satsar: ["Gadsar Lake", "Gangbal Lake", 0.45, ["Satsar Lake", "Satsar Lakes", "Satsar Camp"], [34.43935, 74.9948]],
      // OSM's Zajibal Gali, the pass (4,073 m on the elevation model)
      "Zaj Pass": ["Gadsar Lake", "Gangbal Lake", 0.75, ["Zach Pass", "Zajibal Pass", "Zajibal"], [34.42863, 74.97433]],
    },
    days: [
      { to: "Nichnai", note: "Up from Sonamarg through maple and birch to a valley of meadows" },
      { to: "Vishansar Lake", via: ["Nichnai Pass"], note: "Over Nichnai Pass and down to camp beside Vishansar, with Kishansar above it" },
      { rest: "A day at the twin lakes: walk up to Kishansar, above Vishansar", side: "Kishansar" },
      { to: "Gadsar Lake", via: ["Gadsar Pass"], note: "Over Gadsar Pass, the trek's highest, with both lakes below you, then down to Gadsar" },
      { to: "Satsar", note: "Through meadows to the seven lakes of Satsar. There's an army check post on the way: carry ID" },
      { to: "Gangbal Lake", via: ["Zaj Pass"], note: "Over boulders and Zaj Pass to the twin lakes of Gangbal and Nundkol, under Harmukh" },
      { to: "Naranag", note: "A steep descent through pine forest to Naranag's ancient temples" },
    ],
  },

  "tarsar-marsar-trek": {
    near: "Anantnag, Jammu and Kashmir",
    // No mapped path into and out of the Lidderwat camp: guide points off the same track, one chain
    // each side of the camp
    gapGuides: [
      [[34.15828, 75.24277], [34.15879, 75.2421]],
      [[34.15987, 75.23958], [34.16053, 75.23952], [34.16101, 75.23923], [34.16151, 75.23874]],
    ],
    stops: [
      { name: "Aru", at: [34.09029, 75.26244] },
      // Where a Wikiloc track (Tarsar Marsar one way, 2023) camps for the night, at 2,730 m where
      // the Tarsar valley meets the Lidder; OSM's Lidderwat is 1.9 km on up the Kolahoi branch
      { name: "Lidderwat", at: [34.15929, 75.24077], exact: true },
      { name: "Tarsar Lake", q: "Tar Sar", at: [34.1320, 75.14] },
      // Where the line tops out between the lake and Sundersar: the trek's high point
      { name: "Tarsar Pass", at: [34.15163, 75.11059], exact: true },
      { name: "Sundersar", at: [34.15757, 75.1122], exact: true }, // the camp on the path by the lake; OSM's point is mid-lake
      // Where the mapped path ends on the ridge above the lake, the viewpoint treks turn back at

      { name: "Marsar Lake", at: [34.14619, 75.11213], exact: true },
    ],
    camps: {
      // OSM's Sekiwas, the shepherds' huts: 3,424 m on the elevation model (published about 3,400 m)
      Shekwas: ["Lidderwat", "Tarsar Lake", 0.5, ["Shekwas Camp", "Shekhwas", "Homwas"], [34.16735, 75.17185]],
    },
    days: [
      { to: "Lidderwat", note: "Up the Lidder river from Aru through pine and meadows" },
      { to: "Shekwas", note: "Into a side valley to a camp ringed by peaks" },
      { to: "Tarsar Lake", note: "A short climb to the almond-shaped lake, the trek's showpiece" },
      { to: "Sundersar", via: ["Tarsar Pass"], note: "Over the Tarsar pass to a quiet lake camp" },
      // The way out operators take: Marsar, then down the Sundersar valley (mapped, about 10 km) to
      // the Shekwas/Homwas meadow, not back over the pass to Lidderwat in one 24 km day. own: the
      // last leg is routed on its own, so it follows that valley rather than the way you came
      { to: "Shekwas", via: ["Marsar Lake"], own: true, note: "Up to the ridge above Marsar, often under cloud, then down the Sundersar valley to Shekwas" },
      { to: "Lidderwat", note: "Back down the side valley to the Lidder" },
      { to: "Aru", note: "Back along the Lidder to the road" },
    ],
  },

  "markha-valley": {
    near: "Leh, Ladakh",
    stops: [
      { name: "Chilling", at: [34.03852, 77.20285] },
      { name: "Skiu", q: "Skyu", at: [33.98373, 77.25652] },
      { name: "Markha", at: [33.886, 77.42335] },
      { name: "Hankar", at: [33.8316, 77.50585] },
      { name: "Nimaling", at: [33.7865, 77.59409] },
      { name: "Chokdo", q: "Chogdo", at: [33.83044, 77.66908] },
    ],
    camps: { "Kongmaru La": ["Nimaling", "Chokdo", 0.3, ["Kangmaru La", "Gongmaru La", "Gonomaru La"]] },
    days: [
      { to: "Skiu", note: "Cross the Zanskar at Chilling and walk into the dry Markha gorge" },
      { to: "Markha", note: "A long, hot day along the river, wading it in places" },
      { to: "Hankar", note: "Past Tacha monastery on its cliff, Kang Yatse coming into view" },
      { to: "Nimaling", note: "Up onto the high plateau below Kang Yatse, where herders summer their yaks" },
      { to: "Chokdo", via: ["Kongmaru La"], note: "Over Kongmaru La at 5,260 m, the trek's highest point, and down a red-rock gorge" },
    ],
  },

  goechala: {
    near: "Gyalshing, Sikkim",
    // Samiti Lake to Viewpoint 1 has no mapped path: guide points read off a Wikiloc track (Lamuni to
    // Goechala pass (11358610))
    gapGuides: [[[27.58092, 88.18915], [27.58266, 88.18867], [27.58441, 88.18859], [27.58614, 88.18817]]],
    stops: [
      { name: "Yuksom", at: [27.36924, 88.21848] },
      { name: "Sachen", at: [27.41394, 88.19731] },
      { name: "Tshoka", at: [27.4327, 88.18163] },
      { name: "Dzongri", at: [27.47545, 88.16025] },
      { name: "Thansing", at: [27.51688, 88.18392] },
      { name: "Lamuney", at: [27.5456, 88.18604] },
      { name: "Samiti Lake", at: [27.56166, 88.18738] },
      // Viewpoint 1, where treks now turn round; Goecha La itself is closed to trekkers. Not on the
      // map: placed up the valley from Samiti Lake where the route reaches its published 4,600 m
      // (the same route reaches Goecha La at 4,941 m on the elevation model, as published)
      { name: "Goechala Viewpoint 1", at: [27.58704, 88.18714], exact: true },
    ],
    side: [{ name: "Dzongri Top", optional: true }],
    days: [
      { to: "Sachen", note: "Out of Yuksom into dense forest" },
      { to: "Tshoka", note: "Over the Prekchu on a high bridge and up to a small Tibetan settlement" },
      { to: "Dzongri", note: "Through rhododendron forest to the open Dzongri meadow" },
      { rest: "Acclimatisation day: up Dzongri Top at dawn for Kanchenjunga and Pandim", side: "Dzongri Top" },
      { to: "Thansing", note: "Down to the Prekchu and along its valley, Pandim above" },
      { to: "Lamuney", note: "A short walk to the last camp" },
      { to: "Thansing", via: ["Samiti Lake", "Goechala Viewpoint 1"], note: "Leave around 2 am, past Samiti Lake to the viewpoint facing Kanchenjunga at sunrise, then back down" },
      { to: "Tshoka", note: "A long descent the way you came, skipping Dzongri" },
      { to: "Yuksom", note: "Down through the forest to Yuksom" },
    ],
  },

  "sandakphu-phalut-trek": {
    near: "Darjeeling, West Bengal",
    stops: [{ name: "Manebhanjan", q: "Maneybhanjang", at: [26.98863, 88.12034] }, { name: "Tumling", at: [27.03126, 88.06896] }, { name: "Sandakphu", at: [27.10444, 88.00048], ele: 3636 }, { name: "Phalut", at: [27.20754, 88.01583] }, { name: "Gorkhey", at: [27.18744, 88.07195] }],
    // Kalipokhri on the trail by GeoNames' Kal Pokhari
    camps: { Kalipokhri: ["Tumling", "Sandakphu", 0.6, ["Kalipokhari", "Kali Pokhari", "Kalpokhari", "Kalipokhri Lake"], [27.07825, 88.01757]] },
    days: [
      { to: "Tumling", note: "A steep climb out of Manebhanjan past Chitrey's monastery, along the India-Nepal border" },
      { to: "Kalipokhri", note: "Through Singalila National Park's forest to the 'black lake'" },
      { to: "Sandakphu", note: "Up the last steep stretch to West Bengal's highest point, facing Kanchenjunga and Everest" },
      { to: "Phalut", note: "Along the open ridge, the finest walk of the trek" },
      { to: "Gorkhey", note: "Down through forest to a riverside village" },
    ],
  },
  // The loop operators run (Bikat, Trek The Himalayas, Treks and Trails India, WhiteMagic): up the
  // Gokyo valley, over the Cho La to the Khumbu, Base Camp and Kala Patthar, down via Pheriche.
  // A loop, so the way down is on the line and each day is measured on the path it walks.
  "everest-base-camp-gokyo-lakes": {
    near: "Solukhumbu, Nepal",
    stops: [
      "Lukla", "Phakding", "Namche Bazaar", "Dole",
      { name: "Machhermo", q: "Macchermo", at: [27.90288, 86.7156] },
      "Gokyo",
      { name: "Dragnag", q: "ड्रागनाग", at: [27.94075, 86.72033] },
      { name: "Cho La", at: [27.96172, 86.75164], exact: true, ele: 5420 },
      { name: "Dzongla", q: "Dzonglha", at: [27.93992, 86.77375] },
      { name: "Lobuche", at: [27.9481, 86.81017] },
      { name: "Gorak Shep", at: [27.98068, 86.82893] },
      { name: "Everest Base Camp", at: [27.99966, 86.84879], exact: true, ele: 5364 }, // the 90 m model reads the moraine low
      { name: "Pheriche", q: "फेरिचे", at: [27.89339, 86.81999] },
      { name: "Tengboche", at: [27.83581, 86.76461] },
      "Lukla",
    ],
    side: ["Gokyo Ri", "Kala Patthar", NAMCHE_VIEW, { name: "Ngozumpa Tsho (fifth lake)", at: [28.00535, 86.68255], exact: true }],
    days: [
      { to: "Phakding", note: "Fly into Lukla in the morning and walk down the Dudh Kosi valley" },
      { to: "Namche Bazaar", note: "The big climb of the trek: the Namche hill, with a first view of Everest" },
      { rest: "Acclimatisation day: up to the Everest viewpoint above Syangboche, then back to sleep low in Namche", side: NAMCHE_VIEW.name },
      { to: "Dole", note: "Off the Everest trail over Mong La, down to the river and up into the Gokyo valley" },
      { to: "Machhermo", note: "A short day, to keep the height gain slow" },
      { to: "Gokyo", note: "Beside the Ngozumpa glacier, past the first two lakes to Gokyo on the third" },
      { rest: "Acclimatisation day: up the valley past the fourth lake (Thonak Tso) to the fifth, Ngozumpa Tsho, and back", side: "Ngozumpa Tsho (fifth lake)" },
      { to: "Dragnag", side: "Gokyo Ri", note: "Gokyo Ri at dawn for Everest, Lhotse, Makalu and Cho Oyu, then across the Ngozumpa glacier to Dragnag" },
      { to: "Dzongla", note: "Over the Cho La: a steep scramble up, a short glacier crossing at the top, and down to Dzongla" },
      { to: "Lobuche", note: "Round the ridge into the Khumbu valley" },
      { to: "Gorak Shep", via: ["Everest Base Camp"], note: "On to Gorak Shep, then out to Base Camp and back" },
      { to: "Pheriche", side: "Kala Patthar", note: "Kala Patthar before sunrise for the Everest view, then down" },
      { to: "Namche Bazaar", note: "A long descent back through Pangboche and Tengboche" },
      { to: "Lukla", note: "Back to the airstrip. Flights out are early the next morning: keep a spare day, as weather cancels them" },
    ],
  },
  // The loop over all three passes, as WhiteMagic runs it: west to Thame, over the Renjo La to
  // Gokyo, the Cho La to the Khumbu and Base Camp, the Kongma La to Chhukung, and down via Deboche
  "everest-three-passes": {
    near: "Solukhumbu, Nepal",
    stops: [
      "Lukla", "Phakding", "Namche Bazaar",
      { name: "Thame", at: [27.83189, 86.65048] },
      { name: "Lungden", q: "Laṅden", at: [27.90525, 86.63688] },
      { name: "Renjo La", q: "रेंजो ला", at: [27.94737, 86.6585], exact: true, ele: 5360 },
      "Gokyo",
      { name: "Dragnag", q: "ड्रागनाग", at: [27.94075, 86.72033] },
      { name: "Cho La", at: [27.96172, 86.75164], exact: true, ele: 5420 },
      { name: "Dzongla", q: "Dzonglha", at: [27.93992, 86.77375] },
      { name: "Lobuche", at: [27.9481, 86.81017] },
      { name: "Gorak Shep", at: [27.98068, 86.82893] },
      { name: "Everest Base Camp", at: [27.99966, 86.84879], exact: true, ele: 5364 }, // the 90 m model reads the moraine low
      { name: "Kongma La", q: "Kongma La Pass", at: [27.9297, 86.83622], exact: true, ele: 5535 },
      { name: "Chhukung", q: "Chukhung", at: [27.90467, 86.87137] },
      { name: "Deboche", at: [27.83971, 86.77041] },
      "Lukla",
    ],
    side: ["Gokyo Ri", "Kala Patthar", NAMCHE_VIEW],
    days: [
      { to: "Phakding", note: "Fly into Lukla in the morning and walk down the Dudh Kosi valley" },
      { to: "Namche Bazaar", note: "The big climb of the trek: the Namche hill, with a first view of Everest" },
      { rest: "Acclimatisation day: up to the Everest viewpoint above Syangboche, then back to sleep low in Namche", side: NAMCHE_VIEW.name },
      { to: "Thame", note: "West up the Bhote Kosi valley to Thame and its cliffside monastery" },
      { to: "Lungden", note: "Up the quiet valley through Marlung to the last lodges below the Renjo La" },
      { rest: "Acclimatisation day at Lungden before the first pass" },
      { to: "Gokyo", note: "Over the Renjo La, with Everest and the Gokyo lakes below you on the far side, and down to Gokyo" },
      { to: "Gokyo", side: "Gokyo Ri", note: "Gokyo Ri at dawn for Everest, Lhotse, Makalu and Cho Oyu, and back down to rest" },
      { to: "Dragnag", note: "A short day across the Ngozumpa glacier" },
      { to: "Dzongla", note: "Over the Cho La: a steep scramble up, a short glacier crossing at the top, and down to Dzongla" },
      { to: "Lobuche", note: "Round the ridge into the Khumbu valley" },
      { to: "Gorak Shep", via: ["Everest Base Camp"], note: "On to Gorak Shep, then out to Base Camp and back" },
      { to: "Lobuche", side: "Kala Patthar", note: "Kala Patthar before sunrise for the Everest view, then back down to Lobuche" },
      { to: "Chhukung", note: "Over the Kongma La, the highest of the three, across the Khumbu glacier first, and down to Chhukung" },
      { to: "Deboche", note: "Down the Imja valley past Dingboche and Pangboche" },
      { to: "Namche Bazaar", note: "Through Tengboche and back along the valley side" },
      { to: "Lukla", note: "Back to the airstrip. Flights out are early the next morning: keep a spare day, as weather cancels them" },
    ],
  },
};
