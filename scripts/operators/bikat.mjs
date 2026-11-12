/**
 * Usage: node scripts/operators/bikat.mjs
 *
 * Reads Bikat Adventures' own page for every adventure of ours they run and writes their offer
 * to research/offers/bikat.json. robots.txt (checked 12 Nov 2026) allows these public itinerary
 * pages; pages are read one at a time, a few seconds apart, with no login, forms or bookings.
 * Then run scripts/operators/apply-offers.mjs to put the offers on the site.
 */
import { writeFileSync, mkdirSync } from "fs";

const OPERATOR = "Bikat Adventures";
const BASE = "https://www.bikatadventures.com/Home/Itinerary/";

// Our adventure → Bikat's itinerary page. Only the same trip: a different route or activity is left out.
export const PAGES = {
  "kedarkantha-trek": "kedarkantha-trek",
  "sandakphu-phalut-trek": "sandakphu-trek",
  "tarsar-marsar-trek": "tarsar-marsar-trek",
  "ali-bedni-bugyal": "ali-bedni-bugyal-trek",
  "annapurna-base-camp": "Annapurna-Base-Camp-Trek",
  "annapurna-circuit": "Annapurna-Circuit-Trek",
  "bali-pass": "bali-pass-trek",
  "buran-ghati": "buran-ghati-trek",
  "beas-kund": "Beas-kund-trek",
  "bhrigu-lake": "bhrigu-lake-trek",
  "brahmatal": "brahmatal-trek",
  "dayara-bugyal": "Dayara-Bugyal-Trek",
  "deoriatal-chandrashila": "Chopta-chandrashila-trek",
  "everest-base-camp": "Everest-Base-Camp-Trek",
  "gaumukh-tapovan": "gaumukh-tapovan-trek",
  "goechala": "goechala-trek",
  "hampta-pass": "Hampta-Pass-Chandratal-Lake-Trek",
  "har-ki-dun": "Har-Ki-Dun-Trek",
  "kashmir-great-lakes": "kashmir-great-lakes-trek",
  "kedartal": "kedar-taal-trek",
  "kuari-pass": "Kuari-pass-trek",
  "markha-valley": "markha-valley-trek",
  "pin-parvati-pass": "Pin-parwati-pass-trek",
  "rupin-pass": "rupin-pass-trek",
  "valley-of-flowers": "Valley-of-flowers-trek",
  "chandrakhani-pass": "Chandrakhani-Pass-Trek",
  "dodital-darwa-pass": "dodital-Trek",
  "kareri-lake": "kareri-lake-trek",
  "khopra-danda": "khopra-ridge-trek-nepal",
  "manaslu-circuit": "manaslu-circuit-trek-nepal",
  "pangarchulla-peak": "pangarchulla-peak-trek",
  "panwali-kantha": "Panwali-kantha-trek",
  "phulara-ridge": "phulara-ridge-trek",
  "pin-bhaba-pass": "Pin-Bhaba-Pass-Trek",
  "pindari-glacier": "pindari-glacier-trek",
  "roopkund": "Roopkund-Trek",
  "sar-pass": "Sar-Pass-Trek",
  "satopanth-lake": "satopanth-lake-trek",
  "triund": "triund-trek",
  "rishikesh-river-rafting": "ganga-river-rafting-shivpuri-rishikesh",
};

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The page as lines of text, in reading order */
function linesOf(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|li|h\d|tr|td|span|option|a|strong|b)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&rsquo;|&#8217;/g, "’").replace(/&lsquo;/g, "‘").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#8377;|&#x20B9;/gi, "₹").replace(/&[a-z]+;/gi, " ")
    .split("\n").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);
}

const int = (s) => { const n = parseInt(String(s).replace(/[^\d]/g, ""), 10); return Number.isFinite(n) && n > 0 ? n : undefined; };

