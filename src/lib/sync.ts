// סנכרון ל-Supabase (פרויקט cultura-GH): כל משתתף מזוהה בקוד סנכרון פרטי, והשרת שומר רק sha256 שלו.
// הגישה רק דרך הפונקציות hps_pull ו-hps_push. בלי חשבון ובלי סיסמה.
// מיזוג: לכל מפתח נשמרת חותמת זמן, והגרסה החדשה יותר מנצחת. עבודות בתיק: איחוד לפי מזהה.
import { PREFIX_PUBLIC, load, save, stamps } from "./store";
import { allWorks, putWork, delWork, type Work } from "./idb";

const URL_ = "https://ktqmwpbzcnzkhjskqisy.supabase.co/rest/v1/rpc/";
const KEY = "sb_publishable_IkreG7naPa1h-d4kGp1gpA_sLU4tg5q";

export type SyncStatus = { state: "off" | "idle" | "busy" | "ok" | "error"; at?: number; msg?: string };
let status: SyncStatus = { state: load<string>("sync:code", "") ? "idle" : "off" };
const subs = new Set<(s: SyncStatus) => void>();
const set = (s: SyncStatus) => { status = s; subs.forEach((f) => f(s)); };
export const onStatus = (f: (s: SyncStatus) => void) => { subs.add(f); f(status); return () => { subs.delete(f); }; };
export const getStatus = () => status;

async function rpc(fn: string, body: unknown) {
  const r = await fetch(URL_ + fn, { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(t.includes("too_fast") ? "too_fast" : t.includes("bad_cohort") ? "קוד כיתה: 8 עד 40 תווים, אותיות לועזיות קטנות, ספרות ומקף" : t.includes("bad_") ? "הנתונים גדולים מדי לסנכרון" : "השרת לא זמין");
  }
  return r.json();
}

export const newCode = () => {
  const a = new Uint8Array(15);
  crypto.getRandomValues(a);
  const abc = "abcdefghjkmnpqrstuvwxyz23456789";
  const raw = [...a].map((n) => abc[n % abc.length]).join("");
  return `${raw.slice(0, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 15)}`;
};
export const code = () => load<string>("sync:code", "");
export const learnerName = () => load<string>("sync:name", "");
export const cohort = () => load<string>("sync:cohort", "");
export const newCohort = () => "kita-" + newCode().slice(0, 11);

// מבט כיתה: שם, סימוני שלבים, מספר עבודות ועדכון אחרון. בלי רפלקציות ובלי תמונות.
export type CohortRow = { name: string | null; progress: Record<string, boolean[]>; works: number; updated_at: string };
export async function fetchCohort(code: string): Promise<CohortRow[]> {
  return (await rpc("hps_cohort", { p_cohort: code.trim().toLowerCase() })) || [];
}

function collect() {
  const ts = stamps();
  const out: Record<string, { v: unknown; t: number }> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (!k.startsWith(PREFIX_PUBLIC)) continue;
    const key = k.slice(PREFIX_PUBLIC.length);
    if (key.startsWith("sync:") || key.startsWith("_")) continue;
    try { out[key] = { v: JSON.parse(localStorage.getItem(k)!), t: ts[key] || 0 }; } catch { /* מפתח פגום */ }
  }
  return out;
}

// מיזוג חכם לפי סוג: התקדמות מתאחדת (שלב שבוצע באחד המכשירים נשאר מבוצע), ספרייה ומשתתפים מתאחדים.
const MERGE: Record<string, (a: any, b: any) => any> = {
  progress: (a = {}, b = {}) => {
    const out: Record<string, boolean[]> = { ...a };
    for (const [k, v] of Object.entries(b as Record<string, boolean[]>)) {
      const cur = out[k] || [];
      out[k] = Array.from({ length: Math.max(cur.length, v.length) }, (_, i) => !!(cur[i] || v[i]));
    }
    return out;
  },
  "studio:lib": (a = [], b = []) => {
    const seen = new Set(a.map((x: any) => x.id));
    return [...a, ...b.filter((x: any) => !seen.has(x.id))].sort((x: any, y: any) => y.at - x.at).slice(0, 50);
  },
  students: (a = [], b = []) => [...new Set([...a, ...b])],
  "works:deleted": (a = [], b = []) => [...new Set([...a, ...b])],
};

async function mergeIn(remote: { name?: string; state?: Record<string, { v: unknown; t: number }>; works?: Work[] }) {
  const ts = stamps();
  let changed = 0;
  for (const [k, { v, t }] of Object.entries(remote.state || {})) {
    if (k.startsWith("sync:")) continue;
    if (MERGE[k]) {
      const mine = load<unknown>(k, undefined as unknown);
      const merged = MERGE[k](mine, v);
      if (JSON.stringify(merged) !== JSON.stringify(mine)) { save(k, merged, Math.max(t, ts[k] || 0)); changed++; }
    } else if (!ts[k] || t > ts[k]) { save(k, v, t); changed++; }
  }
  const deleted = new Set(load<string[]>("works:deleted", []));
  const local = await allWorks().catch(() => [] as Work[]);
  const have = new Set(local.map((w) => w.id));
  for (const w of remote.works || []) {
    if (!have.has(w.id) && !deleted.has(w.id)) { await putWork(w).catch(() => {}); changed++; }
  }
  for (const w of local) if (deleted.has(w.id)) await delWork(w.id).catch(() => {});
  if (changed) window.dispatchEvent(new Event("hps-works"));
  return changed;
}

export async function pull() {
  const c = code();
  if (!c) return 0;
  set({ state: "busy", msg: "מושך מהשרת" });
  try {
    const r = await rpc("hps_pull", { p_key: c });
    const n = r ? await mergeIn(r) : 0;
    if (r?.name && !learnerName()) save("sync:name", r.name);
    if (r?.cohort && !cohort()) save("sync:cohort", r.cohort);
    set({ state: "ok", at: Date.now() });
    return n;
  } catch (e: any) {
    set({ state: "error", msg: e.message });
    return 0;
  }
}

let pushing = false, again = false;
export async function push() {
  const c = code();
  if (!c) return;
  if (pushing) { again = true; return; }
  pushing = true;
  set({ state: "busy", msg: "שומר בשרת" });
  try {
    const deleted = new Set(load<string[]>("works:deleted", []));
    const works = (await allWorks().catch(() => [] as Work[])).filter((w) => !deleted.has(w.id));
    await rpc("hps_push", { p_key: c, p_name: learnerName(), p_state: collect(), p_works: works, p_cohort: cohort() || null });
    set({ state: "ok", at: Date.now() });
  } catch (e: any) {
    if (e.message === "too_fast") again = true;
    else set({ state: "error", msg: e.message });
  } finally {
    pushing = false;
    if (again) { again = false; schedule(); }
  }
}

let timer: number | undefined;
export function schedule() {
  if (!code()) return;
  window.clearTimeout(timer);
  timer = window.setTimeout(push, 2500);
}

// מחבר קוד קיים (ממכשיר אחר) או יוצר חדש, ומסנכרן מיד
export async function connect(c: string, name: string) {
  save("sync:code", c.trim().toLowerCase());
  if (name.trim()) save("sync:name", name.trim());
  await pull();
  await push();
}
export function disconnect() {
  save("sync:code", "");
  set({ state: "off" });
}

export function startSync() {
  window.addEventListener("hps-store", (e) => { if (!String((e as CustomEvent).detail).startsWith("sync:")) schedule(); });
  window.addEventListener("hps-works", schedule);
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") pull(); });
  if (code()) pull().then(schedule);
}
