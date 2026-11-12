/**
 * Trek The Himalayas: collects their offer for every adventure of ours they run.
 *
 * Their site puts scripted requests behind a browser check, so this runs inside a normal browser
 * tab: open https://trekthehimalayas.com, paste this file into the console, and wait for
 * "done". robots.txt (checked 12 Nov 2026) allows everything; pages are read one at a time,
 * three seconds apart, with no login, forms or bookings. It then offers the result as
 * research/offers/tth.json; save it there and run scripts/operators/apply-offers.mjs.
 *
 * Everything is read from the page's own data: the fee from its schema.org offer, GST from the
 * price line, add-ons with their GST, every open batch, and the cost terms (inclusions/exclusions).
 */
(async () => {
  // Our adventure → their trek page. Gokyo Lakes is left out: they only sell it with Everest Base Camp.
  const PAGES = {
    "kedarkantha-trek": "kedarkantha-trek", "sandakphu-phalut-trek": "sandakphu-trek", "tarsar-marsar-trek": "tarsar-marsar-trek",
    "ali-bedni-bugyal": "ali-bedni-bugyal-trek", "annapurna-base-camp": "annapurna-base-camp-trek", "annapurna-circuit": "annapurna-circuit-trek",
    "bagini-glacier": "bagini-glacier-and-changbang-base-camp", "bali-pass": "bali-pass-trek", "buran-ghati": "buran-ghati-pass-trek",
    "beas-kund": "beas-kund-trek", "bhrigu-lake": "bhrigu-lake-trek", "brahmatal": "brahmatal-trek", "dayara-bugyal": "dayara-bugyal-trek",
    "deoriatal-chandrashila": "chopta-chandrashila-deoria-tal-trek", "everest-base-camp": "everest-base-camp-trek", "gaumukh-tapovan": "gaumukh-tapovan-trek",
    "goechala": "goechala-trek", "hampta-pass": "hampta-pass-trek", "har-ki-dun": "har-ki-dun-trek", "kashmir-great-lakes": "kashmir-great-lakes-trek",
    "kedartal": "kedar-tal-trek", "kuari-pass": "kuari-pass-trek", "markha-valley": "markha-valley-trek", "pin-parvati-pass": "pin-parvati-pass-trek",
    "rupin-pass": "rupin-pass-trek", "valley-of-flowers": "valley-of-flowers-trek", "bajre-dara": "Bajre-Dara-trek", "chandrakhani-pass": "chandrakhani-pass-trek",
    "dodital-darwa-pass": "dodital-darwa-pass-trek", "doodhpathri": "doodhpathri-Trek", "gulabi-kantha": "gulabi-kantha-trek", "kareri-lake": "kareri-lake-trek",
    "khopra-danda": "KhopraRidge", "lobuche-peak": "Lobuche-Peak-Trek", "manaslu-circuit": "manaslu-circuit-trek", "mera-peak": "Mera-Peak-Expedition",
    "panch-kedar": "panchkedar-trek", "pangarchulla-peak": "pangarchulla-peak-trek", "panwali-kantha": "panwali-kantha", "phulara-ridge": "phulara-ridge-trek",
    "pin-bhaba-pass": "pin-bhaba-pass-trek", "pindari-glacier": "pindari-glacier-trek", "ranthan-kharak": "ranthan-kharak-trek", "roopkund": "roopkund-trek",
    "sar-pass": "sar-pass-trek", "satopanth-lake": "Satopanth-Lake-Trek", "surya-top": "surya-top-trek",
  };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const today = new Date().toISOString().slice(0, 10);
  const num = (s) => { const n = parseInt(String(s ?? "").replace(/[^\d]/g, ""), 10); return Number.isFinite(n) && n > 0 ? n : undefined; };
  const dec = (s) => s.replace(/\\u003c/g, "<").replace(/\\u003e/g, ">").replace(/\\u0026/g, "&").replace(/\\\\r\\\\n|\\r\\n|\\\\n/g, " ").replace(/\\"/g, '"');
  const txt = (h) => h.replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|div|li|h\d|span)>/g, "\n").replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/[ \t]+/g, " ");
  const items = (h) => txt(h).split("\n").map((s) => s.trim()).filter((s) => s.length > 2 && !/^\d+\.?$/.test(s));
  const cap = (s) => s.replace(/\s+/g, " ").trim().replace(/\.$/, "").replace(/^\w/, (c) => c.toUpperCase());

  function parse(raw, url) {
    const u = dec(raw);
    const T = raw.replace(/<script[\s\S]*?<\/script>/g, " ").replace(/<[^>]+>/g, "\n").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s*\n\s*/g, "\n");
    const feeBase = num(/"offers":\{"@type":"Offer","priceCurrency":"INR","price":(\d+)/.exec(u)?.[1]);
    const gm = /\+\s?(\d+(?:\.\d+)?)%\s*GST/.exec(T);
    const gstRate = gm ? Number(gm[1]) / 100 : undefined;
    const fact = (label, re) => new RegExp(label + "\\s*\\n\\s*" + re.source, "i").exec(T)?.[1];
    const altFt = num(fact("Max Altitude", /([\d,]+)\s*ft/));
    const addOns = {}; let transportRoute; const extras = [];
    for (const m of u.matchAll(/"addonName":"([^"]+)","addonDetailsId":\d+,"baseAmount":"(\d+)","totalAmount":([\d.]+),"gstAmount":[\d.]+,"trekId":\d+,"details":"([\s\S]*?)"\}/g)) {
      const name = m[1], base = num(m[2]), det = txt(m[4]);
      if (/insurance/i.test(name)) addOns.insurance = base;
      else if (/transport/i.test(name)) { addOns.transport = base; transportRoute = /Transportation\s+([^\n.]+?)(?:\s*\.|\n|$)/i.exec(det)?.[1]?.trim(); }
      else if (/offload/i.test(name)) addOns.offloading = base;
      else if (/single/i.test(name)) addOns.singleTent = base;
      else extras.push(`${name}: ₹${base?.toLocaleString("en-IN")} + GST`);
    }
    // Every batch still open (full, closed and cancelled ones left out), from today on
    const seen = new Set(), dep = new Set();
    for (const m of u.matchAll(/"departureId":(\d+),"startDate":"(\d{4}-\d{2}-\d{2})T[^"]*","endDate":"[^"]*"[\s\S]{0,700}?"mannualStatus":(null|"[^"]*")[\s\S]{0,200}?"autoStatus":(null|"[^"]*")/g)) {
      if (seen.has(m[1])) continue; seen.add(m[1]);
      if (/full|closed|cancel/i.test(m[3] + m[4]) || m[2] < today) continue;
      dep.add(m[2]);
    }
    const departures = [...dep].sort();
    // Cost terms: the "…Inclusion(s)" and "Exclusion(s)" headings, however the page words them
    const inc = /<h4[^>]*>\s*<(b|strong)>[^<]*Inclusions?\s*<\/\1>\s*<\/h4>/i.exec(u);
    const exc = /<h4[^>]*>\s*<(b|strong)>[^<]*Exclusions?\s*<\/\1>\s*<\/h4>/i.exec(u);
    let included = [], notIncluded = [];
    if (inc && exc && exc.index > inc.index) {
      included = items(u.slice(inc.index + inc[0].length, exc.index));
      const rest = u.slice(exc.index + exc[0].length, exc.index + exc[0].length + 6000);
      const stop = rest.search(/<h4|"\]\)<\/script>|<\/script>/);
      notIncluded = items(stop >= 0 ? rest.slice(0, stop) : rest);
    }
    let priceNote = extras.length ? `Other paid extras: ${extras.join("; ")}` : undefined;
    const se = /View Add-ons\nServices (?:from\s*)?([\s\S]{1,60}?)\s+to\s+([\s\S]{1,80}?)\n(?:\.\n)?Join/i.exec(T);
    let startEnd = se ? `${cap(se[1])} to ${cap(se[2])}` : undefined;
    if (startEnd) {
      const parts = startEnd.split(/\s*\|\s*/); startEnd = parts[0];
      if (parts[1] && /includ\w* transport/i.test(parts[1])) priceNote = [priceNote, "Transport included in the fee"].filter(Boolean).join(". ");
    }
    return {
      listedAs: /<title>([^<|]+)/.exec(raw)?.[1]?.replace(/\s*\d{4}.*$/, "").trim(),
      days: num(fact("Duration", /(\d+)\s*days?/)), maxAltM: altFt ? Math.round(altFt * 0.3048) : undefined,
      distanceKm: num(fact("Trekking km", /([\d.]+)\s*km/)), difficulty: /"grade":"([^"]+)"/.exec(u)?.[1],
      feeBase, gstRate, feeTotal: feeBase ? Math.round(feeBase * (1 + (gstRate ?? 0))) : undefined, priceNote,
      batches: [...new Set(departures.map((d) => `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`))], departures,
      startEnd, addOns, addOnsPlusGst: true, transportRoute,
      cloakroom: included.some((s) => /cloak ?room/i.test(s)) || /Complimentary cloakroom/i.test(T) ? true : undefined,
      included, notIncluded, url, checkedAt: today,
    };
  }

  const offers = {};
  for (const [slug, path] of Object.entries(PAGES)) {
    const r = await fetch("/" + path);
    if (r.ok) { offers[slug] = parse(await r.text(), `${location.origin}/${path}`); console.log(slug, offers[slug].feeBase, offers[slug].startEnd); }
    else console.warn(slug, "HTTP", r.status);
    await new Promise((res) => setTimeout(res, 3000));
  }
  const blob = new Blob([JSON.stringify({ operator: "Trek The Himalayas", offers }, null, 1) + "\n"], { type: "application/json" });
  const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "tth.json" });
  a.textContent = "Save tth.json"; document.body.prepend(a);
  console.log("done: click 'Save tth.json' at the top of the page and save it as research/offers/tth.json");
})();
