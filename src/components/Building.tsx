import { useState } from "react";
import { TRACKS, TRACK_HEX, byId } from "../data/course";
import { go } from "../lib/route";
import type { Progress } from "../lib/store";

// הקורס כבניין: כל קומה היא מסלול, כל חלון הוא שיעור. חלון שהושלם נדלק בזהב־חותמת.
// הטלה איזומטרית ב-SVG (שלוש פאות לכל קומה): אמינה בכל דפדפן ובצילום.
const COS = Math.cos(Math.PI / 6), SIN = 0.5;
const L = 300, D = 104, H = 46, GAP = 6, LIFT = 16;
const iso = (x: number, y: number, z: number) => [(x - y) * COS, (x + y) * SIN - z];
const pts = (list: number[][]) => list.map((p) => iso(p[0], p[1], p[2]).map((n) => n.toFixed(1)).join(",")).join(" ");
const mix = (hex: string, f: number, toWhite = false) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(toWhite ? v + (255 - v) * f : v * f));
  return `rgb(${c.join(",")})`;
};
const WIN = { done: "#E2B04A", part: "#F3DDA6", none: "#13253F" };

export default function Building({ progress, active, onActive }: { progress: Progress; active: string | null; onActive: (t: string | null) => void }) {
  const [lift, setLift] = useState(0);
  const floors = TRACKS.length;
  const ztop = floors * (H + GAP) + (floors - 1) * LIFT;
  const vb = [-D * COS - 12, -ztop - 30, L * COS + D * COS + 190, ztop + (L + D) * SIN + 60];

  return (
    <svg className="building" viewBox={vb.join(" ")} role="img"
      aria-label={`בניין הקורס: ${TRACKS.map((t) => t.name).join(", ")}`}
      onPointerEnter={() => setLift(1)} onPointerLeave={() => { setLift(0); onActive(null); }}>
      <polygon points={pts([[0, 0, 0], [L, 0, 0], [L, D, 0], [0, D, 0]])} fill="rgba(21,23,28,.10)" transform="translate(10 12)" />
      {TRACKS.map((t, i) => {
        const z = i * (H + GAP) + lift * i * LIFT;
        const hex = TRACK_HEX[t.id];
        const on = active === t.id, dim = active && !on;
        const n = t.lessons.length, m = 14, g = 8;
        const w = (L - 2 * m - (n - 1) * g) / n;
        const [lx, ly] = iso(L, 0, z + H / 2);
        return (
          <g key={t.id} className={`floor floor-rise${dim ? " dim" : ""}`} style={{ ["--i" as any]: i }}
            onPointerEnter={() => onActive(t.id)} onFocus={() => onActive(t.id)}>
            {/* פאה ימנית, קדמית ועליונה */}
            <polygon points={pts([[L, 0, z], [L, D, z], [L, D, z + H], [L, 0, z + H]])} fill={mix(hex, 0.62)} />
            <polygon points={pts([[0, D, z], [L, D, z], [L, D, z + H], [0, D, z + H]])} fill={mix(hex, 0.86)} />
            <polygon points={pts([[0, 0, z + H], [L, 0, z + H], [L, D, z + H], [0, D, z + H]])} fill={mix(hex, 0.55, true)} />
            <polyline points={pts([[0, D, z + H], [L, D, z + H], [L, 0, z + H]])} fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1" />
            {t.lessons.map((id, k) => {
              const l = byId(id)!;
              const done = (progress[id] || []).filter(Boolean).length;
              const state = done >= l.steps.length ? "done" : done > 0 ? "part" : "none";
              const x1 = L - m - k * (w + g), x0 = x1 - w;
              return (
                <g key={id} className="win" tabIndex={0} role="link" aria-label={`שיעור ${l.code}: ${l.title}`}
                  onClick={(e) => { e.stopPropagation(); go("lesson", String(id)); }}
                  onKeyDown={(e) => { if (e.key === "Enter") go("lesson", String(id)); }}>
                  <title>{`${l.code} · ${l.title} (${done}/${l.steps.length})`}</title>
                  <polygon points={pts([[x0, D, z + 9], [x1, D, z + 9], [x1, D, z + H - 9], [x0, D, z + H - 9]])} fill={WIN[state]} stroke="rgba(255,255,255,.35)" strokeWidth=".8" />
                  {state === "none" && <polygon points={pts([[x0, D, z + H - 9], [x0 + w * 0.45, D, z + H - 9], [x0 + w * 0.2, D, z + 9], [x0, D, z + 9]])} fill="rgba(255,255,255,.07)" />}
                </g>
              );
            })}
            {/* תווית קומה: שם בעברית ומספר באלמנטים נפרדים */}
            <line x1={lx + 4} y1={ly} x2={lx + 26} y2={ly} stroke={on ? "#15171C" : "#9A9EA6"} strokeWidth="1" />
            <text x={lx + 32} y={ly + 5} className="b-tip" style={{ fill: on ? "#15171C" : "#4E525B", fontWeight: on ? 700 : 500 }}>{t.name}</text>
          </g>
        );
      })}
    </svg>
  );
}
