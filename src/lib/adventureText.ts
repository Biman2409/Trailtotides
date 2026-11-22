// Server only: the long "skip it if" and safety text for each adventure. Kept out of data.ts so
// it isn't in the JavaScript every page downloads; only the adventure page and trek guide (both
// rendered on the server) read it, through textOf().

export interface AdventureText { whoNot: string; safetyNotes: string }

const ADVENTURE_TEXT: Record<string, AdventureText> = {
  "manali-leh-bike-expedition": {
    whoNot: "You'd sleep at Sarchu (4,300m) without acclimatising first: spend 2 nights in Manali · You've never ridden on gravel or through streams · You need phone signal: prepaid SIMs from outside Ladakh and J&K don't work there (postpaid does) · Your dates can't move: landslides close the road for hours or days",
    safetyNotes: "Carry a basic repair kit, spare clutch cable, and fuel for 150km stretches. Altitude sickness is real — acclimatise in Manali for 2 days minimum. Ride before noon to avoid afternoon weather.",
  },
  "spiti-valley-cycling": {
    whoNot: "You've never toured loaded: this is not the place to learn · You'd rely on shops along the way: food and spares are far apart · You'd count on Google Maps: download offline maps, it fails here",
    safetyNotes: "Carry CO2 cartridges, a multi-tool, and spare brake cables. First aid kit essential. Download offline maps — Google Maps fails here.",
  },
  "ladakh-circuit": {
    whoNot: "You'd skip acclimatisation: riding to 5,000m+ passes straight from the plane is dangerous · You won't get an Inner Line Permit: Nubra, Pangong and Hanle need one (operators arrange it online) · You need phone signal: prepaid SIMs from outside Ladakh and J&K don't work there (postpaid does) · You have a heart, lung or blood-pressure condition without a doctor's OK for very high altitude",
    safetyNotes: "Spend minimum 3 days acclimatising in Leh before starting. Carry oxygen, full repair kit, and satellite communicator. Fuel up whenever possible — stations are 200km+ apart. File a route plan with local police.",
  },
  "zanskar-valley-bike": {
    whoNot: "Your bike has road tyres or low clearance · You've never crossed a river on a bike: cross in the morning, before glacier melt raises them · You'd ride alone",
    safetyNotes: "Carry a satellite phone — there is no mobile signal in Zanskar. River crossings should only be attempted in the morning before glacial melt raises water levels. Always ride in pairs minimum.",
  },
  "kedarkantha-trek": {
    whoNot: "Long mountain drives make you sick: Dehradun to Sankri is 8–10 hours each way · You hate being cold: winter nights in tents are well below freezing · You're going after mid-April and want snow: by then most of it has melted",
    safetyNotes: "Start the summit push around 3am to top out at sunrise, before clouds build. Carry microspikes in January–February. Turn back from the summit cone in high wind.",
  },
  "sandakphu-phalut-trek": {
    whoNot: "You want a roadless trail: old Land Rovers drive up to Sandakphu · You're going in Jun–Aug: monsoon cloud hides the mountains · Ice worries you: the ridge path can be icy in Dec–Jan (microspikes help)",
    safetyNotes: "The Indian side requires a permit from the Darjeeling DFO. Nepal side checkposts require passport copies. The ridge path can be icy December–January — carry microspikes.",
  },
  "tarsar-marsar-trek": {
    whoNot: "You need phone signal: prepaid SIMs from outside J&K don't work there (postpaid does) · You can only go outside Jul–Aug: snow or closures make the route unreliable · You'd skip registering: the forest checkpost at Aru needs your details and ID",
    safetyNotes: "Aru requires Pahalgam-area permits for foreigners. The pass between Tarsar and Marsar is steep and can be snowy in July. Register at the Forest Department checkpost at Aru before starting.",
  },
  "spiti-valley-bike": {
    whoNot: "You're going before late June: Kunzum La can still be snowbound · You don't have proper cold-weather riding gear: passes are near freezing even in summer · Your dates can't move: landslides and snow close roads without warning",
    safetyNotes: "Kunzum La can be snowbound until late June — check pass status before departure. Carry chain lube, tyre plugs, and a basic toolkit. Fuel up at Kaza — it's the last pump for 130km.",
  },
  "ali-bedni-bugyal": {
    whoNot: "Leeches put you off: the forest sections have them in May–Jun · Long drives wreck you: Kathgodam to Lohajung is 10–11 hours each way · Your knees hate long descents: the way down through the forest is steep",
    safetyNotes: "Carry warm layers — nights drop sharply even in summer. Leeches on trail May–Jun; wear gaiters.",
  },
  "annapurna-base-camp": {
    whoNot: "Your knees hate long descents: much of the way down is steep stone stairs · You have a heart, lung or blood-pressure condition without a doctor's OK for 4,000m · You're going after heavy snow: the Deurali to Machhapuchhre stretch has avalanche risk · You're going in the monsoon (Jun–Aug): leeches, landslides on the road, clouded views",
    safetyNotes: "Altitude sickness risk above 3,500m. Acclimatise at Chhomrong. Avalanche risk on upper section in heavy snowfall.",
  },
  "annapurna-circuit": {
    whoNot: "You have a heart, lung or blood-pressure condition without a doctor's OK for 5,400m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · Your dates can't move: snow can close Thorong La for days, most often Dec–Feb · You want roadless wilderness: road dust and traffic reach Manang and Muktinath",
    safetyNotes: "Thorong La (5,399m) crossing should begin by 4am. Acclimatise 2 nights at Manang. Descend immediately at first AMS symptoms.",
  },
  "bagini-glacier": {
    whoNot: "Your ankles are weak: the last stretch to base camp is loose moraine with no trail · You're going in Jul–Aug: monsoon landslides close the route · You plan to go without a local guide: the upper trail is unmarked",
    safetyNotes: "No teahouses — full camping gear required. Glacier moraines are loose near the snout. Go with an experienced local guide from Pipalkoti.",
  },
  "bali-pass": {
    whoNot: "It's your first Himalayan trek · Steep, exposed snow scares you: the descent towards Yamunotri is steep · You haven't acclimatised: pass day climbs to 4,940m",
    safetyNotes: "Bali Pass crossing involves snow slopes up to 40°. Crampons and rope may be needed early season. Leave pass camp by 4am on crossing day.",
  },
  "buran-ghati": {
    whoNot: "It's your first Himalayan trek · Steep snow and heights scare you: the rope descent is the only way down · Long drives make you sick: Shimla to Janglik is 6–7 hours",
    safetyNotes: "Rappel section requires fixed ropes — only cross with guides and certified ropes. Snow depth varies by season.",
  },
  "beas-kund": {
    whoNot: "Rain gets you down: Jul–Aug is wet and the Solang road can close · You want solitude: it's one of Manali's most popular short treks · Loose ground worries you: the last stretch to the lake is moraine",
    safetyNotes: "Solang Valley to Dhundi road sometimes closed in heavy rain. Stay on trail near the kund — loose moraine underfoot.",
  },
  "bhrigu-lake": {
    whoNot: "You've never been to altitude and can't take it slowly: it climbs fast, over 1,000m in two days · Thunderstorms worry you: afternoon storms are common in Jul–Aug",
    safetyNotes: "Altitude gain from Manali (2,050m) to lake (about 4,156m) is steep — take the ascent slowly. Afternoon thunderstorms common in July–August.",
  },
  "brahmatal": {
    whoNot: "You hate being cold: this trek only runs Dec–Mar · Long drives wreck you: Kathgodam to Lohajung is 10–11 hours each way",
    safetyNotes: "Carry good-quality sleeping bag rated to -15°C. Summit ridge can be icy — microspikes provided by operators. Leeches absent (winter), but frostbite risk on exposed skin.",
  },
  "dayara-bugyal": {
    whoNot: "You want solitude: it's one of Uttarakhand's busiest beginner treks · Long drives make you sick: Dehradun to Raithal is 6–7 hours each way",
    safetyNotes: "Trail is well-marked from Raithal. Afternoon clouds build quickly — reach bugyal campsite by 2pm. Stick to designated camping zones.",
  },
  "deoriatal-chandrashila": {
    whoNot: "You want solitude: Tungnath is crowded with pilgrims in May–Jun and on weekends · Long drives make you sick: Rishikesh to Sari is about 8 hours · You're going in Jul–Aug: monsoon landslides block the roads",
    safetyNotes: "Chandrashila summit (3,690m) can be windy and cold even in April. Start summit attempt by 5am for clear views before cloud builds.",
  },
  "everest-base-camp": {
    whoNot: "You have a heart or lung condition, or high blood pressure, without a doctor's OK for 5,000m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · Your dates can't move: weather cancels Lukla flights often, sometimes for days · Small planes scare you: the only quick way in is a flight to Lukla's mountain airstrip · You want quiet trails in Oct–Nov or Apr–May: Gokyo Lakes is calmer",
    safetyNotes: "Acclimatise at Namche (2 nights) and Dingboche (2 nights). Descend immediately at any AMS symptoms. Khumbu Icefall debris occasionally affects BC area — stay aware.",
  },
  "gaumukh-tapovan": {
    whoNot: "Your ankles are weak: the glacier section has no trail, only boulders · Rockfall makes you nervous: the stretch near Gaumukh's snout has loose rock above · You're going in Jul–Aug: monsoon washouts and rockfall · You'd go last-minute: national park permits are limited each day",
    safetyNotes: "Gangotri Glacier moraine is loose and slippery. Gaumukh section requires careful footing — no fixed trail on the glacier. Trek with an experienced guide.",
  },
  "goechala": {
    whoNot: "You'd go without a licensed Sikkim guide: it's mandatory, and permits depend on it · You're going in Jun–Aug: the monsoon closes the route · You have a heart, lung or blood-pressure condition without a doctor's OK for 5,000m",
    safetyNotes: "All trekkers must have inner-line permits for Kanchendzonga NP (arrange in Gangtok or Yuksom). Go with a licensed Sikkim guide — mandatory. No solo trekking permitted.",
  },
  "hampta-pass": {
    whoNot: "Cold-water stream crossings put you off: they're unavoidable on the Kullu side · You want solitude: it's Himachal's busiest pass trek in Jul–Aug",
    safetyNotes: "Stream crossings on Jobra side are knee-deep in monsoon — use trekking poles. Snow on pass even in August — carry extra layers. Check pass conditions with local operators before departure.",
  },
  "har-ki-dun": {
    whoNot: "You want a summit or a pass: it's a valley walk to a meadow · Long drives make you sick: Dehradun to Sankri is 8–10 hours each way",
    safetyNotes: "Trail is well-defined. River crossings on log bridges — check stability. Forest sections can be confusing — stay on main trail.",
  },
  "kashmir-great-lakes": {
    whoNot: "You won't carry original ID: army checkposts on the route check it several times · You need phone signal: prepaid SIMs from outside J&K don't work there (postpaid does) · You can only go in June or September: the route is usually closed",
    safetyNotes: "Gadsar Pass (4,191m) involves snow even in August — carry microspikes. The route requires permits from authorities in Srinagar/Sonamarg. Go with a registered Kashmiri guide.",
  },
  "kedartal": {
    whoNot: "It's your first Himalayan trek · You're afraid of heights · You want a gentle start: it climbs about 1,300m of steep trail in 2–3 days from Gangotri",
    safetyNotes: "Trail involves Class 2 scrambling on loose boulders above Kedarkharak. No rescue access. Go with experienced local guide from Gangotri.",
  },
  "kuari-pass": {
    whoNot: "You hate being cold: it's a winter trek, Dec–Mar · Long drives make you sick: Rishikesh to Joshimath is 9–10 hours · You're picturing green meadows: in season, it's all snow",
    safetyNotes: "Winter nights drop to -15°C. Carry proper sleeping gear. Trail is well-managed but snow can be deep — go with an operator who carries avalanche safety basics.",
  },
  "markha-valley": {
    whoNot: "You'd fly into Leh and start straight away: skipping acclimatisation is how people get sick here · You have a heart, lung or blood-pressure condition without a doctor's OK for 5,200m · You need phone signal: prepaid SIMs from outside Ladakh and J&K don't work (postpaid does)",
    safetyNotes: "River crossings at Chilling and Skiu can be thigh-deep in July — use poles. Acclimatise minimum 3 nights in Leh before starting. Kongmaru La (5,260m) is serious altitude.",
  },
  "pin-parvati-pass": {
    whoNot: "It would be your first hard trek · You'd go with an operator without certified mountain guides and rope teams · Your dates can't move: weather on the pass decides the crossing day",
    safetyNotes: "Glacier crossing requires crampons, ropes, and ice axes. Crevasse risk is real — never cross without a rope team. Book with an operator who employs certified mountain guides.",
  },
  "rupin-pass": {
    whoNot: "It's your first Himalayan trek · Your knees hate long descents: the way down to Sangla is long and steep · Being cold and wet gets to you: the waterfall campsite is both",
    safetyNotes: "Pass gully is 45°+ in early season — crampons may be needed. Waterfall campsite is cold and wet — waterproof gear essential.",
  },
  "valley-of-flowers": {
    whoNot: "Your dates can't move: monsoon landslides often block the road to Govindghat · You want to camp in the valley: overnight stays inside the park aren't allowed · Your knees hate long descents and you plan to do Hemkund: the way down is steep",
    safetyNotes: "Hemkund staircase is steep and relentless. Take it slow — the thin air at 4,329m compounds the effort. Valley of Flowers closed November–April.",
  },
  "bajre-dara": {
    whoNot: "You hate being cold: it's a winter trek · You want rhododendrons in bloom: that's spring, outside this trek's season · Long drives make you sick: Bagdogra to Yuksom is 7–8 hours",
    safetyNotes: "Winter temperatures can drop sharply at night — quality sleeping bag essential. Trail can be icy in January and February. Carry a local guide from Yuksom.",
  },
  "chandrakhani-pass": {
    whoNot: "You can't follow strict local rules: in Malana you must not touch walls, temples or people, and fines apply · You're going in Jul–Aug: monsoon fog often hides the views · You want high altitude or snow",
    safetyNotes: "Malana has strict cultural customs — follow all local rules about touching village structures or entering certain areas. Pass can be foggy in July–August monsoon. Carry extra rain gear.",
  },
  "dodital-darwa-pass": {
    whoNot: "You want the lake to yourself in May–Jun: pilgrims crowd Dodital · You're going before late May without snow gear: Darwa Pass can still hold deep snow · Wobbly log bridges over streams bother you",
    safetyNotes: "Darwa Pass can hold snow until late May. Dodital gets crowded during pilgrim season — camp early to secure a good spot. Trail well-marked but forest sections can be confusing.",
  },
  "doodhpathri": {
    whoNot: "You want snow peaks, glaciers or high passes · You need phone signal: prepaid SIMs from outside J&K don't work there (postpaid does) · You want any comforts: it's tents and shepherd huts",
    safetyNotes: "Permits required for foreign nationals. Trail is remote — carry extra food and a guide from Srinagar/Doodhpathri. Weather can change rapidly in August.",
  },
  "gokyo-lakes": {
    whoNot: "You have a heart, lung or blood-pressure condition without a doctor's OK for 5,300m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · Your dates can't move: weather cancels Lukla flights often, sometimes for days · Small planes scare you: the only quick way in is a flight to Lukla's mountain airstrip",
    safetyNotes: "Altitude sickness risk above 4,000m — strict acclimatization schedule essential. Ngozumpa Glacier crossing to reach higher lakes is crevassed — do not attempt solo. Nepal trekking permits required.",
  },
  "gulabi-kantha": {
    whoNot: "Long drives make you sick: Dehradun to Hanuman Chatti is 6–7 hours · You're going in the monsoon: the steep trail gets slippery",
    safetyNotes: "Trail can be slippery after rain in monsoon shoulder months. Night temperatures drop sharply at 4,000m even in summer — sleeping bag essential.",
  },
  "kareri-lake": {
    whoNot: "You want big Himalayan views or altitude: it tops out under 3,000m · You're going in June without care: snowmelt makes the river crossings strong",
    safetyNotes: "River crossings above Kareri village can be challenging in June snowmelt — check conditions. Campsite at the lake is exposed — cold nights even in September.",
  },
  "khopra-danda": {
    whoNot: "You plan to walk without a guide: the trail above Swanta is poorly marked · You want plenty of lodge choice and comforts: the villages here are small · You're going in the monsoon (Jun–Aug): leeches, and cloud hides the views",
    safetyNotes: "ACAP permit required. Some sections above Swanta are poorly marked — guide recommended. Cold nights at ridge camp even in April.",
  },
  "lobuche-peak": {
    whoNot: "You've never been above 5,000m: do Everest Base Camp or Gokyo first · Steep exposure scares you: the summit ridge is steep with big drops · You have a heart, lung or blood-pressure condition without a doctor's OK for 6,000m · Your dates can't move: Lukla flights and summit weather both cause delays",
    safetyNotes: "Technical climb requiring professional mountain guide and full climbing equipment. Pre-climb acclimatization on Kala Patthar or Island Peak strongly recommended. NMA climbing permit required.",
  },
  "manaslu-circuit": {
    whoNot: "You're going solo or without a guide: permits for this restricted area won't be issued · You have a heart, lung or blood-pressure condition without a doctor's OK for 5,100m · Rough roads wreck you: it's 8–9 hours by jeep on mountain roads to the trailhead · Your dates can't move: snow can close Larke La for days",
    safetyNotes: "Restricted area permit required (MCAP + MRAP). Must trek with registered guide — no independent trekking permitted. Larke Pass crossing requires early morning start. Altitude illness risk above 4,500m.",
  },
  "mera-peak": {
    whoNot: "You've never been above 5,000m: the summit is 6,476m · You've had altitude sickness above 4,500m · You have a heart, lung or blood-pressure condition without a doctor's OK for 6,500m · Your dates can't move: Lukla flights and summit weather both cause delays",
    safetyNotes: "NMA permit required. Must be accompanied by certified mountain guide at all times above base camp. Summit push is 8–10 hours on glacier — early start essential. Weather window narrow in Nepal.",
  },
  "panch-kedar": {
    whoNot: "Crowds bother you: Kedarnath has huge pilgrim crowds in May–Jun · You're going from late October: the temples close for winter · You want a quiet wilderness trek: much of the way is a pilgrim route",
    safetyNotes: "Temples close by late October — verify opening dates before booking. Some sections between Rudranath and Kalpeshwar are poorly marked. Local guide strongly recommended for the full circuit.",
  },
  "pangarchulla-peak": {
    whoNot: "You've never done a Himalayan trek · You're going after April: the snow melts and the summit block turns to loose rock · Long drives make you sick: Rishikesh to Joshimath is 9–10 hours",
    safetyNotes: "Snow conditions vary year to year — check with operators for March snowpack. Summit push in pre-dawn conditions requires headlamp and warm layers. Crampon training provided by operators on approach days.",
  },
  "panwali-kantha": {
    whoNot: "You'd go without a local guide: the trail beyond Ghuttu isn't marked · You want lodges or a busy trail: it's tents and very few people · You're going in autumn without spare water: sources up top are few",
    safetyNotes: "Trail is not well marked beyond Ghuttu — local guide essential. Meadow camp is completely exposed — carry quality tent and sleeping bag. Water sources limited in autumn.",
  },
  "phulara-ridge": {
    whoNot: "Wind and fast-moving cloud on an open ridge make you nervous · Long drives make you sick: Dehradun to Sankri is 8–10 hours each way · You want dense forest and rivers: most of it is above the trees",
    safetyNotes: "Ridgeline fully exposed to weather — strong wind and sudden cloud common. Carry waterproofs at all times. Snow possible in late October-November. Forest sections below ridge can be confusing.",
  },
  "pin-bhaba-pass": {
    whoNot: "Your knees hate long descents: the Spiti side is steep scree · It's your first Himalayan trek · Cold river crossings scare you: the Bhaba streams run high in July",
    safetyNotes: "Pass can hold snowfields even in August — crampons or micro-spikes recommended. Spiti side descent is steep scree. River crossings in Bhaba Valley can be challenging in July snowmelt.",
  },
  "pindari-glacier": {
    whoNot: "You want to walk on the glacier itself: the trail ends at Zero Point, facing it · You won't carry cash: there are no ATMs past Song · Bears worry you: the forests are black-bear country (make noise as you walk)",
    safetyNotes: "Trail is well-maintained and marked. River crossings near Dwali can be strong in June. Black bear habitat — make noise on trail in forest sections. Carry sufficient cash as no ATMs beyond Song.",
  },
  "ranthan-kharak": {
    whoNot: "You'd go without a local guide: there's no marked trail beyond the upper forest · You need to stay reachable: there's almost no phone signal · You want lodges or any comforts",
    safetyNotes: "No marked trail beyond upper forest — local guide from Kathgodam area essential. Meadow is completely exposed — carry quality camping gear. Very limited phone coverage.",
  },
  "roopkund": {
    whoNot: "It's your first Himalayan trek · You'd book without checking: access past Bhagwabasa has been restricted at times, so confirm with the operator · Fast-changing weather worries you: the upper section turns dangerous quickly",
    safetyNotes: "Roopkund has had a controversial trekking ban — verify current permit status before booking. Ali Bedni route is fine regardless. Weather above Bhagwabasa can deteriorate extremely rapidly. Crampons essential on final approach.",
  },
  "sar-pass": {
    whoNot: "You want solitude: it's a popular, busy trail · You're going after June: the snow, and the slide, are gone",
    safetyNotes: "Most trekkers cross Sar Pass in an organised group. Snow conditions vary year to year — call ahead for May snowpack. High pass crossing requires warm layers even in June.",
  },
  "satopanth-lake": {
    whoNot: "Your ankles are weak: much of the way is boulders, with no proper trail · Fast snowmelt streams scare you: there are river crossings · You'd go without a local guide: the route isn't marked · Long drives make you sick: Rishikesh to Badrinath is 10–11 hours",
    safetyNotes: "Trail involves boulder scrambling above Vasundhara Falls and glacier moraine navigation. River crossings can be dangerous in snowmelt. No rescue access beyond Badrinath. Go with an experienced local guide.",
  },
  "surya-top": {
    whoNot: "You'd go without a local guide: the trail isn't marked · You want lodges or a well-trodden trail",
    safetyNotes: "Trail is not well-publicised — local guide essential from Natin Village. Summit plateau exposed to wind and weather. Very limited phone coverage throughout. Carry sufficient food and warm layers.",
  },
  "triund": {
    whoNot: "You want solitude: weekends and holidays bring big crowds to the ridge · You're going in July or August: heavy monsoon rain makes the path slippery and the views vanish",
    safetyNotes: "The last stretch is steep, rocky switchbacks — slow down on the way down. Snow can cover the ridge in winter (Jan–Feb). Nights are cold even in summer; carry warm layers. Carry your rubbish back down.",
  },
  "rudranath-kalpeshwar": {
    whoNot: "You'd go in winter: Rudranath is closed from about mid-October to May · You'd go without a local guide: the trails between the temples are poorly marked · You want a short or gentle trek",
    safetyNotes: "Rudranath is open roughly mid-May to mid-October — check the year's opening and closing dates before you go. Hire a local guide: paths between Kalpeshwar, Bansi Narayan and Dumak are faint and branch often. Water is scarce on the ridges above Panar; carry enough. Fog rolls in fast on the bugyals — stay on the trail. Monsoon (Jul–Aug) brings slippery paths and landslides on the roads to Helang and Gopeshwar.",
  },
  "yulla-kanda": {
    whoNot: "You don't want a long drive: Yulla Khas is a day's drive from Shimla · You'd go at Janmashtami for solitude: the festival brings large crowds",
    safetyNotes: "At nearly 3,900m, altitude sickness is possible — spend a night at Yulla Khas before going up. The road along the Sutlej through Kinnaur is prone to landslides, especially in the monsoon. Weather changes quickly near the lake; carry warm, waterproof layers.",
  },
  "rishikesh-river-rafting": {
    whoNot: "Children under 14 · Pregnancy, heart conditions, recent surgery or seizures · Anyone who panics in water and can't follow the guide's commands · Non-swimmers on the full Kaudiyala run · Travel in July–August, when rafting is closed for the monsoon",
    safetyNotes: "Raft only with a government-licensed operator: helmets, life jackets and a trained guide on every raft, ideally with a safety kayaker. Keep your life jacket fastened at all times, including the calm swims. If you fall in, float on your back, feet first and downstream, and wait for the rope or the kayak. Rafting closes from July to mid-September when the river floods; spring water is cold and autumn flows are higher, so ask for a wetsuit top early in the season. The Kaudiyala run's Grade IV rapids flip rafts more often; most operators set 18 as the minimum age there.",
  },
  "everest-base-camp-gokyo-lakes": {
    whoNot: "You have a heart or lung condition, or high blood pressure, without a doctor's OK for 5,600m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · Your dates can't move: weather cancels Lukla flights often, sometimes for days · You'd go in winter (Dec–Feb): snow and ice on the Cho La often make it unsafe to cross · Small planes scare you: the only quick way in is a flight to Lukla's mountain airstrip",
    safetyNotes: "Acclimatise properly: two nights at Namche and two at Gokyo before the Cho La. Start the pass before dawn and carry microspikes: the glacier at the top is often icy, and the far side is loose rock. Don't cross in fresh snow or cloud; wait a day at Dragnag. Descend at once at any sign of altitude sickness.",
  },
  "everest-three-passes": {
    whoNot: "It would be your first high-altitude trek: start with Everest Base Camp or Gokyo · You have a heart or lung condition, or high blood pressure, without a doctor's OK for 5,600m · You've had HAPE or HACE (fluid on the lungs or brain) at altitude before · You'd go in winter (Dec–Feb): snow often closes the passes · Your dates can't move: weather cancels Lukla flights often, sometimes for days",
    safetyNotes: "Gain height slowly: rest at Namche and at Lungden before the Renjo La, and only cross a pass when you feel well. Start each pass before dawn and carry microspikes: the Cho La top is a glacier, and the Kongma La route crosses the Khumbu glacier on unmarked moraine, so go with a guide who knows it. Don't cross in fresh snow or cloud. Descend at once at any sign of altitude sickness.",
  },
};

/** The adventure's "skip it if" list and safety notes; empty strings when none are written */
export function textOf(slug: string): AdventureText {
  return ADVENTURE_TEXT[slug] ?? { whoNot: "", safetyNotes: "" };
}

export const ADVENTURE_TEXT_SLUGS = Object.keys(ADVENTURE_TEXT);
