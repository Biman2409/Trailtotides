import { ImageResponse } from "next/og";
import { computePassportData } from "@/lib/passportData";
import {
  INK, PAPER, GOLD, INDIA_PATH, RADAR_AXES, RADAR_AXIS_LABELS, RADAR_AXIS_SHORT,
  DIFFICULTY_COLOR, DIFFICULTY_STAMP_SIZE, DIFFICULTY_LEVEL,
  fmtDate, truncate, tint, ptsStr, polygonVertices, radarVertices, starVertices,
  mulberry32, sizeJitter, TypeIcon, StampOutline, BadgeIcon,
  PASSPORT_MAP_W, PASSPORT_MAP_H,
} from "@/lib/passportVisuals";

export const runtime = "edge";

const RADAR_SIZE = 200, RADAR_CX = 100, RADAR_CY = 100, RADAR_MAXR = 62, RADAR_LABEL_R = 82;
const MAP_W = PASSPORT_MAP_W, MAP_H = PASSPORT_MAP_H;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const page = url.searchParams.get("page"); // null = full spread, "stats" | "map" = single shareable page

  const data = await computePassportData(url.origin, url.searchParams.get("demo"));
  if (!data) {
    return new Response("Log in to generate your Adventure Passport.", { status: 401 });
  }
  const {
    name, username, avatarUrl, passportNo, issueDateISO,
    totalAdventures, statesCount, hardest, hasAceData, userAce, topAxis, aceRank,
    totalBadges, badges, badgeOverflow, stamps, stampOverflow,
  } = data;
  const issueDate = new Date(issueDateISO);

  const statsPage = (
    <div style={{ display: "flex", flexDirection: "column", background: PAPER, padding: "40px 46px", position: "relative", width: "100%", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, zIndex: 1 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: "#ff5100", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
          </svg>
        </div>
        <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 3, color: INK, opacity: 0.7 }}>{"TRAIL TO TIDES"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "row", marginTop: 20, zIndex: 1 }}>
        {[
          { label: "TYPE", value: "P" },
          { label: "CODE", value: "TTT" },
          { label: "PASSPORT NO.", value: passportNo },
          { label: "DATE OF ISSUE", value: fmtDate(issueDate) },
        ].map((f, i, arr) => (
          <div key={f.label} style={{ display: "flex", flexDirection: "column", paddingRight: 22, marginRight: 22, borderRight: i < arr.length - 1 ? "1px dashed rgba(36,26,18,0.25)" : "none" }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: INK, opacity: 0.45 }}>{f.label}</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: INK, marginTop: 3 }}>{f.value}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 22, zIndex: 1 }}>
        <span style={{ fontSize: 29, fontWeight: 800, letterSpacing: 2.5, color: INK }}>{"ADVENTURE PASSPORT"}</span>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 22, marginTop: 22, zIndex: 1 }}>
        <div style={{ width: 138, height: 168, display: "flex", alignItems: "center", justifyContent: "center", background: "#e9dfc3", border: `2px solid ${INK}`, borderRadius: 4, overflow: "hidden" }}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} width={138} height={168} style={{ objectFit: "cover" }} alt="" />
          ) : (
            <div style={{ display: "flex", opacity: 0.25 }}>
              <TypeIcon type="Mountaineering" size={54} color={INK} />
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 13 }}>
          {[
            { label: "NAME / NOM", value: name },
            { label: "USERNAME", value: username ? `@${username}` : "—" },
          ].map((f) => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", borderBottom: "1px dashed rgba(36,26,18,0.22)", paddingBottom: 8 }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: INK, opacity: 0.45 }}>{f.label}</span>
              <span style={{ fontSize: 17, fontWeight: 700, color: INK, marginTop: 3 }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 20, zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2.5, color: INK, opacity: 0.5 }}>{"ACHIEVEMENTS"}</span>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "baseline", gap: 9, marginTop: 8 }}>
          <span style={{ fontSize: 38, fontWeight: 800, color: INK }}>{totalAdventures}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: INK, opacity: 0.5 }}>{`ADVENTURES · ${statesCount} STATE${statesCount === 1 ? "" : "S"}`}</span>
        </div>
      </div>

      {hardest ? (
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", background: "rgba(36,26,18,0.045)", borderRadius: 10, padding: "9px 13px", gap: 12, marginTop: 12 }}>
          <div style={{ display: "flex", width: 34, height: 34, borderRadius: 8, background: tint(DIFFICULTY_COLOR[hardest.difficulty] ?? INK, 0.15), border: `1px solid ${tint(DIFFICULTY_COLOR[hardest.difficulty] ?? INK, 0.4)}`, alignItems: "center", justifyContent: "center" }}>
            <TypeIcon type={hardest.type} size={16} color={DIFFICULTY_COLOR[hardest.difficulty] ?? INK} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{truncate(hardest.name, 28)}</span>
            <span style={{ fontSize: 9, color: INK, opacity: 0.45, marginTop: 1 }}>{"Toughest completed"}</span>
          </div>
          <div style={{ display: "flex", padding: "3px 9px", borderRadius: 999, background: tint(DIFFICULTY_COLOR[hardest.difficulty] ?? INK, 0.14), border: `1px solid ${DIFFICULTY_COLOR[hardest.difficulty] ?? INK}` }}>
            <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: 0.5, color: DIFFICULTY_COLOR[hardest.difficulty] ?? INK }}>{hardest.difficulty.toUpperCase()}</span>
          </div>
        </div>
      ) : (
        <span style={{ display: "flex", fontSize: 12, color: INK, opacity: 0.4, marginTop: 10 }}>{"Mark your first adventure done to start earning achievements"}</span>
      )}

      <div style={{ display: "flex", marginTop: 20, borderBottom: "1px dashed rgba(36,26,18,0.3)" }} />

      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 14, marginTop: 16, zIndex: 1 }}>
        <div style={{ display: "flex", position: "relative", width: RADAR_SIZE, height: RADAR_SIZE, flexShrink: 0 }}>
          <svg width={RADAR_SIZE} height={RADAR_SIZE} viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`}>
            {[1 / 3, 2 / 3, 1].map((f, i) => (
              <polygon key={i} points={ptsStr(polygonVertices(RADAR_CX, RADAR_CY, RADAR_MAXR * f, 8))} fill="none" stroke={INK} strokeWidth={1} opacity={0.12} />
            ))}
            {polygonVertices(RADAR_CX, RADAR_CY, RADAR_MAXR, 8).map(([x, y], i) => (
              <line key={i} x1={RADAR_CX} y1={RADAR_CY} x2={x} y2={y} stroke={INK} strokeWidth={1} opacity={0.1} />
            ))}
            {hasAceData && (
              <polygon
                points={ptsStr(radarVertices(RADAR_CX, RADAR_CY, RADAR_AXES.map((ax) => userAce[ax]), 5, RADAR_MAXR))}
                fill="rgba(255,81,0,0.18)" stroke="#ff5100" strokeWidth={2}
              />
            )}
          </svg>
          {polygonVertices(RADAR_CX, RADAR_CY, RADAR_LABEL_R, 8).map(([x, y], i) => (
            <div key={i} style={{ display: "flex", position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 0.5, color: INK, opacity: 0.55 }}>{RADAR_AXIS_SHORT[RADAR_AXES[i]]}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: INK, opacity: 0.5 }}>{"CAPABILITY PROFILE"}</span>
            {aceRank && (
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 5, padding: "3px 9px 3px 7px", borderRadius: 999, background: tint(aceRank.color, 0.16), border: `1px solid ${aceRank.color}` }}>
                <svg width={9} height={9} viewBox="0 0 10 10">
                  <polygon points={ptsStr(starVertices(5, 5, 5, 2.1, 5))} fill={aceRank.color} />
                </svg>
                <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: 0.6, color: aceRank.color }}>{aceRank.label.toUpperCase()}</span>
              </div>
            )}
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: INK, marginTop: 8, lineHeight: 1.4 }}>
            {hasAceData ? `Strongest in ${RADAR_AXIS_LABELS[topAxis]}` : "Take the ACE assessment to build your profile"}
          </span>
          <span style={{ fontSize: 10, color: INK, opacity: 0.4, marginTop: 4, lineHeight: 1.4 }}>
            {hasAceData ? "From your ACE self-assessment — updated any time you retake it." : "8 quick questions map your physical profile at trailtotides.com/matchmaker."}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", marginTop: 14, zIndex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: INK, opacity: 0.5 }}>{`BADGES EARNED${totalBadges ? ` · ${totalBadges}` : ""}`}</span>
        {badges.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 9 }}>
            {badges.map((b) => (
              <div key={b.id} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, width: 318 }}>
                <div style={{ display: "flex", width: 26, height: 26, borderRadius: 999, background: tint(b.color, 0.15), border: `1.5px solid ${tint(b.color, 0.5)}`, alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <BadgeIcon name={b.icon} size={13} color={b.color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: INK, lineHeight: 1.2 }}>{truncate(b.name, 26)}</span>
              </div>
            ))}
            {badgeOverflow > 0 && (
              <span style={{ display: "flex", fontSize: 10, fontWeight: 700, color: INK, opacity: 0.4, alignItems: "center" }}>{`+ ${badgeOverflow} more`}</span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 11, color: INK, opacity: 0.4, marginTop: 6 }}>{"Complete adventures and take the ACE assessment to start unlocking badges"}</span>
        )}
      </div>

      <div style={{ display: "flex", flex: 1 }} />

      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", zIndex: 1 }}>
        <span style={{ fontSize: 11, color: INK, opacity: 0.4 }}>{"Issued electronically · trailtotides.com"}</span>
        <div style={{ display: "flex", marginLeft: "auto", flexDirection: "column", alignItems: "center", justifyContent: "center", width: 92, height: 46, borderRadius: 6, background: INK, border: `1.5px solid ${GOLD}`, transform: "rotate(-4deg)" }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: GOLD }}>{"TTT"}</span>
          <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1, color: "rgba(201,162,77,0.7)", marginTop: 2 }}>{"EST. 2024"}</span>
        </div>
      </div>
    </div>
  );

  const mapPage = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: PAPER, padding: "40px 44px", position: "relative", overflow: "hidden", width: "100%", height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
        <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: 3, color: INK, opacity: 0.5 }}>{"VISAS & ENDORSEMENTS"}</span>
        <div style={{ display: "flex", width: 90, height: 1, marginTop: 10, background: "rgba(36,26,18,0.25)" }} />
      </div>

      {stamps.length === 0 ? (
        <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "flex", width: 180, height: 180, borderRadius: 999, border: "2px dashed rgba(36,26,18,0.3)", alignItems: "center", justifyContent: "center" }}>
              <div style={{ display: "flex", opacity: 0.25 }}>
                <TypeIcon type="Trekking" size={54} color={INK} />
              </div>
            </div>
            <span style={{ fontSize: 16, fontWeight: 700, color: INK, opacity: 0.5, marginTop: 18 }}>{"Your first stamp awaits"}</span>
            <span style={{ fontSize: 12, color: INK, opacity: 0.35, marginTop: 6 }}>{"Mark an adventure done to fill this page"}</span>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", position: "relative", width: MAP_W, height: MAP_H, marginTop: 20 }}>
          <svg width={MAP_W} height={MAP_H} viewBox="0 0 420 480" style={{ position: "absolute", top: 0, left: 0 }}>
            <path d={INDIA_PATH} fill={tint(INK, 0.04)} stroke={tint(INK, 0.32)} strokeWidth={1.6} />
          </svg>

          {stamps.map((s) => {
            const color = DIFFICULTY_COLOR[s.difficulty] ?? INK;
            const size = (DIFFICULTY_STAMP_SIZE[s.difficulty] ?? 100) * s.stampScale * sizeJitter(s.seed);
            const rot = (mulberry32(s.seed * 7 + 3)() - 0.5) * 20;
            const detailed = size >= 110;
            return (
              <div
                key={s.slug}
                style={{
                  display: "flex", position: "absolute", left: `${s.dispX}%`, top: `${s.dispY}%`,
                  width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2,
                  alignItems: "center", justifyContent: "center", transform: `rotate(${rot}deg)`,
                }}
              >
                <StampOutline seed={s.seed} domain={s.domain} size={size} color={color} tier={DIFFICULTY_LEVEL[s.difficulty] ?? 1} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 6, zIndex: 1 }}>
                  <div style={{ display: "flex" }}>
                    <TypeIcon type={s.type} size={detailed ? 22 : 15} color={color} />
                  </div>
                  {detailed && (
                    <span style={{ display: "flex", fontSize: 12, fontWeight: 800, color, marginTop: 5, textAlign: "center", lineHeight: 1.15 }}>
                      {truncate(s.name, 18)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1 }}>
        {stampOverflow > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: INK, opacity: 0.45, marginBottom: 4 }}>{`+ ${stampOverflow} more journey${stampOverflow === 1 ? "" : "s"}`}</span>
        )}
        <span style={{ fontSize: 11, color: INK, opacity: 0.35 }}>{"trailtotides.com"}</span>
      </div>
    </div>
  );

  // Single-page shares — portrait, sized for Instagram/story-friendly export.
  // The passport page itself keeps its native (landscape-derived) content
  // density, so rather than stretch it to fill a tall canvas, it sits inside
  // a branded frame — like a photo card, not a cropped screenshot.
  if (page === "stats" || page === "map") {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", background: "radial-gradient(ellipse 90% 60% at 50% 10%, #7a1a26 0%, #4a0d16 55%, #2c0a10 100%)", padding: "56px 34px 40px", fontFamily: "sans-serif" }}>
          <div style={{ display: "flex", width: "100%", flex: 1, borderRadius: 22, overflow: "hidden", boxShadow: "0 24px 70px rgba(0,0,0,0.45)" }}>
            {page === "stats" ? statsPage : mapPage}
          </div>
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, marginTop: 34 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "#ff5100", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round">
                <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
              </svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: 3, color: "rgba(245,236,214,0.92)" }}>{"TRAIL TO TIDES"}</span>
          </div>
          <span style={{ display: "flex", fontSize: 14, fontWeight: 600, color: "rgba(245,236,214,0.5)", marginTop: 8 }}>{"My Adventure Passport · trailtotides.com"}</span>
        </div>
      ),
      { width: 1080, height: 1350 }
    );
  }

  // Default — the full two-page spread.
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "radial-gradient(ellipse 90% 70% at 50% 15%, #7a1a26 0%, #4a0d16 55%, #2c0a10 100%)", padding: 36, position: "relative", fontFamily: "sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "row", position: "relative" }}>
          <div style={{ flex: 1, display: "flex", borderTopLeftRadius: 16, borderBottomLeftRadius: 16, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, right: 0, bottom: 0, width: 34, display: "flex", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.14))", zIndex: 2 }} />
            {statsPage}
          </div>
          <div style={{ display: "flex", width: 10, background: "linear-gradient(90deg, rgba(0,0,0,0.22), rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.22))" }} />
          <div style={{ flex: 1.05, display: "flex", borderTopRightRadius: 16, borderBottomRightRadius: 16, overflow: "hidden", position: "relative" }}>
            <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 34, display: "flex", background: "linear-gradient(270deg, transparent, rgba(0,0,0,0.14))", zIndex: 2 }} />
            {mapPage}
          </div>
        </div>
      </div>
    ),
    { width: 1600, height: 1040 }
  );
}