/** The older page layout (a header card with data-trek-fee), read straight from its markup */
function parseOld(html, url) {
  const text = (s) => s?.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  const fee = /data-trek-fee="([^"]*)"/.exec(html)?.[1];
  const feeBase = /^\d+$/.test(fee ?? "") ? int(fee) : undefined;
  const gst = /data-trek-fee="[^"]*"[\s\S]{0,300}?\+\s*(\d+(?:\.\d+)?)\s*%\s*GST/.exec(html)?.[1];
  const gstRate = gst ? Number(gst) / 100 : undefined;
  const heading = /<div class="top-info-card__heading">([\s\S]*?)<\/div>/.exec(html)?.[1] ?? "";
  const h1 = text(/<h1>([\s\S]*?)<\/h1>/.exec(heading)?.[1]);
  // "SHIVPURI TO RISHIKESH RAFTING" → "Shivpuri to Rishikesh Rafting"
  const title = h1 && h1 === h1.toUpperCase() ? h1.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()).replace(/\bTo\b/g, "to") : h1;
  const days = int(/•\s*<\/strong>\s*(\d+)/.exec(heading)?.[1] ?? "");
  const brs = int(/id="ml0"[^>]*>(\d+)</.exec(html)?.[1] ?? "");
  const grade = text(/<h3 class="difficulty">([\s\S]*?)<a /.exec(html)?.[1]);
  const lists = /<div class="row whats-included[\s\S]*?<ul>([\s\S]*?)<\/ul>[\s\S]*?<ul>([\s\S]*?)<\/ul>/.exec(html);
  const items = (h) => [...(h ?? "").matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1])).filter((s) => s && s.length > 2);
  const included = items(lists?.[1]), notIncluded = items(lists?.[2]);
  return {
    listedAs: title,
    days, maxAltM: int(/class="altitude-height"><span>(\d+)/.exec(html)?.[1] ?? ""),
    distanceKm: int(/<p class="info">\s*(\d+)\s*KM/i.exec(html)?.[1] ?? ""),
    difficulty: [grade, brs ? `BRS ${brs}` : ""].filter(Boolean).join(" · ") || undefined,
    feeBase, gstRate, feeTotal: feeBase ? Math.round(feeBase * (1 + (gstRate ?? 0))) : undefined,
    batches: [], departures: [],
    startEnd: text(/<p class="destination-info">([\s\S]*?)<\/p>/.exec(html)?.[1])?.replace(/^From\s+/i, "") || undefined,
    groupSize: int(/>\s*MAX\s+(\d+)\s*</.exec(html)?.[1] ?? ""),
    addOns: {}, addOnsPlusGst: false,
    cloakroom: included.some((s) => /cloak ?room/i.test(s)) ? true : undefined,
    included, notIncluded,
    url, checkedAt: new Date().toISOString().slice(0, 10),
  };
}

