import { ImageResponse } from "next/og";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { adventures } from "@/lib/data";
import { getACE, computeDifficulty } from "@/lib/ace";

export const runtime = "edge";

// Simplified India outline (mainland + a few largest islands), decimated from
// public/india-boundary.geojson and projected into a fixed 420x480 coordinate
// space. Pin positions below use the same projection so dots line up with
// the silhouette regardless of what pixel size the <svg> is rendered at.
const INDIA_PATH =
  "M138.8,65.7 L143.5,65.5 L147.5,64.7 L151.2,61.8 L156.6,59.7 L161.9,59.7 L166.3,60.4 L169.3,63.8 L172.5,65.7 L176.4,64.7 L176.2,68.5 L174.8,73.8 L170.6,76.5 L167.2,79.7 L165.9,83.1 L162.1,85.6 L158,87.1 L158,91 L159.4,95.7 L163.7,96.6 L164.3,100.5 L165.1,104.6 L161,106.1 L157.4,107.4 L154.9,103.8 L150.9,105.8 L153.1,110 L155.4,114.1 L156.5,118.3 L156.1,122.2 L159.7,120.5 L162.8,123.3 L166.1,126.6 L170.8,127.3 L175.2,129.6 L177.2,132.7 L182.2,134.3 L186.3,137.2 L182.8,139.1 L179.1,142.3 L177.3,145.8 L176.4,149.7 L173.7,153.7 L178.1,158.2 L181.9,159 L186.2,161.3 L190.9,164.9 L195.9,167.5 L201.4,168.8 L207.9,170.8 L211.7,173.6 L217.8,175.6 L223.4,175 L227.2,174.2 L231.1,175.3 L235.6,177.7 L238.5,180.8 L242.3,182.8 L247.7,182.2 L251.4,186.1 L256.5,185.9 L263.2,188 L267.9,186.4 L272.2,188.2 L277.9,187.6 L281.9,187.5 L282.8,182.4 L280.5,178.5 L281.1,173.6 L283,169.1 L285,167 L289.4,165.6 L292.2,169.2 L291,173.9 L291.2,177.6 L292.7,180.7 L297,182.8 L302.2,183.2 L306.5,184.1 L312.2,181.8 L318.1,183.4 L325,183.2 L331.2,182.7 L336.1,181.1 L335.2,176.7 L333.6,174.1 L329.2,173 L331.9,170.1 L336.6,169.1 L340.9,169.1 L343.4,165.7 L348.2,162.8 L352.2,159 L357.5,157.8 L361.8,155.4 L365.9,152.7 L369.4,149.8 L373.8,151.1 L378.2,151.9 L381.8,150.9 L385.9,148.7 L390.8,149.3 L391.3,152.9 L394.8,154.2 L397.1,157.7 L394.5,160.1 L397.7,158.8 L401,161.9 L405.6,163.3 L407,167.3 L403.3,170.1 L401,173.6 L403.7,178 L400.3,177.8 L396.8,175.4 L391.7,176.6 L387.4,179.8 L383.5,182.5 L379.2,185 L376.2,187.8 L377.2,192.6 L375.7,197.1 L372.2,200.8 L369.4,204.6 L370.9,208.7 L367.6,213.4 L364.9,219.2 L362.1,222.2 L357.3,220.8 L353.5,219.8 L353.4,223.7 L353.3,228.8 L352.6,233.6 L350.2,235.5 L349.5,240.4 L350,244.8 L348.1,247.9 L345.1,246.5 L342.6,247.2 L342.1,242.7 L340.9,237.8 L339.6,233.2 L339,228.6 L337.6,225.4 L334.2,224.5 L333,228.6 L332.2,233.1 L328.4,234.2 L326.3,231.1 L325.3,231.2 L323.4,226.4 L324.2,223.4 L326.2,219.9 L329.8,218.2 L332.5,218.4 L334.4,215.7 L337.6,213.2 L338.2,208.7 L340.2,207.6 L336.2,205.2 L330.8,205.3 L326.1,205.1 L320.8,205 L316,205 L310.6,204.6 L305.2,203.4 L305.6,198.2 L305.6,194.3 L303.2,191.4 L302.6,192.6 L299.3,193.5 L295.9,190.8 L293.5,187.8 L294.8,190.4 L291,189.8 L289.8,188.9 L286.2,186.3 L286.8,187.6 L284.9,190.9 L282,194.4 L284.4,197 L287.7,200.4 L291.8,201.2 L293.3,204.3 L289.2,204.6 L286.6,206.9 L283.8,208.3 L281.2,211.2 L284.5,215.3 L289.7,216.6 L290.5,220.8 L288.2,223.9 L290.2,227.5 L290.1,230.5 L293.5,231.8 L292.7,236 L293.2,240.2 L294.5,244.7 L294.2,248.8 L295,252.1 L292.5,252.6 L291.1,252.6 L290.7,248.1 L288.9,247.5 L287.6,249.8 L286.8,252.5 L285.9,251.9 L284.1,253.9 L282.6,248.6 L281.3,245.3 L280.5,249.3 L275.7,252.7 L270.2,254 L266.3,256.4 L265.7,261.9 L267,264.8 L264.8,267.2 L264,269.7 L262.9,271.1 L259.1,274.9 L255.1,276.7 L249.3,278.3 L246.5,279.7 L241.3,283 L237,286.8 L234.1,290.8 L231,294.7 L226.7,298.6 L221.4,301.3 L217.9,305.1 L213.3,308.6 L208.2,311.2 L202.8,316.8 L204.4,317.1 L204.1,319.7 L202.5,321.7 L197.6,323.9 L193.2,324.2 L188.5,327.4 L186.1,332.1 L183.3,332.5 L180.4,330.7 L175.6,334.3 L173.5,339.1 L173.7,345.5 L174.7,350.5 L174.6,356.1 L175.9,361.7 L176.6,366.5 L175.7,371.7 L174.5,376.4 L171.6,381.1 L169.5,386.7 L170,391.5 L170.4,396.4 L170.5,404.1 L167.5,405.4 L164.6,405.7 L161.8,410.1 L158.4,415 L159.6,419.5 L157.3,420.2 L152.1,421.8 L147.6,425.2 L147,429.1 L144,433.3 L139.1,436.1 L133.5,433.5 L129.2,428.9 L126.2,424.6 L125.6,424.1 L124.1,420.5 L122.6,417 L121.6,410.7 L120.7,408.5 L119.2,404 L117.2,399.5 L116.2,395.4 L115,391.7 L112,387.1 L109,383.6 L106.3,380.1 L103.9,374.9 L102.4,371.4 L101,365.7 L100.4,361.4 L99.3,357.6 L97.2,352.8 L96.3,349.7 L95,346.8 L93.2,344.5 L90.5,340.6 L89.6,337.1 L87.8,334.1 L85.2,329.9 L83.5,325.7 L82.8,323.6 L83.5,322.1 L82.6,320.6 L81.6,316.6 L81.6,314.4 L81.1,311.5 L80.2,307.6 L78.8,302.9 L77.7,299.8 L78.8,299.5 L76.8,296.9 L76.6,294.1 L77.6,292 L77.4,289 L77.2,286.6 L75.1,289 L75.6,285.1 L75.6,283.9 L75.4,281.6 L73.6,277.6 L74.2,273.5 L75.9,268.6 L76.3,264.9 L75.6,262 L75,260.5 L72.8,260.3 L72.6,257.8 L74.2,255 L76.4,252.5 L71.5,252.5 L74.4,248.3 L71.3,247.3 L75.4,244.7 L72.5,244 L69,243.7 L67.2,247.8 L67.5,250.5 L67.9,253.7 L65.5,258.8 L60.8,261 L57.3,262.8 L52.2,264.7 L48,265.4 L42.9,262.9 L37.7,259.2 L33.3,254.2 L28.4,250.1 L23.7,245.4 L24.2,242.5 L27.7,244.2 L31.6,243 L34.4,242.4 L38.1,240.5 L41.3,237.9 L41.7,235.3 L39,234.7 L34.9,236.4 L31.4,237.6 L27.7,236.7 L23.8,234.9 L19.1,232.4 L18.9,230.4 L16.9,228 L17,225.4 L20.5,222.8 L16.2,224.1 L14.3,226.7 L14.1,225.3 L13.1,224.1 L16,221.3 L20.6,218.3 L23.4,217.5 L28.8,217.2 L34.2,218.6 L39.2,216.8 L45,215.2 L48.2,217.9 L52.4,215.2 L51.9,211.4 L49.1,205.3 L46.3,200.2 L42.2,198.2 L38.5,193.6 L39.7,186.9 L33.3,184.9 L31,179.4 L35.6,174.7 L39.2,169.3 L44.9,166.6 L49.6,170.7 L56.4,168.6 L62.6,167.5 L66.3,162.3 L69.3,156.7 L74.6,153.9 L79.1,149.9 L82.1,144.1 L86,139.5 L90.9,136.9 L90.8,133.5 L94.1,130.6 L97,127.3 L100.5,124.6 L98.6,122.2 L99.3,118.5 L99.5,114.3 L103.8,111.9 L108.6,110.9 L108,107.5 L103.7,106.5 L100.1,104.4 L99.9,102.6 L94.2,101.1 L88,98.6 L86.2,93.2 L85.8,87.2 L83.3,80.9 L86.8,76.8 L91.9,73.7 L90.6,69.7 L88.4,65.2 L81.8,63.3 L78.5,60.6 L72.8,61 L72,55.3 L78.4,51.1 L84.6,48.9 L86.9,46.8 L93.3,46.3 L101,44.5 L106.8,44.8 L111,48.9 L117.7,51.2 L131,60.9 Z M348.7,362.1 L348.7,363 L348.3,363.7 L349.1,364.1 L349.1,364.9 L348.8,365.2 L348.2,364.8 L347.7,364.7 L348,365.3 L348.4,365.6 L348.7,366.1 L348.8,366.6 L348.6,367.4 L348.6,368.2 L348.3,369 L347.6,369.4 L347.4,368.7 L346.9,368.6 L346.7,368.9 L346.9,369.5 L347.2,370.2 L346.8,369.7 L346.4,370.4 L346.2,371.1 L345.4,370.7 L345.3,369.9 L345.4,369.5 L345.4,368.7 L345.5,368.3 L345.8,367.8 L345.5,367.5 L345.8,366.6 L345.9,366.1 L346,365.5 L345.9,364.8 L346.5,364.3 L346.3,364.1 L346.4,363.3 L347.1,362.8 L347.4,362.3 L347.9,362.1 L348.4,361.9 Z M344.1,380 L344.4,380.6 L344.7,381.3 L344.6,382.1 L344.4,382.4 L345.2,382.4 L344.5,382.7 L344.6,383.4 L344.4,384.2 L344.8,384 L345.3,384.4 L345.2,385.2 L345,386 L344.8,386.9 L344.2,387.1 L344,387.6 L344,388.1 L344.3,387.5 L344.6,387.9 L344.7,388.7 L344.4,389.5 L344.1,389.8 L343.3,389.5 L343.1,388.9 L343,388.3 L342.8,387.9 L342.7,387 L342.1,387 L342,386 L342,385.2 L341.6,384.9 L342,384.1 L342.5,384.3 L342.8,385.1 L342.8,384.2 L342.9,383.4 L343,382.5 L343,381.7 L343.3,380.8 L343.6,380.5 L344,379.8 Z M346.8,370.7 L346.9,371 L347.2,371.4 L347.4,371.9 L347.3,372.5 L347.6,373 L347.9,373.5 L347.7,373.9 L347.6,374.5 L347.6,374.8 L347.7,375.4 L347.8,376 L347.7,376.5 L347.3,376.6 L347.3,376.9 L347,377.4 L346.7,377 L346.3,376.8 L346.2,376.9 L346.7,377.2 L346.3,377.3 L345.7,377.2 L345.5,376.9 L345.7,377.3 L346,377.8 L346.4,378.2 L346.5,378.6 L346,378.9 L345.5,378.8 L345,378.9 L344.4,379 L344.1,378.5 L344.1,377.9 L344.1,377.3 L344.1,376.7 L344.1,376.2 L344.1,375.6 L344.2,375 L344.1,374.7 L344.6,374.4 L344.9,374 L345.2,374.4 L345.2,373.8 L345.1,373.8 L344.6,374 L344.6,373.5 L344.5,372.9 L344.5,372.3 L344.5,371.8 L344.6,371.8 L345.2,371.9 L345.3,371.2 L345.8,371 L346.2,371.2 L346.7,370.9 L346.8,370.7 Z";

