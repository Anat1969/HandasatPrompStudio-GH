// מדד איכות פרומפט: מנוע דטרמיניסטי שרץ בדפדפן, בלי שרת ובלי מודל.
// נשען על: (1) מודל שלוש השכבות של שיעור 01, (2) Anthropic, "Prompt engineering overview":
// להיות ברור וישיר, לתת הקשר ותפקיד, דוגמאות, פורמט פלט, ולתת למודל לחשוב בשלבים.
// מגבלה: הוא בודק נוכחות של רכיבים בטקסט, לא את נכונות התוכן. את זה בודק איש המקצוע.

export type Check = {
  key: string; name: string; what: string; how: string; limit: string; weight: number;
  score: number; // 0, 0.5, 1
  found: string;
};

const has = (t: string, re: RegExp) => { const m = t.match(re); return m ? m[0] : ""; };
const wc = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export function measure(layers: { settings: string; project: string; chat: string }): { checks: Check[]; total: number } {
  const all = `${layers.settings}\n${layers.project}\n${layers.chat}`;
  const c: Check[] = [];
  const push = (x: Omit<Check, "score" | "found">, score: number, found: string) => c.push({ ...x, score, found });

  const sWords = wc(layers.settings), pWords = wc(layers.project), cWords = wc(layers.chat);
  const layersFilled = [sWords >= 6, pWords >= 6, cWords >= 4].filter(Boolean).length;
  push({ key: "layers", name: "שלוש שכבות", weight: 2,
    what: "האם ההקשר מחולק להגדרות קבועות, הקשר פרויקט ושאלה נקודתית.",
    how: "שכבה נחשבת מלאה מ-6 מילים (צ'אט: מ-4). 3 שכבות: מלא. 2: חלקי.",
    limit: "לא בודק שהתוכן שובץ בשכבה הנכונה." },
    layersFilled === 3 ? 1 : layersFilled === 2 ? 0.5 : 0, layersFilled ? `${layersFilled} מתוך 3 שכבות` : "");

  const role = has(all, /(אתה|את|את\/ה)\s+(עוזר|יועץ|אדריכל|מומחה|חוקר|מתכנן|עורך|בוחן)[^\n.]{0,30}|בתור\s+\S+|you are [^\n.]{0,30}/i);
  push({ key: "role", name: "תפקיד", weight: 1,
    what: "האם המודל יודע מי הוא בשיחה.",
    how: "מחפש ניסוח כמו \"אתה יועץ...\" או \"בתור...\".",
    limit: "תפקיד כללי מדי עדיין עובר." }, role ? 1 : 0, role);

  const ctx = has(all, /(פרויקט|מגרש|תב"?ע|תקן|ת"י|תקנ|אקלים|לקוח|שכונה|עיר|רחוב|קומ|מ"ר|דונם|גוש|חלקה)/);
  const ctxCount = (all.match(/(פרויקט|מגרש|תב"?ע|תקן|ת"י|אקלים|לקוח|שכונה|עיר|רחוב|קומ|מ"ר|דונם|גוש|חלקה)/g) || []).length;
  push({ key: "context", name: "הקשר מקצועי", weight: 2,
    what: "מקום, סוג מבנה, תקן, לקוח: מה שהמודל לא יכול לנחש.",
    how: "סופר מונחי הקשר אדריכליים. 3 ומעלה: מלא. 1 עד 2: חלקי.",
    limit: "לא בודק שההקשר נכון או עדכני." }, ctxCount >= 3 ? 1 : ctxCount >= 1 ? 0.5 : 0, ctx ? `${ctxCount} מונחים, למשל "${ctx}"` : "");

  const task = has(layers.chat || all, /(נתח|כתוב|השווה|הצע|בנה|סכם|פרט|זהה|בדוק|תכנן|הפק|צור|מפה|דרג|תרגם|ערוך)/);
  push({ key: "task", name: "משימה ברורה", weight: 2,
    what: "פועל פעולה אחד שאומר מה לעשות, לא רק נושא.",
    how: "מחפש פועל ציווי (נתח, השווה, הצע...) בשכבת הצ'אט.",
    limit: "משימה כפולה או סותרת עדיין עוברת." }, task ? 1 : 0, task);

  const fmt = has(all, /(טבלה|טבלת|רשימה|רשימת|JSON|כותרות|נקודות|פסקה|פסקאות|עמודות|עמוד אחד|שקפים|פורמט|תבנית פלט|מבנה התשובה)/i);
  push({ key: "format", name: "פורמט פלט", weight: 1.5,
    what: "איך התשובה צריכה להיראות.",
    how: "מחפש תיאור צורה: טבלה, רשימה, עמודות, פסקאות.",
    limit: "לא בודק שהפורמט מתאים למטרה." }, fmt ? 1 : 0, fmt);

  const lim = has(all, /(עד\s+\d+|לפחות\s+\d+|לא יותר|בלי\s|ללא\s|רק\s|חובה|אסור|מקסימום|מינימום|\d+\s*(מילים|שורות|פריטים|נקודות|משפטים))/);
  push({ key: "limits", name: "מגבלות וגבולות", weight: 1,
    what: "כמה, עד איפה, ומה לא לעשות.",
    how: "מחפש מספר עם יחידה, או מילים כמו \"בלי\", \"רק\", \"עד\".",
    limit: "לא מבחין בין מגבלה חשובה למקרית." }, lim ? 1 : 0, lim);

  const ex = has(all, /(לדוגמה|למשל|דוגמה|דוגמא|כמו:|e\.g\.)/i);
  push({ key: "example", name: "דוגמה", weight: 1,
    what: "דוגמה אחת מראה למודל את הרמה והטון יותר מכל הסבר.",
    how: "מחפש \"לדוגמה\", \"למשל\" או \"כמו:\".",
    limit: "לא בודק שהדוגמה טובה." }, ex ? 1 : 0, ex);

  const verify = has(all, /(מקור|מקורות|ציין|צטט|הפניה|אמת|אימות|ודא|סמן מה|רמת ביטחון|אם אינך בטוח|אם חסר)/);
  push({ key: "verify", name: "אימות ומקורות", weight: 1.5,
    what: "האם הפרומפט מבקש מקור, ומסמן מה צריך בדיקה. נלמד בשיעור 21.",
    how: "מחפש \"ציין מקור\", \"ודא\", \"סמן מה צריך אימות\".",
    limit: "בקשה למקור לא מבטיחה שהמקור אמיתי." }, verify ? 1 : 0, verify);

  const think = has(all, /(שלב אחר שלב|צעד אחר צעד|בשלבים|לפני ש|קודם\s|שאל אותי|שאלות הבהרה|חשוב על)/);
  push({ key: "think", name: "חשיבה ושאלות הבהרה", weight: 1,
    what: "האם המודל מתבקש לחשוב בשלבים או לשאול לפני שהוא עונה.",
    how: "מחפש \"שלב אחר שלב\", \"לפני שאתה עונה\", \"שאל אותי\".",
    limit: "לא בודק שהשלבים נכונים." }, think ? 1 : 0, think);

  const wsum = c.reduce((s, x) => s + x.weight, 0);
  const total = Math.round((c.reduce((s, x) => s + x.weight * x.score, 0) / wsum) * 100);
  return { checks: c, total };
}

export const verdict = (n: number) =>
  n >= 80 ? { word: "מוכן לשליחה", tone: "permit" } : n >= 50 ? { word: "כמעט: חסרים רכיבים", tone: "amber" } : { word: "רמת צ'אט: הוסף הקשר", tone: "redline" };
