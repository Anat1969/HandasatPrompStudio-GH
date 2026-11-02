// "הגרסה המלאה": מודל (Gemini החינמי, Claude כגיבוי) משכתב את הפרומפט של התלמיד דרך פונקציית Edge hps-improve.
// אחר כך ההשלמה הדטרמיניסטית מוסיפה כל רכיב שעדיין חסר, כך שהציון תמיד 100.
// בלי רשת או בלי מודל: רק ההשלמה הדטרמיניסטית.
import { complete, LAYERS, type Layer, type Layers } from "./meter";

const FN = "https://ktqmwpbzcnzkhjskqisy.supabase.co/functions/v1/hps-improve";
const KEY = "sb_publishable_IkreG7naPa1h-d4kGp1gpA_sLU4tg5q";
const LABEL: Record<Layer, string> = { settings: "הגדרות", project: "פרויקט", chat: "צ'אט" };

export type Note = { layer: Layer; change: string; why: string };
export type Improved = { layers: Layers; notes: Note[]; provider: "gemini" | "claude" | "local"; base: string };

export async function improve(d: Layers): Promise<Improved> {
  const base = JSON.stringify([d.settings, d.project, d.chat]);
  let layers: Layers = { settings: d.settings, project: d.project, chat: d.chat };
  let notes: Note[] = [];
  let provider: Improved["provider"] = "local";
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 30000);
    const r = await fetch(FN, { method: "POST", signal: ctl.signal, headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify(layers) });
    clearTimeout(t);
    if (r.ok) {
      const o = await r.json();
      if (LAYERS.every((k) => typeof o[k] === "string")) {
        layers = { settings: o.settings, project: o.project, chat: o.chat };
        notes = (Array.isArray(o.notes) ? o.notes : []).filter((n: Note) => LAYERS.includes(n.layer));
        provider = o.provider === "claude" ? "claude" : "gemini";
      }
    }
  } catch { /* בלי רשת: השלמה מקומית */ }
  const done = complete(layers);
  for (const a of done.added) notes.push({ layer: a.layer, change: a.moved ? `הועבר לכאן: ${a.name}` : `נוסף: ${a.name}`, why: a.why });
  if (provider === "local" && !done.added.length) notes.push({ layer: "chat", change: "הפרומפט כבר מלא", why: `כל 11 הרכיבים נמצאים בשכבה שלהם (${LABEL.chat}, ${LABEL.project}, ${LABEL.settings}).` });
  return { layers: done.layers, notes, provider, base };
}