const PROJ = { minLng: 68.1762, maxLng: 97.395, minLat: 8.0737, maxLat: 37.0976, W: 420, H: 480, scale: 13.511848535874162, offX: 12.6, offY: 43.91672963982097 };

function project(lng: number, lat: number) {
  const x = (lng - PROJ.minLng) * PROJ.scale + PROJ.offX;
  const y = (PROJ.maxLat - lat) * PROJ.scale + PROJ.offY;
  return { xPct: (x / PROJ.W) * 100, yPct: (y / PROJ.H) * 100 };
}

const DIFFICULTY_LEVEL: Record<string, number> = { Easy: 1, Moderate: 2, Hard: 3, Advanced: 4, Extreme: 5 };
const DIFFICULTY_COLOR: Record<string, string> = { Easy: "#10b981", Moderate: "#38bdf8", Hard: "#a78bfa", Advanced: "#ff5100", Extreme: "#ef4444" };

export async function GET(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response("Log in to generate your Trail Passport.", { status: 401 });
  }

  const admin = await createAdminClient();
  const { data: blob } = await admin.storage.from("wishlists").download(`triplog-${user.id}.json`);
  let entries: { slug: string; date: string }[] = [];
  if (blob) {
    try { entries = JSON.parse(await blob.text()); } catch { entries = []; }
  }

  const completed = entries
    .map((e) => adventures.find((a) => a.slug === e.slug))
    .filter((a): a is NonNullable<typeof a> => !!a);

  const name = (user.user_metadata?.full_name as string) || (user.user_metadata?.username as string) || "Explorer";
  const avatarId = user.user_metadata?.avatar_id as number | null | undefined;
  const origin = new URL(req.url).origin;
  const avatarUrl = avatarId ? `${origin}/avatars/avatar-${avatarId}.png` : null;

  const statesCount = new Set(completed.map((a) => a.state)).size;
  const hardest = completed.reduce<{ name: string; difficulty: string; level: number } | null>((best, a) => {
    const difficulty = computeDifficulty(getACE(a));
    const level = DIFFICULTY_LEVEL[difficulty] ?? 1;
    if (!best || level > best.level) return { name: a.name, difficulty, level };
    return best;
  }, null);

  const pins = completed.map((a) => {
    const difficulty = computeDifficulty(getACE(a));
    return { ...project(a.lng, a.lat), color: DIFFICULTY_COLOR[difficulty] ?? "#fbbf24" };
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(160deg, #0a0f1a 0%, #12181f 55%, #0a0f1a 100%)",
          fontFamily: "sans-serif",
          position: "relative",
          padding: "56px 64px",
        }}
      >
        {/* Ambient accent */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "radial-gradient(ellipse 70% 45% at 50% 12%, rgba(255,81,0,0.14) 0%, transparent 70%)",
          }}
        />

        {/* Header brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, zIndex: 1 }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: "#ff5100", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(255,81,0,0.35)" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              <path d="M4.14 15.08c2.62-1.57 5.24-1.43 7.86.42 2.74 1.94 5.49 2 8.23.19" />
            </svg>
          </div>
          <span style={{ color: "#fff", fontWeight: 900, fontSize: 24, letterSpacing: -0.5 }}>
            TRAIL <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 300 }}>to</span> TIDES
          </span>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 36, zIndex: 1 }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 24, fontWeight: 600 }}>{name}&apos;s Trail Passport</span>
          <span style={{ color: "#fff", fontSize: 76, fontWeight: 900, marginTop: 8, lineHeight: 1 }}>
            {completed.length} {completed.length === 1 ? "Adventure" : "Adventures"}
          </span>
          {statesCount > 0 && (
            <span style={{ color: "#ff9d70", fontSize: 26, fontWeight: 700, marginTop: 10 }}>
              across {statesCount} state{statesCount === 1 ? "" : "s"} of India
            </span>
          )}
        </div>

        {/* Map */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 12 }}>
          <div style={{ position: "relative", width: 460, height: 526, display: "flex" }}>
            <svg width={460} height={526} viewBox="0 0 420 480" style={{ position: "absolute" }}>
              <path d={INDIA_PATH} fill="rgba(255,81,0,0.08)" stroke="rgba(255,125,71,0.55)" strokeWidth={1.6} />
            </svg>
            {pins.length === 0 && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 20, fontWeight: 600 }}>Your journey starts here</span>
              </div>
            )}
            {pins.map((p, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${p.xPct}%`,
                  top: `${p.yPct}%`,
                  width: 16,
                  height: 16,
                  marginLeft: -8,
                  marginTop: -8,
                  borderRadius: 999,
                  background: p.color,
                  border: "2.5px solid #0a0f1a",
                  boxShadow: `0 0 14px ${p.color}`,
                  display: "flex",
                }}
              />
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, zIndex: 1 }}>
          {avatarUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} width={56} height={56} style={{ borderRadius: 999, border: "3px solid rgba(255,81,0,0.5)" }} alt="" />
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ color: "#fff", fontSize: 20, fontWeight: 700 }}>{name}</span>
            {hardest && (
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, marginTop: 2 }}>
                Toughest completed: {hardest.difficulty} · {hardest.name}
              </span>
            )}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 16 }}>trailtotides.com</span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            display: "flex",
            background: "linear-gradient(90deg, transparent, #ff5100 30%, #ff7d47 70%, transparent)",
          }}
        />
      </div>
    ),
    { width: 1080, height: 1350 }
  );
}
