// מדד איכות פרומפט, מפורק לפי שלוש השכבות: הגדרות, פרויקט, צ'אט.
// מנוע דטרמיניסטי שרץ בדפדפן, בלי שרת ובלי מודל. אותו טקסט מקבל תמיד אותו ציון.
// נשען על: (1) מודל שלוש השכבות של שיעור 01, (2) Anthropic, "Prompt engineering overview":
// להיות ברור וישיר, לתת הקשר ותפקיד, דוגמאות, פורמט פלט, ולתת למודל לחשוב בשלבים.
// כל רכיב נבדק בשכבה שלו. רכיב שנמצא בשכבה אחרת מקבל חצי ציון והוראה להעביר אותו.
// מגבלה: בודק נוכחות של רכיבים בטקסט, לא את נכונות התוכן. את זה בודק איש המקצוע.

export type Layer = "settings" | "project" | "chat";
export type Layers = Record<Layer, string>;
export const LAYER_NAME: Record<Layer, string> = { settings: "הגדרות", project: "פרויקט", chat: "צ'אט" };
export const LAYERS: Layer[] = ["settings", "project", "chat"];

type Rule = {
  key: string; layer: Layer; name: string; weight: number;
  what: string; how: string; limit: string; fix: string;
  test: (t: string) => string; // מחזיר את מה שנמצא, או ריק
  full?: (t: string) => boolean; // תנאי לציון מלא, כשנמצא (ברירת מחדל: מלא)
};
export type Check = Omit<Rule, "test" | "full"> & { score: number; found: string; elsewhere?: Layer };

const m = (re: RegExp) => (t: string) => { const x = t.match(re); return x ? x[0] : ""; };
const CTX = /(פרויקט|מגרש|תב"?ע|אקלים|לקוח|שכונה|עיר|רחוב|קומ|מ"ר|דונם|גוש|חלקה|גילאי|מגורים|ציבור|משרד|בית ספר|גן ילדים|אשדוד|תל אביב|ירושלים|חיפה|באר שבע)/g;

