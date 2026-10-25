import { ImageResponse } from "next/og";
import { computePassportData, publicPassportUserId, type PassportData } from "@/lib/passportData";
import {
  INK, PAPER, GOLD, INDIA_PATH, RADAR_AXES, RADAR_AXIS_LABELS,
  fmtDate, fmtNumber, parseISODate, truncate, ptsStr, polygonVertices, radarVertices,
  TypeIcon, BadgeIcon,
} from "@/lib/passportVisuals";

export const runtime = "edge";

// Shareable images of the Adventure Passport (1080×1350, Instagram-portrait):
// ?page=stats → the ID page, ?page=map → where you've been. Same paper-and-ink
// look as the passport on /profile. next/og only lays out flex boxes, so every
// element sets display:"flex".

const ORANGE = "#ff5100";
const MUTED = "rgba(36,26,18,0.58)";
const LINE = "rgba(36,26,18,0.18)";
const LEATHER = "#4a1019";

function Label({ children }: { children: string }) {
  return <span style={{ display: "flex", fontSize: 18, letterSpacing: 3, color: MUTED }}>{children.toUpperCase()}</span>;
}

function Header({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Label>{kicker}</Label>
        <Label>Trail to Tides</Label>
      </div>
      <span style={{ display: "flex", fontSize: 54, color: ORANGE, marginTop: 6, lineHeight: 1.1 }}>{title}</span>
    </div>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: LEATHER, padding: "48px 48px 36px", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", width: "100%", flex: 1, background: PAPER, color: INK, borderRadius: 28, padding: "44px 52px 36px" }}>
        {children}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 28 }}>
        <div style={{ display: "flex", width: 40, height: 40, borderRadius: 999, border: `2px solid ${GOLD}`, alignItems: "center", justifyContent: "center" }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
        </div>
        <span style={{ display: "flex", fontSize: 22, letterSpacing: 4, color: "#f3e3bd" }}>{"MY ADVENTURE PASSPORT · TRAILTOTIDES.COM"}</span>
      </div>
    </div>
  );
}

function RecentStamps({ data, count }: { data: PassportData; count: number }) {
  if (!data.stamps.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", marginTop: 26 }}>
      <Label>Recent stamps</Label>
      {data.stamps.slice(0, count).map((s) => (
        <div key={s.slug} style={{ display: "flex", alignItems: "center", gap: 18, padding: "12px 0", borderBottom: `2px dashed ${LINE}` }}>
          <span style={{ display: "flex", width: 170, fontSize: 22, color: MUTED }}>{fmtDate(parseISODate(s.date))}</span>
          <span style={{ display: "flex", flex: 1, fontSize: 28 }}>{truncate(s.name, 30)}</span>
          <span style={{ display: "flex", fontSize: 22, color: MUTED }}>{s.state}</span>
        </div>
      ))}
    </div>
  );
}

