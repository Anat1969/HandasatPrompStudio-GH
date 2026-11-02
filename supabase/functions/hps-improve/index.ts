// HANDASAT: rewrites a learner's 3-layer prompt into its complete version.
// Keeps the learner's meaning and words, adds only what is missing, and explains each addition.
// Text: Gemini free tier (GEMINI_API_KEY) first, Claude (ANTHROPIC_API_KEY) as fallback, per docs/ai-text-standard.md. Open to every visitor, capped at HOURLY_LIMIT per hour. No content is stored.
import Anthropic from "npm:@anthropic-ai/sdk";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const SB_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SB_HEADERS = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };
const HOURLY_LIMIT = 60;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["settings", "project", "chat", "notes"],
  properties: {
    settings: { type: "string" },
    project: { type: "string" },
    chat: { type: "string" },
    notes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["layer", "change", "why"],
        properties: {
          layer: { type: "string", enum: ["settings", "project", "chat"] },
          change: { type: "string" },
          why: { type: "string" },
        },
      },
    },
  },
};

const SYSTEM = `את/ה מורה להנדסת פרומפטים לאדריכלים. התלמיד כתב פרומפט בשלוש שכבות:
הגדרות (מה שנכון תמיד), פרויקט (מה שנכון לסוג העבודה), צ'אט (מה שנכון לשאלה הזאת).
המשימה: לכתוב את הגרסה המלאה של הפרומפט שלו, כפי שהוא צריך להיראות בסוף.

כללים:
- שומרים על הכוונה, הנושא והמילים של התלמיד. לא מחליפים פרויקט ולא ממציאים פרויקט אחר.
- כל רכיב בשכבה שלו. רכיב שנכתב בשכבה הלא נכונה עובר לשכבה הנכונה.
- הגדרות חייבות לכלול: שפה וטון; מבנה תשובה קבוע (למשל "פתח בשורת תובנה"); עקרון אימות ("ציין מקור, וסמן מה צריך אימות").
- פרויקט חייב לכלול: תפקיד ("אתה יועץ..."); הקשר עם לפחות 3 פרטים (סוג מבנה, עיר, שטח, לקוח, קהל); תקנים או מסמכי רקע.
- צ'אט חייב לכלול: פועל משימה אחד (נתח, השווה, הצע...); פורמט פלט (טבלה, רשימה, עמודות); כמות או גבול (עד N שורות, בלי הקדמה); שורת דוגמה שמתחילה ב"לדוגמה:"; "לפני שאתה עונה, שאל אותי עד 2 שאלות הבהרה".
- מה שהתלמיד לא סיפק ואי אפשר לנחש: כותבים בסוגריים מרובעים למילוי, למשל [עיר], [שטח במ"ר]. לא ממציאים נתונים.
- מספר תקן כותבים רק כשהוא ודאי: ת"י 1045 בידוד תרמי, ת"י 1142 מעקות, ת"י 5281 בנייה בת קיימא, ת"י 5282 דירוג אנרגטי. אחרת [תקן רלוונטי].
- עברית טבעית, קצרה ומקצועית. כל הוראה בשורה נפרדת. בלי אימוג'י ובלי סימני קריאה.
- notes: לכל שינוי משמעותי, layer, change (עד 8 מילים: מה נוסף או הועבר), why (עד 20 מילים: למה זה משפר את התשובה).

מחזירים JSON בלבד, בצורה: {"settings": "...", "project": "...", "chat": "...", "notes": [{"layer": "settings|project|chat", "change": "...", "why": "..."}]}`;

async function callsLastHour(): Promise<number> {
  const since = new Date(Date.now() - 3600_000).toISOString();
  const r = await fetch(`${SB_URL}/rest/v1/hps_ai_calls?select=id&created_at=gte.${since}`, {
    method: "HEAD",
    headers: { ...SB_HEADERS, Prefer: "count=exact" },
  });
  return Number((r.headers.get("content-range") ?? "").split("/")[1]) || 0;
}
const log = (ok: boolean) =>
  fetch(`${SB_URL}/rest/v1/hps_ai_calls`, { method: "POST", headers: { ...SB_HEADERS, "Content-Type": "application/json" }, body: JSON.stringify({ ok }) }).catch(() => {});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if ((await callsLastHour()) >= HOURLY_LIMIT) return json({ error: "הרבה בקשות בשעה האחרונה. ההשלמה האוטומטית בדפדפן ממשיכה לעבוד." }, 429);

  let body: { settings?: string; project?: string; chat?: string; lesson?: string };
  try { body = await req.json(); } catch { return json({ error: "Invalid JSON" }, 400); }
  const cut = (s?: string) => String(s ?? "").slice(0, 3000);
  const s = cut(body.settings), p = cut(body.project), c = cut(body.chat);
  if (!(s + p + c).trim()) return json({ error: "הפרומפט ריק." }, 400);

  const userText = `${body.lesson ? `הקשר מהקורס: ${cut(body.lesson)}\n\n` : ""}<settings>\n${s}\n</settings>\n<project>\n${p}\n</project>\n<chat>\n${c}\n</chat>`;
  const errors: string[] = [];

  const gem = Deno.env.get("GEMINI_API_KEY")?.trim();
  if (gem) {
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${gem}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: userText }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.3 },
        }),
      });
      if (r.ok) {
        const d = await r.json();
        const text = d?.candidates?.[0]?.content?.parts?.map((x: { text?: string }) => x.text ?? "").join("") ?? "";
        const out = JSON.parse(text);
        if (typeof out.settings === "string" && typeof out.chat === "string") { log(true); return json({ ...out, provider: "gemini" }); }
        errors.push("gemini: bad shape");
      } else errors.push(`gemini ${r.status}`);
    } catch (e) { errors.push(`gemini: ${String(e).slice(0, 80)}`); }
  } else errors.push("gemini: no key");

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY")?.trim();
  if (apiKey) {
    try {
      const client = new Anthropic({ apiKey });
      const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 6000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        system: SYSTEM,
        output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
        messages: [{ role: "user", content: userText }],
      } as never);
      if (response.stop_reason !== "refusal") {
        const text = response.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
        log(true);
        return json({ ...JSON.parse(text), provider: "claude" });
      }
      errors.push("claude: refusal");
    } catch (err) {
      errors.push(err instanceof Anthropic.APIError ? `claude ${err.status}` : `claude: ${String(err).slice(0, 80)}`);
    }
  } else errors.push("claude: no key");

  log(false);
  return json({ error: "המודל לא זמין כרגע. ההשלמה בדפדפן ממשיכה לעבוד.", detail: errors }, 503);
});