export const RULES: Rule[] = [
  { key: "lang", layer: "settings", name: "שפה וטון", weight: 1,
    what: "באיזו שפה ובאיזה טון לענות, תמיד.",
    how: "מחפש שם שפה או טון: עברית, מקצועי, ישיר, רשמי.",
    limit: "לא בודק שהטון מתאים לקהל.",
    fix: "ענה בעברית, בטון מקצועי־אדריכלי.",
    test: m(/(עברית|אנגלית|בטון|טון\s|מקצועי|ישיר|רשמי|פורמלי)/) },
  { key: "shape", layer: "settings", name: "מבנה תשובה קבוע", weight: 1,
    what: "איך כל תשובה בנויה: פתיחה, סדר, אורך.",
    how: "מחפש הוראת מבנה: פתח ב, סיכום, תובנה, פסקאות, כותרות.",
    limit: "לא בודק שהמבנה עקבי עם הצ'אט.",
    fix: "פתח בשורת תובנה אחת, ואז פרט בפסקאות קצרות.",
    test: m(/(פתח ב|התחל ב|סיכום|סכם|תובנה|פסקאות|כותרות|נקודות|מבנה)/) },
  { key: "verify", layer: "settings", name: "עקרון אימות", weight: 1.5,
    what: "האם המודל מתבקש לציין מקור ולסמן ספק. נלמד בשיעור 21.",
    how: "מחפש: מקור, ציין, סמן מה צריך אימות, ודא.",
    limit: "בקשה למקור לא מבטיחה שהמקור אמיתי.",
    fix: "כשאתה מסתמך על תקן או נתון, ציין את המקור, וסמן מה צריך אימות.",
    test: m(/(מקור|מקורות|ציין|צטט|הפניה|אמת|אימות|ודא|סמן מה|רמת ביטחון|אם אינך בטוח)/) },

  { key: "role", layer: "project", name: "תפקיד", weight: 1,
    what: "מי המודל בפרויקט הזה.",
    how: "מחפש: \"אתה יועץ...\", \"בתור...\".",
    limit: "תפקיד כללי מדי עדיין עובר.",
    fix: "אתה יועץ תכנון אדריכלי בפרויקט הזה.",
    test: m(/(אתה|את|את\/ה)\s+(עוזר|יועץ|יועצת|אדריכל|מומחה|חוקר|מתכנן|עורך|בוחן)[^\n.]{0,30}|בתור\s+\S+|you are [^\n.]{0,30}/i) },
  { key: "context", layer: "project", name: "הקשר מקצועי", weight: 2,
    what: "מקום, סוג מבנה, קהל ולקוח: מה שהמודל לא יכול לנחש.",
    how: "סופר מונחי הקשר אדריכליים. 3 ומעלה: מלא. 1 עד 2: חלקי.",
    limit: "לא בודק שההקשר נכון או עדכני.",
    fix: "פרויקט: [סוג המבנה] ב[עיר], [שטח במ\"ר]. לקוח: [מי].",
    test: (t) => { const n = (t.match(CTX) || []).length; return n ? `${n} מונחים, למשל "${t.match(CTX)![0]}"` : ""; },
    full: (t) => (t.match(CTX) || []).length >= 3 },
  { key: "docs", layer: "project", name: "תקנים ומסמכי רקע", weight: 1.5,
    what: "על אילו מסמכים המודל נשען: תקן, תב\"ע, פרוגרמה.",
    how: "מחפש: תקן, ת\"י, מסמכי רקע, הנחיות, פרוגרמה, תב\"ע.",
    limit: "לא בודק שמספר התקן נכון (ראו שיעור 21).",
    fix: "מסמכי רקע: [תקן רלוונטי, למשל ת\"י 1045 לבידוד תרמי], [פרוגרמה או תב\"ע].",
    test: m(/(ת"י|תקן|תקנים|תקנות|מסמכי רקע|הנחיות|פרוגרמה|תב"?ע|הוראות)/) },

  { key: "task", layer: "chat", name: "משימה ברורה", weight: 2,
    what: "פועל פעולה אחד שאומר מה לעשות, לא רק נושא.",
    how: "מחפש פועל ציווי: נתח, השווה, הצע, בנה, סכם, בדוק.",
    limit: "משימה כפולה או סותרת עדיין עוברת.",
    fix: "הצע [מה בדיוק] עבור [החלק בפרויקט].",
    test: m(/(נתח|כתוב|השווה|הצע|בנה|סכם|פרט|זהה|בדוק|תכנן|הפק|צור|מפה|דרג|תרגם|ערוך)/) },
  { key: "format", layer: "chat", name: "פורמט פלט", weight: 1.5,
    what: "איך התוצר של השאלה הזאת נראה.",
    how: "מחפש תיאור צורה: טבלה, רשימה, עמודות, עמוד אחד.",
    limit: "לא בודק שהפורמט מתאים למטרה.",
    fix: "פורמט: טבלה של 4 עמודות (נושא, המלצה, נימוק, מקור).",
    test: m(/(טבלה|טבלת|רשימה|רשימת|JSON|עמודות|עמוד אחד|שקפים|פורמט|תבנית פלט)/i) },
  { key: "limits", layer: "chat", name: "כמות וגבולות", weight: 1,
    what: "כמה, עד איפה, ומה לא לעשות.",
    how: "מחפש מספר עם יחידה, או \"עד\", \"לפחות\", \"בלי\", \"רק\".",
    limit: "לא מבחין בין מגבלה חשובה למקרית.",
    fix: "עד 8 שורות, בלי הקדמה.",
    test: m(/(עד\s+\d+|לפחות\s+\d+|לא יותר|בלי\s|ללא\s|רק\s|מקסימום|מינימום|\d+\s*(מילים|שורות|פריטים|נקודות|משפטים|עמודות|שקפים))/) },
  { key: "example", layer: "chat", name: "דוגמה", weight: 1,
    what: "שורה לדוגמה מראה למודל את הרמה והטון.",
    how: "מחפש \"לדוגמה\", \"למשל\" או \"כמו:\".",
    limit: "לא בודק שהדוגמה טובה.",
    fix: "לדוגמה: \"[נושא] | [המלצה] | [נימוק] | [מקור]\".",
    test: m(/(לדוגמה|למשל|דוגמה|דוגמא|כמו:|e\.g\.)/i) },
  { key: "think", layer: "chat", name: "שאלות הבהרה", weight: 1,
    what: "האם המודל שואל לפני שהוא מנחש.",
    how: "מחפש \"שאל אותי\", \"שאלות הבהרה\", \"לפני שאתה עונה\", \"שלב אחר שלב\".",
    limit: "לא בודק שהשאלות רלוונטיות.",
    fix: "לפני שאתה עונה, שאל אותי עד 2 שאלות הבהרה.",
    test: m(/(שלב אחר שלב|צעד אחר צעד|בשלבים|לפני ש|שאל אותי|שאלות הבהרה|חשוב על)/) },
];

