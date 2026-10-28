// Stops and day plans for scripts/build-trail.mjs, one entry per trek.
// stops   overnight places and high points in walking order. A string is searched in
//         OpenStreetMap; { name, at: [lat, lng] } carries coordinates read off OpenStreetMap
//         (a place, a campsite, or the end of a named trail segment) for when the search can't
//         find it by name. q overrides the search text. A loop lists its start again at the end.
//         optional: true takes the stop only if the trek's OSM place list has it (by name or q),
//         and leaves it out otherwise, with it the days' visits to it.
// camps   camps between two stops: { name: [stopA, stopB, share, aka?] }. Looked up in
//         OpenStreetMap by name and by the other names in aka, near where they should be; one it
//         doesn't have is put that share of the way along the trail from stop A to stop B, and
//         days that reach it are marked approximate.
// near    added to place searches to pick the right one of several places with the same name
// side    out-and-back high points off the line, as points; extra: places only the days visit
// days    { to, via?, side?: { name, km, up }, note } walks from last night's stop;
//         { rest } stays put. Only the days on foot: drives in and out aren't listed.
// Treks with too little of their route on OpenStreetMap to place honestly aren't listed:
// bagini-glacier, kedartal, hampta-pass, rupin-pass, pin-bhaba-pass, gulabi-kantha, phulara-ridge, panch-kedar,
// ranthan-kharak, surya-top, bajre-dara, doodhpathri.

const LOHAJUNG = { name: "Lohajung", at: [30.1283, 79.6190] };
const SANKRI = { name: "Sankri", at: [31.07802, 78.18411] };
const GANGOTRI = { name: "Gangotri", at: [30.99437, 78.93987] };
const DHAK = { name: "Dhak", at: [30.49886, 79.61134] };
const KHULLARA = { name: "Khullara", at: [30.45968, 79.58748] };

