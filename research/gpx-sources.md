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