export function measure(l: Layers) {
  const checks: Check[] = RULES.map((r) => {
    const own = r.test(l[r.layer] || "");
    if (own) {
      const full = r.full ? r.full(l[r.layer]) : true;
      const { test, full: _f, ...rest } = r;
      return { ...rest, score: full ? 1 : 0.5, found: own };
    }
    const other = LAYERS.find((x) => x !== r.layer && r.test(l[x] || ""));
    const { test, full: _f, ...rest } = r;
    return { ...rest, score: other ? 0.5 : 0, found: other ? r.test(l[other]) : "", elsewhere: other };
  });
  const sum = (cs: Check[]) => {
    const w = cs.reduce((s, x) => s + x.weight, 0);
    return Math.round((cs.reduce((s, x) => s + x.weight * x.score, 0) / w) * 100);
  };
  const byLayer = Object.fromEntries(LAYERS.map((x) => [x, sum(checks.filter((c) => c.layer === x))])) as Record<Layer, number>;
  return { checks, total: sum(checks), byLayer };
}

export const verdict = (n: number) =>
  n >= 100 ? { word: "מלא: כל הרכיבים במקומם", tone: "permit" }
    : n >= 80 ? { word: "כמעט מלא", tone: "permit" }
    : n >= 50 ? { word: "חסרים רכיבים", tone: "amber" }
    : { word: "רמת צ'אט: הוסף הקשר", tone: "redline" };

// השלמה דטרמיניסטית: מוסיפה לכל שכבה רק את מה שחסר בה, בסוגריים מרובעים למילוי.
// מבטיחה ציון 100: כל רכיב חסר מקבל משפט שעובר את הבדיקה שלו.
export type Added = { layer: Layer; key: string; name: string; text: string; why: string; moved?: Layer };
const split = (t: string) => t.split(/(?<=[.\n])\s*/).map((x) => x.trim()).filter(Boolean);
export function complete(l: Layers): { layers: Layers; added: Added[] } {
  const out: Layers = { ...l };
  const added: Added[] = [];
  // קודם מעבירים משפט של התלמיד שנכתב בשכבה הלא נכונה, במילים שלו
  for (const r of RULES) {
    if (r.test(out[r.layer] || "")) continue;
    for (const src of LAYERS) {
      if (src === r.layer) continue;
      const parts = split(out[src] || "");
      const i = parts.findIndex((x) => r.test(x) && !RULES.some((o) => o.layer === src && o.test(x)));
      if (i < 0) continue;
      const [sent] = parts.splice(i, 1);
      out[src] = parts.join("\n");
      out[r.layer] = (out[r.layer].trim() ? out[r.layer].trim() + "\n" : "") + sent;
      added.push({ layer: r.layer, key: r.key, name: r.name, text: sent, why: `הועבר משכבת ה${LAYER_NAME[src]}: ${r.what}`, moved: src });
      break;
    }
  }
  for (const r of RULES) {
    const own = r.test(out[r.layer] || "");
    const ok = own && (!r.full || r.full(out[r.layer]));
    if (ok) continue;
    let text = r.fix;
    if (r.key === "context" && own) text = "פרויקט: [סוג המבנה] ב[עיר], [שטח במ\"ר]. לקוח: [מי].";
    out[r.layer] = (out[r.layer].trim() ? out[r.layer].trim() + "\n" : "") + text;
    added.push({ layer: r.layer, key: r.key, name: r.name, text, why: r.what });
  }
  return { layers: out, added };
}
