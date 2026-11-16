// Audit: every outbound booking link (operator websites and their trek pages), one GET each.
// Run: node --import ./tests/register.mjs scripts/audit-links.ts
import { adventures } from "../src/lib/data";
import offers from "../src/lib/operatorOffers.json";
const urls = new Map<string, string[]>();
const add = (u: string | undefined, where: string) => { if (!u) return; (urls.get(u) ?? urls.set(u, []).get(u)!).push(where); };
for (const a of adventures) for (const o of a.operators) {
  add(o.website, `${a.slug} · ${o.name} · website`);
  const off = (offers as Record<string, Record<string, { url?: string }>>)[a.slug]?.[o.name];
  add(off?.url, `${a.slug} · ${o.name} · trek page`);
}
const list = [...urls.keys()];
const results: { url: string; status: string; final?: string }[] = [];
async function check(url: string) {
  const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(url, { redirect: "follow", signal: ctrl.signal, headers: { "user-agent": "Mozilla/5.0 (link checker)", accept: "text/html" } });
    const body = r.ok ? (await r.text()).slice(0, 200000) : "";
    const soft404 = /page not found|404 not found|doesn.t exist|no longer available/i.test(body.match(/<title>[\s\S]*?<\/title>/i)?.[0] ?? "");
    results.push({ url, status: soft404 ? `${r.status} soft-404` : String(r.status), final: r.url !== url ? r.url : undefined });
  } catch (e) { results.push({ url, status: `ERR ${(e as Error).name}` }); } finally { clearTimeout(t); }
}
for (let i = 0; i < list.length; i += 6) await Promise.all(list.slice(i, i + 6).map(check));
const bad = results.filter((r) => !/^2\d\d$/.test(r.status));
console.log(`${list.length} unique links, ${list.length - bad.length} OK, ${bad.length} problems`);
for (const r of bad) console.log(`${r.status}  ${r.url}${r.final ? ` -> ${r.final}` : ""}\n    used by: ${urls.get(r.url)!.slice(0, 3).join("; ")}${urls.get(r.url)!.length > 3 ? ` (+${urls.get(r.url)!.length - 3})` : ""}`);
const moved = results.filter((r) => /^2/.test(r.status) && r.final && new URL(r.final).host !== new URL(r.url).host);
if (moved.length) console.log(`\nRedirected to another site:\n${moved.map((r) => `${r.url} -> ${r.final}`).join("\n")}`);