function IdImage({ data }: { data: PassportData }) {
  const field = (label: string, value: string) => (
    <div key={label} style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
      <Label>{label}</Label>
      <span style={{ display: "flex", fontSize: 32, marginTop: 2 }}>{truncate(value, 26)}</span>
    </div>
  );
  const R = 70, C = 90;
  return (
    <Frame>
      <Header kicker="Passport · P · TTT" title="Adventure Passport" />
      <div style={{ display: "flex", gap: 34, marginTop: 30 }}>
        <div style={{ display: "flex", width: 190, height: 232, border: `3px solid ${INK}`, borderRadius: 10, overflow: "hidden", alignItems: "center", justifyContent: "center", background: "rgba(36,26,18,0.05)" }}>
          {data.avatarUrl
            // eslint-disable-next-line @next/next/no-img-element -- next/og renders plain img
            ? <img src={data.avatarUrl} width={190} height={232} style={{ objectFit: "cover" }} alt="" />
            : <TypeIcon type="Mountaineering" size={70} color={MUTED} />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 18, justifyContent: "center" }}>
          {field("Name", data.name)}
          {field("Username", data.username ? `@${data.username}` : "—")}
          {field("Level", `${data.level.name} · ${fmtNumber(data.totalXP)} XP`)}
        </div>
      </div>
      <div style={{ display: "flex", gap: 34, marginTop: 24, paddingTop: 20, borderTop: `2px dashed ${LINE}` }}>
        {field("Passport no.", data.passportNo)}
        {field("Issued", fmtDate(new Date(data.issueDateISO)))}
      </div>

      <div style={{ display: "flex", marginTop: 26, padding: "22px 0", borderTop: `2px solid ${LINE}`, borderBottom: `2px solid ${LINE}` }}>
        {[
          { n: data.totalAdventures, l: "Adventures" },
          { n: data.statesCount, l: data.statesCount === 1 ? "State" : "States" },
          { n: data.totalBadges, l: data.totalBadges === 1 ? "Badge" : "Badges" },
        ].map((s) => (
          <div key={s.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ display: "flex", fontSize: 64, lineHeight: 1 }}>{String(s.n)}</span>
            <Label>{s.l}</Label>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 24 }}>
        <svg width={C * 2} height={C * 2} viewBox={`0 0 ${C * 2} ${C * 2}`}>
          {[1 / 3, 2 / 3, 1].map((f) => (
            <polygon key={f} points={ptsStr(polygonVertices(C, C, R * f, 8))} fill="none" stroke={LINE} strokeWidth={2} />
          ))}
          {data.hasAceData && (
            <polygon points={ptsStr(radarVertices(C, C, RADAR_AXES.map((ax) => data.userAce[ax]), 5, R))} fill="rgba(255,81,0,0.18)" stroke={ORANGE} strokeWidth={3} />
          )}
        </svg>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Label>Capability</Label>
          <span style={{ display: "flex", fontSize: 34, marginTop: 4 }}>{data.hasAceData ? `ACE ${data.aceScore}/40` : "Not assessed yet"}</span>
          {data.hasAceData && <span style={{ display: "flex", fontSize: 26, color: MUTED }}>{`Strongest in ${RADAR_AXIS_LABELS[data.topAxis]}`}</span>}
        </div>
      </div>

      {data.badges.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 22, alignItems: "center" }}>
          {data.badges.slice(0, 7).map((b, i) => (
            <div key={b.id} style={{ display: "flex", width: 76, height: 76, borderRadius: 999, border: `3px solid ${i === 0 ? ORANGE : INK}`, alignItems: "center", justifyContent: "center" }}>
              <BadgeIcon name={b.icon} size={34} color={i === 0 ? ORANGE : INK} />
            </div>
          ))}
          {data.badges.length > 7 && <span style={{ display: "flex", fontSize: 26, color: MUTED }}>{`+${data.badges.length - 7}`}</span>}
        </div>
      )}

      <RecentStamps data={data} count={2} />
      <div style={{ display: "flex", flex: 1 }} />
    </Frame>
  );
}

function MapImage({ data }: { data: PassportData }) {
  const W = 420, H = 480, S = 1.55;
  const states = data.collection.filter((c) => c.done > 0);
  return (
    <Frame>
      <Header
        kicker="Where I've been"
        title={data.totalAdventures ? `${data.totalAdventures} adventures, ${data.statesCount} ${data.statesCount === 1 ? "state" : "states"}` : "A fresh passport"}
      />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <svg width={W * S} height={H * S} viewBox={`0 0 ${W} ${H}`}>
          <path d={INDIA_PATH} fill="rgba(36,26,18,0.05)" stroke={LINE} strokeWidth={1.2} />
          {data.stamps.map((s) => (
            <circle key={`h${s.slug}`} cx={(s.xPct / 100) * W} cy={(s.yPct / 100) * H} r={9} fill="rgba(255,81,0,0.16)" />
          ))}
          {data.stamps.map((s) => (
            <circle key={s.slug} cx={(s.xPct / 100) * W} cy={(s.yPct / 100) * H} r={4.5} fill={ORANGE} stroke={PAPER} strokeWidth={1.5} />
          ))}
        </svg>
      </div>
      {states.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {states.slice(0, 10).map((c) => (
            <span key={c.state} style={{ display: "flex", fontSize: 22, padding: "6px 16px", borderRadius: 999, border: `2px solid ${LINE}` }}>{`${c.state} · ${c.done}`}</span>
          ))}
        </div>
      )}
      <div style={{ display: "flex", flex: 1 }} />
      <span style={{ display: "flex", fontSize: 22, color: MUTED }}>{`${data.totalAdventures} of ${data.totalCollectable} adventures stamped`}</span>
    </Frame>
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page") === "map" ? "map" : "stats";

  // ?u=<username> draws someone else's passport, only when they've made it public
  const u = url.searchParams.get("u");
  const publicId = u ? await publicPassportUserId(u) : undefined;
  if (u && !publicId) return new Response("This passport isn't public.", { status: 404 });

  const data = await computePassportData(url.origin, url.searchParams.get("demo"), publicId);
  if (!data) return new Response("Log in to generate your Adventure Passport.", { status: 401 });

  return new ImageResponse(page === "map" ? <MapImage data={data} /> : <IdImage data={data} />, { width: 1080, height: 1350 });
}
