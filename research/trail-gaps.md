# Trail gaps: stretches with no mapped path

Checked 2026-11-25 on all 37 trails. A gap is 150 m or more of trail line over 40 m from any walkable
way in OpenStreetMap (`scripts/mark-unmapped.mjs`, reading local Geofabrik extracts of northern,
central, eastern and north-eastern India and Nepal). For each gap, in order:

1. **OpenStreetMap public GPS traces** (`scripts/find-traces.mjs`): a trace passing within 80 m of
   both ends. ODbL, so a match is used to draw the gap (`scripts/tracks/<slug>-km*.json`).
2. **ultrajourneys.org** (`scripts/research/fetch-ultrajourneys.mjs`, 120 posts, 24 track files;
   `scripts/research/compare-gap-tracks.mjs`): a track within 150 m of both ends. The site carries a
   copyright notice and no reuse licence, so its tracks only **verify** our line.
3. **Wikiloc, AllTrails, Gaia, Strava**: their terms don't allow republishing tracks; not downloaded.
4. No usable track: the gap is drawn as a **straight line** between its known ends and labelled
   "Tracking data unavailable for this section" on the trek page, the trek guide, both maps and in
   the GPX download.

Km are along the trail's main line as measured before the rebuild that straightened the gaps.

| Trail | Gap (km) | Length | OSM GPS traces | ultrajourneys.org | Result |
|---|---|---|---|---|---|
| Ali Bedni Bugyal | 17.9–18.9 | 1.0 km | none (1 piece nearby) | none | straight, labelled |
| Annapurna Base Camp | 85.0–85.3 | 0.2 km | **found** (chrischan, trace 1808996) | none | drawn along the trace |
| Bali Pass | 38.2–38.7 | 0.6 km | none (3 nearby) | none | straight, labelled |
| Chandrakhani Pass | 8.0–8.2 | 0.15 km | **found** (Papayaved, trace 1871174) | **verified**: our line within 2 m | covered by the leg's recorded track; no gap left |
| Dayara Bugyal | 11.2–11.9 | 0.6 km | none (3 nearby) | none | straight, labelled |
| Dodital – Darwa Pass | 14.6–14.8, 15.4–15.6, 21.0–22.0 | 1.3 km | none | none | straight, labelled |
| Gaumukh Tapovan | 18.3–18.5 | 0.2 km | none (5 nearby) | none | straight, labelled |
| Goechala | 31.4–32.1 | 0.6 km | none | none | straight, labelled |
| Har Ki Dun | 22.4–22.7 | 0.3 km | none (3 nearby) | none | straight, labelled |
| Kareri Lake | 0.4–0.6 | 0.2 km | none (18 nearby) | none | straight, labelled (the rest follows the leg's recorded track) |
| Kashmir Great Lakes | 3.8–3.9, 30.0–30.9 | 1.0 km | none | none | straight, labelled |
| Pangarchulla Peak | 10.5–12.6 | 2.1 km | none (3 nearby) | none | straight, labelled |
| Pin Parvati Pass | 41.0–41.2 | 0.3 km | none (2 nearby) | none | straight, labelled |
| Pindari Glacier | 7.4–7.7, 11.5–11.7 | 0.5 km | none | none | straight, labelled |
| Tarsar Marsar | 10.8–11.0, 34.8–35.1, 37.1–37.3 | 0.8 km | **found** for 34.8–35.1 (Zeeshan Mushtaq, trace 4272884) | none | 34.8–35.1 along the trace; others straight, labelled |

The other 22 trails have no gap.

## For a decision

- **Kareri Lake and Chandrakhani Pass** follow tracks recorded by ultrajourneys.org
  (`scripts/tracks/kareri-lake.json`, `chandrakhani.json`; so may `sar-pass.json` and
  `pin-valley.json`), set up in commit 5e408ead. ultrajourneys.org states copyright and no reuse
  licence, so by the rule above these should only verify the line. Options: ask the site's owner
  for permission, or rebuild those legs from OpenStreetMap and uploaded traces (Kareri's OSM path
  takes a longer way round by Raeel).
- The surest fix for any gap is to map the path in OpenStreetMap itself (from satellite imagery,
  uploaded traces, or Strava's heatmap, which OSM mappers may trace from): the next rebuild then
  follows it automatically.