export const TREKS = {
  "everest-base-camp": {
    near: "Solukhumbu, Nepal",
    stops: ["Lukla", "Phakding", "Namche Bazaar", "Tengboche", "Dingboche", "Lobuche", "Gorak Shep", "Everest Base Camp"],
    side: ["Kala Patthar"],
    extra: ["Pheriche"],
    days: [
      { to: "Phakding", note: "Fly into Lukla in the morning and walk down the Dudh Kosi valley" },
      { to: "Namche Bazaar", note: "The big climb of the trek: the Namche hill, with a first view of Everest" },
      { rest: "Acclimatisation day: a short climb above Namche and back to sleep low" },
      { to: "Tengboche", note: "Across the valley side to the monastery, facing Ama Dablam" },
      { to: "Dingboche", note: "Through Pangboche into the Imja valley" },
      { rest: "Acclimatisation day: climb partway up Nangkartshang and back" },
      { to: "Lobuche", note: "Past the climbers' memorials at Thukla" },
      { to: "Gorak Shep", via: ["Everest Base Camp"], note: "On to Gorak Shep, then out to Base Camp and back" },
      { to: "Pheriche", side: { name: "Kala Patthar", km: 4.2, up: 480 }, note: "Kala Patthar before sunrise for the Everest view, then down" },
      { to: "Namche Bazaar", note: "A long descent back through Pangboche and Tengboche" },
      { to: "Lukla", note: "Back to the airstrip. Flights out are early the next morning: keep a spare day, as weather cancels them" },
    ],
  },

  "gokyo-lakes": {
    near: "Solukhumbu, Nepal",
    stops: ["Lukla", "Phakding", "Namche Bazaar", "Dole", { name: "Machhermo", q: "Macchermo", at: [27.90288, 86.7156] }, "Gokyo"],
    side: ["Gokyo Ri"],
    days: [
      { to: "Phakding", note: "Fly into Lukla in the morning and walk down the Dudh Kosi valley" },
      { to: "Namche Bazaar", note: "The big climb of the trek: the Namche hill, with a first view of Everest" },
      { rest: "Acclimatisation day: a short climb above Namche and back to sleep low" },
      { to: "Dole", note: "Off the Everest trail, up the Gokyo valley past Mong La" },
      { to: "Machhermo", note: "A short day, to keep the height gain slow" },
      { to: "Gokyo", note: "Beside the Ngozumpa glacier past the first lakes to Gokyo, on the third" },
      { to: "Gokyo", side: { name: "Gokyo Ri", km: 4, up: 600 }, note: "Gokyo Ri at dawn for Everest, Lhotse, Makalu and Cho Oyu, and back down" },
      { to: "Dole", note: "Down the valley" },
      { to: "Namche Bazaar", note: "Back to Namche" },
      { to: "Lukla", note: "Back to the airstrip. Flights out are early the next morning: keep a spare day, as weather cancels them" },
    ],
  },

  "annapurna-base-camp": {
    near: "Kaski, Nepal",
    stops: ["Nayapul", "Ulleri", "Ghorepani", { name: "Poon Hill", q: "Pun Danda", at: [28.40004, 83.68954] }, "Tadapani", { name: "Chhomrong", at: [28.42426, 83.81853] }, { name: "Bamboo", at: [28.45702, 83.85693] }, { name: "Deurali", at: [28.49756, 83.89833] }, { name: "Machapuchare Base Camp", q: "Machhapuchhare Base Camp", at: [28.52651, 83.90756] }, { name: "Annapurna Base Camp", at: [28.53076, 83.87785] }],
    extra: ["Jhinu Danda"],
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
    stops: ["Dharapani", "Chame", "Upper Pisang", "Manang", "Yak Kharka", { name: "Thorong Phedi", at: [28.77678, 83.97264] }, { name: "Thorong La", at: [28.79353, 83.93876] }, { name: "Muktinath", at: [28.81692, 83.87145] }],
    days: [
      { to: "Chame", note: "After the drive up the Marsyangdi, walk through pine forest to Chame" },
      { to: "Upper Pisang", note: "Past the great curved rock face of Paungda Danda to Pisang" },
      { to: "Manang", note: "Up the dry upper valley, Annapurna II and III across it" },
      { rest: "Acclimatisation day in Manang: climb towards Praken Gompa or Ice Lake and back" },
      { to: "Yak Kharka", note: "Out of the Manang valley up to the yak pastures" },
      { to: "Thorong Phedi", note: "A short day to the foot of the pass. Sleep early" },
      { to: "Muktinath", via: ["Thorong La"], note: "Start before dawn to cross Thorong La at 5,416 m, then a long, steep descent to Muktinath's temple" },
    ],
  },

  "khopra-danda": {
    near: "Myagdi, Nepal",
    stops: ["Nayapul", "Ulleri", "Ghorepani", "Swanta", "Khopra Danda"],
    camps: { Chistibung: ["Swanta", "Khopra Danda", 0.5] },
    days: [
      { to: "Ulleri", note: "Along the Bhurungdi river, then over 3,000 stone steps up to Ulleri" },
      { to: "Ghorepani", note: "Through rhododendron forest to the village under Poon Hill" },
      { to: "Swanta", note: "Off the main trail to a quiet Magar village" },
      { to: "Chistibung", note: "Up through forest to a high clearing" },
      { to: "Khopra Danda", note: "Onto the ridge facing Dhaulagiri and Annapurna South" },
      { to: "Khopra Danda", side: { name: "Khayer Lake", km: 16, up: 1000 }, note: "A long day out to the sacred Khayer Lake at 4,660 m and back" },
      { to: "Swanta", note: "Back down the way you came" },
      { to: "Nayapul", note: "Down to the road" },
    ],
  },

  "manaslu-circuit": {
    near: "Gorkha, Nepal",
    stops: ["Soti Khola", { name: "Machha Khola", q: "Machhakhola", at: [28.22931, 84.87377] }, "Jagat", "Deng", "Namrung", "Lho", { name: "Samagaun", q: "Samagau", at: [28.58467, 84.64404] }, "Samdo", { name: "Larkya La", at: [28.66392, 84.52031] }, "Bimthang", { name: "Dharapani", at: [28.519, 84.35838] }],
    camps: { Dharmasala: ["Samdo", "Larkya La", 0.55, ["Larkya Phedi", "Dharamsala", "Dharamshala", "Larke Phedi"]] },
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
      { to: "Bimthang", via: ["Larkya La"], note: "Leave around 4 am to cross Larkya La at 5,106 m, then a long descent to Bimthang" },
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
      { name: "Har Ki Dun", at: [31.14813, 78.43242] },
    ],
    days: [
      { to: "Osla", note: "Drive from Sankri to Taluka, then walk up the Supin river through walnut and chestnut forest" },
      { to: "Har Ki Dun", note: "Through terraced fields above Osla, then up into the valley below Swargarohini" },
      { rest: "A day in the valley: walk towards the Jaundhar glacier or up to Maninda Tal" },
      { to: "Osla", note: "Back down the valley the way you came" },
      { to: "Taluka", note: "The last walk out along the Supin, then the drive back to Sankri" },
    ],
  },

  "bali-pass": {
    near: "Uttarkashi, Uttarakhand",
    stops: [
      { name: "Taluka", at: [31.07782, 78.24579] },
      { name: "Seema", at: [31.11703, 78.34994] },
      { name: "Rainbasera", at: [31.11588, 78.40142] },
      { name: "Ruinsara Tal", at: [31.08119, 78.45786] },
      { name: "Odari", at: [31.06098, 78.46323] },
      { name: "Bali Pass", at: [31.03299, 78.43803] },
      { name: "Janki Chatti", at: [30.97645, 78.43834] },
    ],
    camps: { "Lower Damini": ["Bali Pass", "Janki Chatti", 0.4, ["Damini", "Lower Dhamni", "Dhamni", "Damni"]] },
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
    stops: [
      { name: "Raithal", at: [30.81672, 78.60379] },
      { name: "Gui", at: [30.81448, 78.57426] },
      { name: "Dayara Bugyal", at: [30.82994, 78.54964] },
    ],
    days: [
      { to: "Gui", note: "Up from Raithal village through oak and maple to a forest clearing" },
      { to: "Dayara Bugyal", note: "Out of the trees onto the rolling meadow, Bandarpoonch and Srikanth on the skyline" },
      { rest: "A day on the meadows: walk up towards Bakaria Top for the views" },
      { to: "Raithal", note: "Down the way you came" },
    ],
  },

  "dodital-darwa-pass": {
    near: "Uttarkashi, Uttarakhand",
    stops: [
      { name: "Sangam Chatti", at: [30.83588, 78.45063] },
      { name: "Manjhi", at: [30.87492, 78.51945] },
      { name: "Dodital", q: "Dodi tal", at: [30.89725, 78.52606] },
      { name: "Darwa Pass", at: [30.91411, 78.51179] },
    ],
    camps: { Agoda: ["Sangam Chatti", "Manjhi", 0.4, ["Agora", "Agoda Village"]] },
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
      { name: "Gaumukh", at: [30.92574, 79.08182] },
      { name: "Tapovan", at: [30.91443, 79.0765] },
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
      { name: "Valley of Flowers", q: "Valley of Flowers Entry", at: [30.70568, 79.59586] },
      { name: "Hemkund Sahib", q: "Hemkund", at: [30.69875, 79.61847] },
    ],
    days: [
      { to: "Ghangaria", note: "Up the Lakshman Ganga on a paved mule path, busy with pilgrims, to the only village up here" },
      { to: "Ghangaria", side: { name: "Valley of Flowers", km: 10, up: 500 }, note: "Into the valley itself: walk as far as you like among the flowers and back. No camping inside" },
      { to: "Ghangaria", side: { name: "Hemkund Sahib", km: 12, up: 1100 }, note: "A steep climb to the glacial lake and gurdwara at 4,300 m, and back down" },
      { to: "Pulna", note: "Back down to the road" },
    ],
  },

  "kuari-pass": {
    near: "Chamoli, Uttarakhand",
    stops: [DHAK, KHULLARA, { name: "Kuari Pass", at: [30.45112, 79.58154] }],
    camps: { Gulling: ["Dhak", "Khullara", 0.5, ["Guling", "Gulling Top"]] },
    days: [
      { to: "Gulling", note: "Drive from Joshimath to Dhak, then up past Tugasi village to a forest camp" },
      { to: "Khullara", note: "Through oak and rhododendron to a meadow facing Dronagiri and Hathi Ghoda" },
      { to: "Khullara", via: ["Kuari Pass"], note: "Up to the pass for the long row of peaks Lord Curzon came for, and back to camp" },
      { to: "Dhak", note: "Down the way you came to the road" },
    ],
  },

  "pangarchulla-peak": {
    near: "Chamoli, Uttarakhand",
    stops: [DHAK, KHULLARA, { name: "Pangarchulla", at: [30.42367, 79.59214] }],
    camps: { Gulling: ["Dhak", "Khullara", 0.5, ["Guling", "Gulling Top"]] },
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
      { name: "Satopanth Lake", q: "Satopanth Tal", at: [30.74352, 79.357] },
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
      { name: "Chopta", q: "Chopta Tungnath", at: [30.47786, 79.21015] },
      { name: "Chandrashila", at: [30.48646, 79.22123] },
    ],
    camps: { "Rohini Bugyal": ["Deoriatal", "Chopta", 0.5, ["Rohini"]], Tungnath: ["Chopta", "Chandrashila", 0.8, ["Tungnath Temple", "Tungnath Mandir"]] },
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
      { name: "Panwali Kantha", at: [30.56968, 78.86745] },
    ],
    camps: { Gairu: ["Ghuttu", "Panwali Kantha", 0.5, ["Gairu Camp", "Garu"]] },
    days: [
      { to: "Gairu", note: "Up from Ghuttu through oak forest" },
      { to: "Panwali Kantha", note: "Onto the great meadow on the old pilgrim route to Kedarnath, the Gangotri and Kedar peaks in view" },
      { rest: "A day on the meadow, walking the ridge for the views" },
      { to: "Ghuttu", note: "Down the way you came. Some groups continue to Triyuginarayan instead" },
    ],
  },

  "pindari-glacier": {
    near: "Bageshwar, Uttarakhand",
    stops: [
      { name: "Khati", at: [30.11209, 79.94006] },
      { name: "Dwali", at: [30.17736, 79.99532] },
      { name: "Phurkia", at: [30.21645, 79.99772] },
      { name: "Zero Point", q: "Pindari Zero Point", at: [30.26596, 80.00519] },
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
      { name: "Bedni Bugyal", at: [30.20929, 79.66919] },
      { name: "Roopkund", q: "Rup Kund", at: [30.2621, 79.73172] },
    ],
    camps: { "Patar Nachauni": ["Bedni Bugyal", "Roopkund", 0.35, ["Patar Nachani", "Pathar Nachauni", "Patar Nachoni", "Pathar Nachuni"]], Bhagwabasa: ["Bedni Bugyal", "Roopkund", 0.75, ["Bhagwabas", "Bhagubasa", "Bagubasa", "Bhaguwabasa"]] },
    days: [
      { to: "Didna", note: "Down to the Neel Ganga and a steep climb through forest to Didna village" },
      { to: "Bedni Bugyal", via: ["Ali Bugyal"], note: "Out onto Ali Bugyal, one of the largest high meadows in the Himalaya, and along to Bedni" },
      { to: "Patar Nachauni", note: "A short day along the ridge, good for acclimatising" },
      { to: "Bhagwabasa", note: "Over Kalu Vinayak into rock and scree, the last camp below the lake" },
      { to: "Patar Nachauni", via: ["Roopkund"], note: "Up to the lake of skeletons at 4,800 m before dawn, then all the way back down" },
      { to: "Lohajung", note: "The long walk out" },
    ],
  },

  "ali-bedni-bugyal": {
    near: "Chamoli, Uttarakhand",
    stops: [
      LOHAJUNG,
      { name: "Didna", at: [30.16473, 79.63419] },
      { name: "Ali Bugyal", at: [30.18229, 79.65865] },
      { name: "Bedni Bugyal", at: [30.20929, 79.66919] },
      { name: "Wan", at: [30.20504, 79.61753] },
    ],
    days: [
      { to: "Didna", note: "Down to the Neel Ganga and a steep climb through forest to Didna village" },
      { to: "Ali Bugyal", note: "Up through oak forest onto the open grass of Ali Bugyal" },
      { to: "Bedni Bugyal", note: "Along the meadow ridge with Trishul and Nanda Ghunti in front of you" },
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
    days: [
      { to: "Bekaltal", note: "Through oak and rhododendron forest to a lake ringed by trees" },
      { to: "Brahmatal", note: "Up onto the ridge with Trishul and Nanda Ghunti, then down to the Brahmatal lake camp" },
      { to: "Brahmatal", side: { name: "Brahmatal Top", km: 4, up: 450 }, note: "An early climb to the top for the widest view of the trek, then back to camp" },
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
      { to: "Rola Kholi", via: ["Bhrigu Lake"], note: "A steep climb to the lake at 4,300 m, often still frozen, and back to camp" },
      { to: "Gulaba", note: "Down to the road" },
    ],
  },

  "beas-kund": {
    near: "Kullu, Himachal Pradesh",
    stops: [
      { name: "Dhundi", at: [32.35553, 77.12653] },
      { name: "Beas Kund", at: [32.36654, 77.08556] },
    ],
    camps: { Bakarthach: ["Dhundi", "Beas Kund", 0.5, ["Bakar Thach", "Bakkar Thach", "Bakarthatch"]] },
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
      { name: "Malana", at: [32.0618, 77.26002] },
    ],
    camps: { Stalling: ["Rumsu", "Malana", 0.35, ["Staling", "Stalling Thach"]], "Chandrakhani Pass": ["Rumsu", "Malana", 0.6, ["Chanderkhani Pass", "Chandrakhani", "Chanderkhani"]] },
    days: [
      { to: "Stalling", note: "Up from Rumsu, above Naggar, through deodar forest to open grass" },
      { to: "Malana", via: ["Chandrakhani Pass"], note: "Over the grassy pass facing the Pir Panjal and Parvati ranges, then down to Malana, a village with its own rules: don't touch its walls or people" },
    ],
  },

  "kareri-lake": {
    near: "Kangra, Himachal Pradesh",
    stops: [
      { name: "Kareri", q: "Kareri village", at: [32.27896, 76.27862] },
      { name: "Kareri Lake", at: [32.32565, 76.27389] },
    ],
    camps: { Rioti: ["Kareri", "Kareri Lake", 0.6, ["Reoti", "Riyoti", "Rewati"]] },
    days: [
      { to: "Rioti", note: "Up the Nyund stream from Kareri village, crossing it on rocks and small bridges" },
      { to: "Kareri Lake", note: "A short climb to the lake below the Dhauladhar, with a small Shiva temple" },
      { to: "Kareri", note: "Back down the stream to the village" },
    ],
  },

  "sar-pass": {
    near: "Kullu, Himachal Pradesh",
    stops: [
      { name: "Kasol", at: [32.01043, 77.3166] },
      { name: "Sar Pass", at: [31.96368, 77.38728] },
      { name: "Biskeri Thach", q: "Biskeri", at: [31.95217, 77.40626] },
      { name: "Barshaini", at: [31.99913, 77.44969] },
    ],
    camps: { Grahan: ["Kasol", "Sar Pass", 0.35, ["Grahan Village"]], "Min Thach": ["Kasol", "Sar Pass", 0.6, ["Mingthach", "Min Thatch", "Mangthach"]], Nagaru: ["Kasol", "Sar Pass", 0.85, ["Nagaroo", "Nagru"]] },
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
      { name: "Mantalai", at: [31.86779, 77.78389] },
      { name: "Pin Parvati Pass", at: [31.8355, 77.84444] },
      { name: "Mud", at: [31.959, 78.03241] },
    ],
    camps: { "Pin Valley Camp": ["Pin Parvati Pass", "Mud", 0.3, ["Pin Valley Base Camp"]], Tiya: ["Pin Parvati Pass", "Mud", 0.65, ["Tiya Camp", "Tia"]] },
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
      { name: "Litham", at: [31.36158, 78.10317] },
      { name: "Buran Ghati", at: [31.38742, 78.14567] },
      { name: "Barua", at: [31.4682, 78.17846] },
    ],
    camps: { "Dayara Thach": ["Janglik", "Litham", 0.45, ["Dayara", "Diyara"]], Dhunda: ["Litham", "Buran Ghati", 0.6, ["Dunda", "Dhunda Camp"]], Munirang: ["Buran Ghati", "Barua", 0.3, ["Munirang Camp", "Muni Rang"]] },
    days: [
      { to: "Dayara Thach", note: "Up from Janglik through forest onto one of the finest meadows in Himachal" },
      { to: "Litham", note: "Down through birch to Litham, below the Chandranahan waterfall" },
      { to: "Litham", side: { name: "Chandranahan Lake", km: 8, up: 600 }, note: "Up to the glacial lakes at the source of the Pabbar river, and back to camp" },
      { to: "Dhunda", note: "A steep climb to the snowy camp below the pass" },
      { to: "Munirang", via: ["Buran Ghati"], note: "Up to the pass at 4,570 m, then a roped rappel down the snow wall on the far side" },
      { to: "Barua", note: "Down through forest and apple orchards into Kinnaur" },
    ],
  },

  "kashmir-great-lakes": {
    near: "Ganderbal, Jammu and Kashmir",
    stops: [
      { name: "Sonamarg", at: [34.30239, 75.29656] },
      { name: "Vishansar Lake", q: "Vishansar", at: [34.38746, 75.11887] },
      { name: "Gadsar Lake", q: "Gadsar", at: [34.4218, 75.05747] },
      { name: "Gangbal Lake", q: "Gangbal campsite", at: [34.42556, 74.94058] },
      { name: "Naranag", at: [34.35023, 74.97212] },
    ],
    camps: {
      Nichnai: ["Sonamarg", "Vishansar Lake", 0.45, ["Nichinai", "Nichnai Camp"]],
      "Nichnai Pass": ["Sonamarg", "Vishansar Lake", 0.7, ["Nichinai Pass", "Nichinai Bal", "Nichnai Bal"]],
      "Gadsar Pass": ["Vishansar Lake", "Gadsar Lake", 0.5, ["Gadsar Bal"]],
      Satsar: ["Gadsar Lake", "Gangbal Lake", 0.45, ["Satsar Lake", "Satsar Lakes", "Satsar Camp"]],
      "Zaj Pass": ["Gadsar Lake", "Gangbal Lake", 0.75, ["Zach Pass", "Zajibal Pass", "Zajibal"]],
    },
    days: [
      { to: "Nichnai", note: "Up from Sonamarg through maple and birch to a valley of meadows" },
      { to: "Vishansar Lake", via: ["Nichnai Pass"], note: "Over Nichnai Pass and down to camp beside Vishansar, with Kishansar above it" },
      { rest: "A day at the twin lakes: walk up to Kishansar" },
      { to: "Gadsar Lake", via: ["Gadsar Pass"], note: "Over Gadsar Pass, the trek's highest, with both lakes below you, then down to Gadsar" },
      { to: "Satsar", note: "Through meadows to the seven lakes of Satsar. There's an army check post on the way: carry ID" },
      { to: "Gangbal Lake", via: ["Zaj Pass"], note: "Over boulders and Zaj Pass to the twin lakes of Gangbal and Nundkol, under Harmukh" },
      { to: "Naranag", note: "A steep descent through pine forest to Naranag's ancient temples" },
    ],
  },

  "tarsar-marsar-trek": {
    near: "Anantnag, Jammu and Kashmir",
    stops: [
      { name: "Aru", at: [34.09029, 75.26244] },
      { name: "Lidderwat", at: [34.17209, 75.25476] },
      { name: "Tarsar Lake", q: "Tar Sar", at: [34.1320, 75.14] },
      { name: "Sundersar", at: [34.15611, 75.11275] },
      { name: "Marsar Lake", q: "Mar Sar", at: [34.14426, 75.10983] },
    ],
    camps: {
      Shekwas: ["Lidderwat", "Tarsar Lake", 0.5, ["Shekwas Camp", "Shekhwas", "Homwas"]],
      "Tarsar Pass": ["Tarsar Lake", "Sundersar", 0.5, ["Tarsar Top"]],
    },
    days: [
      { to: "Lidderwat", note: "Up the Lidder river from Aru through pine and meadows" },
      { to: "Shekwas", note: "Into a side valley to a camp ringed by peaks" },
      { to: "Tarsar Lake", note: "A short climb to the almond-shaped lake, the trek's showpiece" },
      { to: "Sundersar", via: ["Tarsar Pass"], note: "Over the Tarsar pass to a quiet lake camp" },
      { to: "Sundersar", via: ["Marsar Lake"], note: "Up to the ridge above Marsar, often under cloud, and back" },
      { to: "Lidderwat", note: "Back down the valley" },
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
    stops: [
      { name: "Yuksom", at: [27.36924, 88.21848] },
      { name: "Sachen", at: [27.41394, 88.19731] },
      { name: "Tshoka", at: [27.4327, 88.18163] },
      { name: "Dzongri", at: [27.47545, 88.16025] },
      { name: "Thansing", at: [27.51688, 88.18392] },
      { name: "Lamuney", at: [27.5456, 88.18604] },
      { name: "Samiti Lake", at: [27.56166, 88.18738] },
      // Viewpoint 1, where treks now turn round; Goecha La itself is closed to trekkers
      { name: "Goechala Viewpoint 1", q: "View Point 1", optional: true },
    ],
    side: [{ name: "Dzongri Top", optional: true }],
    days: [
      { to: "Sachen", note: "Out of Yuksom into dense forest" },
      { to: "Tshoka", note: "Over the Prekchu on a high bridge and up to a small Tibetan settlement" },
      { to: "Dzongri", note: "Through rhododendron forest to the open Dzongri meadow" },
      { rest: "Acclimatisation day: up Dzongri Top at dawn for Kanchenjunga and Pandim" },
      { to: "Thansing", note: "Down to the Prekchu and along its valley, Pandim above" },
      { to: "Lamuney", note: "A short walk to the last camp" },
      { to: "Thansing", via: ["Samiti Lake", "Goechala Viewpoint 1"], note: "Leave around 2 am, past Samiti Lake to the viewpoint facing Kanchenjunga at sunrise, then back down" },
      { to: "Tshoka", note: "A long descent the way you came, skipping Dzongri" },
      { to: "Yuksom", note: "Down through the forest to Yuksom" },
    ],
  },

  "sandakphu-phalut-trek": {
    near: "Darjeeling, West Bengal",
    stops: [{ name: "Manebhanjan", q: "Maneybhanjang", at: [26.98863, 88.12034] }, { name: "Tumling", at: [27.03126, 88.06896] }, { name: "Sandakphu", at: [27.10444, 88.00048] }, { name: "Phalut", at: [27.20754, 88.01583] }, { name: "Gorkhey", at: [27.18744, 88.07195] }],
    camps: { Kalipokhri: ["Tumling", "Sandakphu", 0.6, ["Kalipokhari", "Kali Pokhari", "Kalpokhari", "Kalipokhri Lake"]] },
    days: [
      { to: "Tumling", note: "A steep climb out of Manebhanjan past Chitrey's monastery, along the India-Nepal border" },
      { to: "Kalipokhri", note: "Through Singalila National Park's forest to the 'black lake'" },
      { to: "Sandakphu", note: "Up the last steep stretch to West Bengal's highest point, facing Kanchenjunga and Everest" },
      { to: "Phalut", note: "Along the open ridge, the finest walk of the trek" },
      { to: "Gorkhey", note: "Down through forest to a riverside village" },
    ],
  },
};
