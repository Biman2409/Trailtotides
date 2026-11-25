# GPS tracks for the treks with no trail yet

Checked 2026-11-25. OpenStreetMap (paths, place names, public GPS traces) doesn't cover these routes
well enough to build them (see the note at the top of scripts/trek-configs.mjs). The tracks below
are on Wikiloc, where each belongs to the person who recorded it; Wikiloc's terms are personal use.

**How they're used (2026-11-25, the owner's decision):** as a reference only, never copied. The
camps and guide points every 350 m are read off the downloaded tracks (kept outside the repo) into
each trek's `guide` in scripts/trek-configs.mjs, and our own line is drawn between them, over
OpenStreetMap's paths where they match and along the terrain elsewhere. Built this way:
bagini-glacier, phulara-ridge, surya-top, ranthan-kharak, gulabi-kantha (to Seema Thatch; the
summit has no track), doodhpathri (the lakes loop from Tosa Maidan, joined to OSM's paths from
Doodhpathri to Gurwansar), and madhmaheshwar above Gaundar ("Madhyamaheswar to Ransi",
[89441101](https://www.wikiloc.com/hiking-trails/madhyamaheswar-to-ransi-89441101), 2021). Bajre Dara has no track anywhere yet.

| Trek | Track on Wikiloc | Recorded by | What it covers |
|---|---|---|---|
| Bagini Glacier | [Starting point of the trek to Dronagiri campsite](https://www.wikiloc.com/hiking-trails/starting-point-of-the-trek-to-dronagiri-campsite-291018089), [Dronagiri to Langatuli](https://www.wikiloc.com/hiking-trails/dronagiri-to-langatuli-292067419), [Changabang B.C to Langatuliy](https://www.wikiloc.com/hiking-trails/changabang-b-c-to-langatuliy-292067416) | White Magic Guides (White Magic Adventure, an operator in our data), Oct 2026 | The whole route, Jumma to Changabang base camp, in three legs |
| Phulara Ridge | [Phullara ridge](https://www.wikiloc.com/hiking-trails/phullara-ridge-237035147) | tansher | 25 km out and back, top 3,548 m |
| Phulara Ridge | [Fulara trek](https://www.wikiloc.com/hiking-trails/fulara-trek-170238688) | the mountain adventures (an operator) | 19.5 km one way, top 3,533 m |
| Surya Top | [Surya top ih](https://www.wikiloc.com/hiking-trails/surya-top-ih-241332541) | mayankbehl | 31.5 km, top 3,915 m (on an Indiahikes trek) |
| Surya Top | [Dayara-surya-bakriya-dec 25](https://www.wikiloc.com/hiking-trails/dayara-surya-bakriya-dec-25-244540999) | (not checked) | Dayara, Surya Top and Bakaria |
| Ranthan Kharak | [Ranthan top trek](https://www.wikiloc.com/hiking-trails/ranthan-top-trek-207943493) | Rahul Shekar | 15.8 km one way, top 3,927 m |
| Doodhpathri | [Greater lakes trek Tosamaidan](https://www.wikiloc.com/outdoor-trails/greater-lakes-trek-tosamaidan-82554051) | Khan Ammaar, Aug 2021 | 53 km loop through the lakes, top 4,179 m (6,727 points) |
| Doodhpathri | [Ashtaar valley](https://www.wikiloc.com/hiking-trails/ashtaar-valley-172878113), [Gurwansar Lakes](https://www.wikiloc.com/hiking-trails/gurwansar-lakes-161261096), [Ashtaar to Doodhpathri](https://www.wikiloc.com/hiking-trails/ashtaar-to-doodhpathri-difficult-146093908) | (not checked) | Parts of the route |
| Gulabi Kantha | [Nishni to Kandola Thach (Gulabi Kantha)](https://www.wikiloc.com/hiking-trails/nissnnii-se-knddolaa-thaac-gulaabii-kaantthaa-189556369) | ankitrawat478 | Only the first 2.7 km; [Benkula to Hanuman Chatti via Kandola and Nishni](https://www.wikiloc.com/hiking-trails/21-05-2015-08-51-benkula-to-hanuman-chatti-via-kandola-and-nishni-13063390) may cover more |
| Bajre Dara | none found | | |
| Panch Kedar | not looked for: five temple walks joined by road | | |

Also seen: OpenStreetMap public GPS traces in these areas (open licence, usable), but they're
sparse, points far apart, and don't give a usable line on their own. Tripole's Gulabi Kantha DIY
blog mentions a GPX file of its own route (an operator: ask them).

## Permission request (send from the Wikiloc account or by email)

> Hi, I run Trail to Tides (trailtotides.com), a site that helps trekkers in India find and compare
> treks. Your [trek name] track on Wikiloc is the most accurate record of the route we've found.
> May we use it to draw the route on our map and offer it as a GPX download on the trek's page? We'd
> credit you by name with a link to your Wikiloc profile, and remove it any time you ask.

## Stretches with no tracking data (checked 2026-11-25)

29 stretches on 20 trails, 14.3 km in all (Panch Kedar's 0.6 km is Kalpeshwar's). Each is drawn
straight and marked "no tracking data". The Wikiloc track listed is the likeliest to cover it,
chosen by its name and start; check it once downloaded (download.do?id=<id>, File → Original).

| Trek | Stretch | Length | Track to try (Wikiloc id) |
|---|---|---|---|
| Pangarchulla Peak | Khullara → summit, km 10.5–12.5 | 1,990 m | Khullara to Pangarchulla Peak (170404519) |
| Kedartal | Gangotri → Kedar Kharak, km 4.8–6.8 and 7.8–8.0 | 1,980 + 160 m | Gangotri to Kedar Khadak (84498203) |
| Kedartal | Kedar Kharak → Kedartal, km 10.7–10.9 | 220 m | Kedar Khadak to Kedartal (84498194) |
| Doodhpathri | Gurwansar → Tosa Maidan, km 14.4–16.1 | 1,700 m | Gurwansar Lakes (161261096) |
| Ali Bedni Bugyal | Ali Bugyal → Bedni Bugyal, km 17.9–18.9 | 940 m | Ali Bedni day 3, Ali to Bedni (248099772) |
| Dodital Darwa Pass | Dodital → Darwa Pass, km 21.1–21.9 | 820 m | Dodital to Darwa Pass (41402764) |
| Dodital Darwa Pass | Manjhi → Dodital, km 14.6–14.8 and 15.4–15.6 | 190 + 190 m | Agoda to Dodital (13062978) |
| Kalpeshwar (and Rudranath Kalpeshwar, Panch Kedar) | Kalpeshwar → towards Bansi Narayan | 620 m | Kalpeshwar to Dumak (233304479) |
| Goechala | Samiti Lake → Viewpoint 1, km 31.4–32.0 | 600 m | Lamuney to Goecha La Viewpoint 1 (189045851) |
| Dayara Bugyal | Gui → Dayara Bugyal, km 11.2–11.8 | 550 m | Dayara Bugyal trek (62031585) |
| Bali Pass | Bali Pass → Janki Chatti, km 38.1–38.7 | 540 m | Upper Dhamni to Bali Pass (41744786) |
| Rupin Pass | Sewa → Buras Kandi, km 18.4–18.7; past the pass, km 41.8–41.9 and 48.2–48.5 | 330 + 160 + 240 m | Rupin Pass trek (42721841) |
| Har Ki Dun | Osla → Har Ki Dun, km 22.4–22.7 | 310 m | Seematra, Har Ki Dun, Marinda Tal (41748563) |
| Pindari Glacier | Khati → Dwali, km 7.4–7.7; Dwali → Phurkia, km 11.5–11.7 | 310 + 180 m | Khati to base camp (214436475) |
| Tarsar Marsar | Aru → Lidderwat; Tarsar Pass → Sundersar → Marsar | 200 + 300 + 280 m | Tarsar Marsar one way (144544619) |
| Pin Parvati Pass | Odi Thach → Mantalai, km 41.0–41.2 | 270 m | none found |
| Kashmir Great Lakes | Gadsar → Gangbal, km 45.2–45.4 | 200 m | KGL 4, Gadsar to Satsar (114915491) |
| Kashmir Great Lakes | Sonamarg → Vishansar, km 12.5–12.7 | 190 m | KGL 1, Shekhdur to Nichnai (114927915) |
| Buran Ghati | Dayara Thach → Litham, km 12.0–12.2 | 180 m | Buran Ghati day 2, Dayara to Litham (140353544) |
| Gaumukh Tapovan | Bhojbasa → Gaumukh, km 18.3–18.5 | 180 m | Bhojwasa to Gaumukh (2158417) |
| Kareri Lake | Kareri → Kareri Lake, km 0.4–0.6 | 170 m | Kareri village to Kareri Lake (56272230) |

Bajre Dara: searched again around Yuksom, Pelling and Khecheopalri; still no track of the route.

### Status after the first batch (2026-11-25)

Closed: Pindari Glacier (both gaps; commit 21e4c78a). Chains ready in `gapGuides`, waiting for a
rebuild (BRouter was refusing requests): Kedartal (Gangotri → Kedar Kharak), Ali Bedni Bugyal,
Dodital (Manjhi → Dodital, both bits), Kashmir Great Lakes (both bits). Rebuild with
`node scripts/build-trail.mjs <slug> --force`, one at a time.

The downloaded track didn't reach the gap (turned back, or took another line); try instead:
Pangarchulla summit 297186125 or 121679013 · Darwa top 13063044 · Kalpeshwar 29075858 ·
Goechala Viewpoint 1 11358610 · Dayara (Gui) 43944224 and 44398444 · Bali Pass descent 41744144 and
41438326 · Rupin Pass 42721768 and 135879090 · Kareri 217553251 · Kedar Kharak → Kedartal 84498194.
Not downloaded yet: Doodhpathri 161261096, Tarsar Marsar 144544619.
Not route gaps: Buran Ghati (Litham), Gaumukh and Har Ki Dun are short stubs from the path to a
camp marker placed off it; moving the marker onto the path would close them.
No track anywhere: Pin Parvati (Odi Thach → Mantalai), Bajre Dara.