export function parse(html, url) {
  if (/data-trek-fee=/.test(html) && /class="top-info-card__heading"/.test(html)) return parseOld(html, url);
  const L = linesOf(html);
  const at = (re, from = 0) => { for (let i = from; i < L.length; i++) if (re.test(L[i])) return i; return -1; };
  const after = (re, from = 0) => { const i = at(re, from); return i >= 0 ? L[i + 1] : undefined; };

  // The header block: title … "₹" fee "+ 5% GST" start–end "Add ons" …
  const rupee = at(/^₹$/);
  const head = rupee > 0 ? L.slice(Math.max(0, rupee - 14), rupee) : [];
  // "DIY" (self-guided) and "On Request" listings have no fee: not a guided trip we can price
  const feeBase = rupee >= 0 && /^[\d,]+$/.test(L[rupee + 1] ?? "") ? int(L[rupee + 1]) : undefined;
  let i = rupee + 2;
  let gstRate;
  // "+ 5% GST" on one line, or "+ 5%" then "GST" (older page layout)
  const g = /\+\s*(\d+(?:\.\d+)?)\s*%/i.exec(L[i] ?? "");
  if (g && /GST/i.test(L[i] + " " + (L[i + 1] ?? ""))) { gstRate = Number(g[1]) / 100; i += /GST/i.test(L[i]) ? 1 : 2; }
  const startEnd = L[i] && !/^Add ons$|^Book Now$|^Available Batches$/i.test(L[i]) ? L[i].replace(/^From\s+/i, "") : undefined;

  const addOns = {};
  let transportRoute;
  const extras = [];
  const addStart = at(/^Add ons$/i, rupee);
  if (addStart > 0) {
    for (let k = addStart + 1; k < L.length && /^\+\s*(Rs\.?|₹|INR)/i.test(L[k]); k++) {
      const m = /^\+\s*(?:Rs\.?|₹|INR)\s*([\d,]+)\s*(.*)$/i.exec(L[k]);
      const price = m ? int(m[1]) : undefined;
      if (!m || !price) continue; // empty add-on slots ("+ Rs. 0", "+ Rs.")
      const label = m[2].trim();
      if (/transport/i.test(label)) { addOns.transport = price; transportRoute = /\(([^)]+)\)/.exec(label)?.[1]; }
      else if (/offload/i.test(label)) addOns.offloading = price;
      else if (/insurance/i.test(label)) addOns.insurance = price;
      else if (/single/i.test(label)) addOns.singleTent = price;
      else extras.push(`${label}: ₹${price.toLocaleString("en-IN")}`);
    }
  }

  // Header facts. Newer layout: "BRS 2", "3810 mts", "5 Days", "23 Km", "Max 15".
  // Older layout: "•", days ("8" or "2 Days"), BRS number, grade, "104 KM", "MAX 15", "MAX ALTITUDE", "3750", "mts."
  const gradeRe = /^(Easy|Moderate|Difficult|Hard|Challenging|Extreme)/i;
  const grade = after(/^Grade$/i, at(/^Are you Eligible/i)) ?? head.find((s) => gradeRe.test(s));
  let brs = head.find((s) => /^BRS \d/i.test(s));
  let alt = int(head.find((s) => /^\d+\s*(mts|m)\.?$/i.test(s)) ?? after(/^Max Altitude$/i) ?? "");
  let days = int(head.find((s) => /^\d+\s*Days?$/i.test(s)) ?? "");
  const km = int(head.find((s) => /^\d+(\.\d+)?\s*Km$/i.test(s)) ?? "");
  const group = int(head.find((s) => /^Max \d+/i.test(s)) ?? "");
  if (L[rupee - 1] === "mts.") {
    alt = int(L[rupee - 2]);
    const dot = head.lastIndexOf("•"), gi = head.findIndex((s, k) => k > dot && gradeRe.test(s));
    const nums = dot >= 0 && gi > dot ? head.slice(dot + 1, gi) : [];
    if (nums.length === 2) { days = int(nums[0]); brs = `BRS ${int(nums[1])}`; }
    else if (nums.length === 1) brs = `BRS ${int(nums[0])}`;
  }

  // Every batch start, from the batch picker ("05-12-2026 - 09-12-2026")
  const departures = [...new Set(L.filter((s) => /^\d{2}-\d{2}-\d{4} - \d{2}-\d{2}-\d{4}$/.test(s))
    .map((s) => { const [d, m, y] = s.slice(0, 10).split("-"); return `${y}-${m}-${d}`; }))].sort();
  const batches = [...new Set(departures.map((d) => `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`))];

  // The lists sit between the last "What's Included" heading before "What's Not Included" (the
  // first one is a tab label at the top of the page) and the eligibility section after it
  const notAt = at(/^What['’]s Not Included$/i);
  let incAt = -1;
  for (let k = notAt - 1; k >= 0; k--) if (/^What['’]s Included$/i.test(L[k])) { incAt = k; break; }
  const included = incAt >= 0 ? L.slice(incAt + 1, notAt).filter((s) => s.length > 2) : [];
  const endAt = notAt >= 0 ? at(/^Are you Eligible|^Packing List$|^FAQs?$|^Cancellation Policy$/i, notAt + 1) : -1;
  const notIncluded = notAt >= 0 ? L.slice(notAt + 1, endAt < 0 ? notAt + 25 : endAt).filter((s) => s.length > 2) : [];

  const title = head.find((s, k) => k > 0 && head[k - 1] && /You Trek They Vacation/i.test(head[k - 1])) ?? L[0].split("|")[0].trim();
  const cloak = included.some((s) => /cloak ?room/i.test(s)) ? true : notIncluded.some((s) => /cloak ?room/i.test(s)) ? false : undefined;
  const priceNote = extras.length ? `Other paid extras: ${extras.join("; ")}` : undefined;

  return {
    listedAs: title,
    days, maxAltM: alt, distanceKm: km,
    difficulty: [grade, brs].filter(Boolean).join(" · ") || undefined,
    feeBase, gstRate, feeTotal: feeBase ? Math.round(feeBase * (1 + (gstRate ?? 0))) : undefined,
    priceNote,
    batches, departures,
    startEnd, groupSize: group,
    addOns, addOnsPlusGst: false, transportRoute,
    cloakroom: cloak,
    included, notIncluded,
    url, checkedAt: new Date().toISOString().slice(0, 10),
  };
}

// Run directly (not imported for a test)
if (process.argv[1]?.replace(/\\/g, "/").endsWith("operators/bikat.mjs")) {
  const out = {};
  const problems = [];
  for (const [slug, page] of Object.entries(PAGES)) {
    const url = BASE + page;
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA } });
      if (!r.ok) { problems.push(`${slug}: HTTP ${r.status}`); continue; }
      const offer = parse(await r.text(), url);
      if (!offer.feeBase) problems.push(`${slug}: no price found`);
      out[slug] = offer;
      console.log(`${slug.padEnd(24)} ${offer.days ?? "?"}d ₹${offer.feeBase ?? "?"} gst ${offer.gstRate ?? "-"} | ${offer.startEnd ?? "-"} | ${offer.departures.length} batches | inc ${offer.included.length} / not ${offer.notIncluded.length}`);
    } catch (e) { problems.push(`${slug}: ${e.message}`); }
    await sleep(3500);
  }
  mkdirSync("research/offers", { recursive: true });
  writeFileSync("research/offers/bikat.json", JSON.stringify({ operator: OPERATOR, offers: out }, null, 1) + "\n");
  console.log(`\n${Object.keys(out).length} offers written; problems: ${problems.length ? "\n  " + problems.join("\n  ") : "none"}`);
}
