// חיפוש עברי: התאמה בתחילת מילה, גם אחרי אותיות שימוש (ה, ו, ב, כ, ל, מ, ש).
// מילה קצרה עד 3 אותיות חייבת להיות שלמה, אחרת "אור" תופס "תאוריה".
const PREFIXES = "הובכלמש";
const strip = (s: string) => s.replace(/[֑-ׇ]/g, "").replace(/[״"׳']/g, "").toLowerCase();
const words = (s: string) => strip(s).split(/[^\p{L}\p{N}]+/u).filter(Boolean);

export const tokens = (q: string) => words(q);

const stems = (w: string) => {
  const out = [w];
  for (let i = 0; i < 2 && w.length > i + 3 && PREFIXES.includes(w[i]); i++) out.push(w.slice(i + 1));
  return out;
};
// גם המילה בטקסט וגם מילת החיפוש נבדקות עם ובלי אותיות שימוש
function wordHits(w: string, t: string) {
  const ws = stems(w);
  return stems(t).some((q) => ws.some((c) => (q.length <= 3 ? c === q : c.startsWith(q))));
}

export function matches(text: string, q: string) {
  const ts = tokens(q);
  if (!ts.length) return false;
  const ws = words(text);
  return ts.every((t) => ws.some((w) => wordHits(w, t)));
}

// מחזיר חלקים להדגשה: [טקסט, האם התאמה]
export function highlight(text: string, q: string): [string, boolean][] {
  const ts = tokens(q);
  if (!ts.length) return [[text, false]];
  const parts = text.split(/([\p{L}\p{N}״"׳']+)/u);
  return parts.map((p) => [p, /[\p{L}\p{N}]/u.test(p) && ts.some((t) => wordHits(strip(p), t))] as [string, boolean]);
}
