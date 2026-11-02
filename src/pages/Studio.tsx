import { useMemo, useState } from "react";
import Rich from "../components/Rich";
import { IconCopy, IconX } from "../components/Icons";
import { assemble, DEFAULT_SETTINGS } from "../lib/prompt";
import { LAYER_NAME, LAYERS, measure, verdict, type Layer, type Layers } from "../lib/meter";
import { improve, type Improved } from "../lib/improve";
import { href } from "../lib/route";
import { useStored } from "../lib/store";
import { copyText } from "./Lesson";

type Draft = Layers & { from?: string };
type Saved = Draft & { id: string; name: string; at: number; score: number };

const PRESETS: { name: string; d: Draft }[] = [
  { name: "רמת צ'אט בלבד", d: { settings: "", project: "", chat: "עזור לי לתכנן כיתה לבית ספר" } },
  { name: "שלוש שכבות: כיתה", d: {
    settings: DEFAULT_SETTINGS,
    project: "אתה יועץ תכנון למבני חינוך.\nפרויקט: בית ספר יסודי באשדוד, גילאי 6 עד 12, אקלים ים־תיכוני לח.\nמסמכי רקע: הנחיות משרד החינוך לתכנון בתי ספר, ת\"י 1045 (בידוד תרמי).",
    chat: "הצע תכנון לכיתת אם אחת: שטח, תאורה טבעית, אקוסטיקה וריהוט.\nפורמט: טבלה של 4 עמודות (נושא, המלצה, נימוק, מקור), עד 8 שורות.\nלדוגמה: \"תאורה | חלונות בצפון | אור רך בלי סנוור | ...\".\nלפני שאתה עונה, שאל אותי עד 2 שאלות הבהרה.",
  } },
  { name: "הכול בצ'אט, בלי סדר", d: {
    settings: "",
    project: "",
    chat: "אתה יועץ תכנון. ענה בעברית. בדוק את הצעת החזית לבניין מגורים בתל אביב מול ת\"י 1045, ופתח בסיכום.",
  } },
];

const RULES = [
  ["01", "נכון תמיד? להגדרות.", "שפה, טון ומבנה נכתבים פעם אחת, לא בכל שאלה."],
  ["02", "נכון לפרויקט? לפרויקט.", "מגרש, תקן ולקוח נכנסים לשכבה שהמודל זוכר לאורך העבודה."],
  ["03", "פועל אחד, תוצר אחד.", "\"השווה\" או \"נתח\", ולצדו איך התוצר נראה: טבלה, רשימה, עמוד."],
  ["04", "דוגמה אחת שווה פסקה.", "שורה לדוגמה מראה רמה וטון טוב יותר מכל הסבר."],
  ["05", "בקש מקור, וסמן ספק.", "AI טועה בביטחון. בקשו מספר תקן ונושא, ובדקו אותו (שיעור 21)."],
  ["06", "תן לו לשאול.", "\"לפני שאתה עונה, שאל עד 2 שאלות\" חוסך סבב תיקון שלם."],
];

const LAYER_C: Record<Layer, string> = { settings: "var(--t-base)", project: "var(--t-research)", chat: "var(--t-urban)" };
const LAYER_HINT: Record<Layer, [string, string, string]> = {
  settings: ["המטבח: נכון תמיד", "שפה, טון, מבנה ועקרון אימות.", "ענה בעברית, בטון מקצועי. פתח בשורת תובנה..."],
  project: ["התפריט: נכון לסוג העבודה", "תפקיד, מקום, סוג מבנה, תקנים ומסמכי רקע.", "אתה יועץ תכנון... פרויקט: ... תקנים: ..."],
  chat: ["ההזמנה: נכון עכשיו", "פועל אחד, פורמט פלט, כמות, דוגמה ושאלות הבהרה.", "השווה... פורמט: טבלה של... לדוגמה: ..."],
};

// שורות שנוספו בגרסה המלאה (לא היו במקור) מסומנות במרקר
function DiffText({ before, after }: { before: string; after: string }) {
  const had = new Set(before.split("\n").map((x) => x.trim()).filter(Boolean));
  return (
    <div className="prompt-box" style={{ minHeight: 60 }}>
      {after.split("\n").map((line, i) => (
        <span key={i} className="lyr">{had.has(line.trim()) || !line.trim() ? line : <mark className="added">{line}</mark>}</span>
      ))}
    </div>
  );
}

export default function Studio({ toast }: { toast: (s: string) => void }) {
  const [d, setD, saved] = useStored<Draft>("studio:draft", PRESETS[1].d);
  const [lib, setLib] = useStored<Saved[]>("studio:lib", []);
  const [ideal, setIdeal] = useState<Improved | null>(null);
  const [busy, setBusy] = useState(false);
  const { checks, total, byLayer } = useMemo(() => measure(d), [d]);
  const v = verdict(total);
  const full = assemble(d);
  const R = 50, C = 2 * Math.PI * R;
  const toneVar = `var(--${v.tone})`;
  const fresh = ideal && ideal.base === JSON.stringify([d.settings, d.project, d.chat]);

  const set = (k: Layer) => (e: React.ChangeEvent<HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });
  const store = () => {
    const name = d.from || (d.chat.trim().split(/\s+/).slice(0, 6).join(" ") || "פרומפט בלי שם");
    setLib([{ ...d, id: String(Date.now()), name, at: Date.now(), score: total }, ...lib].slice(0, 50));
    toast(`נשמר בספרייה: ${name}`);
  };
  const showIdeal = async () => {
    setBusy(true);
    try { setIdeal(await improve(d)); } finally { setBusy(false); }
    setTimeout(() => document.getElementById("ideal")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <main className="page">
      <div className="crumbs"><a href={href("home")}>הבית</a><span>/</span><span>סטודיו פרומפטים</span></div>
      <div className="kicker">סטודיו</div>
      <h1 className="page-title">פרומפט נבנה בשכבות, ונמדד.</h1>
      <p className="page-sub lines">
        <span>כותבים כל שכבה בנפרד. המדד בודק <strong>11</strong> רכיבים, כל אחד <strong>בשכבה שלו</strong>.</span>
        <span>"הגרסה המלאה" מראה איך הפרומפט שלך צריך להיראות בסוף, כדי לקבל <strong>100</strong>.</span>
      </p>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="דוגמאות מוכנות">
          <span className="chip-hint" style={{ marginInlineStart: 0 }}>טען דוגמה:</span>
          {PRESETS.map((p) => <button key={p.name} className="chip-t" onClick={() => { setD(p.d); setIdeal(null); }}>{p.name}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {d.from && <span className="mode-note">נטען מ: <strong>{d.from}</strong></span>}
          <span className="saved">{saved ? "נשמר" : ""}</span>
          <button className="press btn-quiet" onClick={() => { setD({ settings: "", project: "", chat: "" }); setIdeal(null); }}>ניקוי</button>
        </div>
      </div>

      <div className="studio">
        <section aria-label="שלוש השכבות">
          {LAYERS.map((k) => (
            <div key={k} className="layer" style={{ ["--c" as any]: LAYER_C[k] }}>
              <div className="layer-head">
                <b>{LAYER_NAME[k]}</b>
                <small>{LAYER_HINT[k][0]}</small>
                <bdi className="num layer-score" style={{ color: `var(--${verdict(byLayer[k]).tone})` }}>{byLayer[k]}</bdi>
              </div>
              <span className="rule-line">{LAYER_HINT[k][1]}</span>
              <textarea className="field" aria-label={`שכבת ה${LAYER_NAME[k]}`} rows={k === "chat" ? 5 : 4} value={d[k]} onChange={set(k)} placeholder={LAYER_HINT[k][2]} />
            </div>
          ))}

          <h2 className="section-title" style={{ marginTop: 28 }}>הפרומפט המלא</h2>
          <div className="prompt-box" aria-label="הפרומפט המורכב">{full || "כתבו בשכבות למעלה, והפרומפט המלא יופיע כאן."}</div>
          <div className="step-acts">
            <button className="press btn btn-main" disabled={!full || busy} onClick={showIdeal}>{busy ? "כותב את הגרסה המלאה..." : "הראה איך זה צריך להיראות"}</button>
            <button className="press btn" disabled={!full} onClick={() => copyText(full, toast)}><IconCopy width={16} height={16} />העתק פרומפט</button>
            <button className="press btn" disabled={!full} onClick={store}>שמור בספרייה</button>
          </div>
          <p className="mode-note" style={{ marginTop: 8 }}>בפלטפורמה עצמה: את ההגדרות מדביקים פעם אחת בהעדפות, את הפרויקט בהוראות הפרויקט, ורק את הצ'אט שולחים בכל פעם.</p>
        </section>

        <aside className="meter" aria-label="מדד איכות">
          <div className="card">
            <div className="gauge">
              <svg viewBox="0 0 120 120" role="img" aria-label={`ציון ${total} מתוך 100`}>
                <circle cx="60" cy="60" r={R} fill="none" stroke="var(--rule-soft)" strokeWidth="10" />
                <circle cx="60" cy="60" r={R} fill="none" stroke={toneVar} strokeWidth="10" strokeDasharray={`${(total / 100) * C} ${C}`} transform="rotate(-90 60 60)" style={{ transition: "stroke-dasharray .4s ease" }} />
                <text x="60" y="68" textAnchor="middle" className="g-num" style={{ fill: "var(--ink)", fontFamily: "var(--mono)", fontWeight: 600, fontSize: 30 }}>{total}</text>
              </svg>
              <div>
                <span className="label">מדד איכות פרומפט</span>
                <div style={{ fontSize: 20, fontWeight: 700, color: toneVar }}>{v.word}</div>
                <div className="layer-bars">
                  {LAYERS.map((k) => (
                    <div key={k} className="lb"><span>{LAYER_NAME[k]}</span><span className="bar"><i style={{ width: `${byLayer[k]}%`, background: `var(--${verdict(byLayer[k]).tone})` }} /></span><bdi className="num">{byLayer[k]}</bdi></div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {LAYERS.map((k) => {
            const cs = checks.filter((c) => c.layer === k);
            const todo = cs.filter((c) => c.score < 1).length;
            return (
              <section key={k} className="checks" style={{ ["--c" as any]: LAYER_C[k] }} aria-label={`בדיקות שכבת ה${LAYER_NAME[k]}`}>
                <div className="checks-head">
                  <b>{LAYER_NAME[k]}</b>
                  <span>{todo ? <>מה לתקן כאן: <bdi className="num">{todo}</bdi></> : "הכול במקום"}</span>
                </div>
                {cs.map((c) => {
                  const st = c.score === 1 ? "pass" : c.score > 0 ? "part" : "fail";
                  return (
                    <div key={c.key} className={`check ${st}`}>
                      <span className="mk" aria-hidden="true">{st === "pass" ? "✓" : st === "part" ? "½" : "✗"}</span>
                      <div>
                        <b>{c.name}</b>
                        {st === "pass" && <small>נמצא: "{c.found.slice(0, 40)}"</small>}
                        {c.elsewhere && <small className="move">נמצא בשכבת ה<strong>{LAYER_NAME[c.elsewhere]}</strong>. מקומו כאן.</small>}
                        {st === "part" && !c.elsewhere && <small>{c.found}. חסר עוד פרט.</small>}
                        {st !== "pass" && <small className="fix">להוסיף: {c.fix}</small>}
                        <details>
                          <summary>איך זה נמדד</summary>
                          <div><strong>בודק:</strong> {c.what}</div>
                          <div><strong>חישוב:</strong> {c.how}</div>
                          <div><strong>מגבלה:</strong> {c.limit}</div>
                        </details>
                      </div>
                      <span className="pts">×{c.weight}</span>
                    </div>
                  );
                })}
              </section>
            );
          })}
          <div className="checks">
            <div className="check na">
              <span className="mk" aria-hidden="true">–</span>
              <div><b>נכונות התוכן</b><small>לא נמדד. מספרי תקנים, מידות ועובדות בודק איש המקצוע.</small></div>
              <span className="pts">אדם</span>
            </div>
          </div>
          <p className="src">
            על מה המדד נשען: מודל שלוש השכבות (שיעור 01), ומדריך הנדסת הפרומפטים של Anthropic: בהירות, הקשר ותפקיד, דוגמאות, פורמט, וחשיבה בשלבים.{" "}
            <a href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" target="_blank" rel="noreferrer">המקור</a>.
            אמינות: מנוע דטרמיניסטי. אותו טקסט מקבל תמיד אותו ציון. רכיב בשכבה הלא נכונה מקבל חצי.
          </p>
        </aside>
      </div>

      {ideal && (
        <section id="ideal" className="ideal" aria-label="הגרסה המלאה">
          <h2 className="section-title">הגרסה המלאה: כך הפרומפט שלך צריך להיראות.</h2>
          <p className="section-lead lines">
            <span>השורות המסומנות במרקר <mark className="added">נוספו או הועברו</mark>. מה שבסוגריים מרובעים, ממלאים בפרטים שלכם.</span>
            <span>
              ציון הגרסה המלאה: <strong className="num" style={{ color: "var(--permit)" }}>{measure(ideal.layers).total}</strong>.{" "}
              {ideal.provider === "local" ? "נבנתה בהשלמה אוטומטית בדפדפן, כי המודל לא זמין כרגע." : `נכתבה ב-${ideal.provider === "gemini" ? "Gemini" : "Claude"}, והשלמה אוטומטית ווידאה שכל רכיב קיים.`}
              {!fresh && <strong style={{ color: "var(--amber)" }}> הפרומפט השתנה מאז. לחצו שוב לגרסה מעודכנת.</strong>}
            </span>
          </p>
          <div className="ideal-grid">
            {LAYERS.map((k) => (
              <div key={k} className="layer" style={{ ["--c" as any]: LAYER_C[k] }}>
                <div className="layer-head"><b>{LAYER_NAME[k]}</b><small>שלך: <bdi className="num">{byLayer[k]}</bdi> · מלא: <bdi className="num">{measure(ideal.layers).byLayer[k]}</bdi></small></div>
                <DiffText before={d[k]} after={ideal.layers[k]} />
                {ideal.notes.filter((n) => n.layer === k).map((n, i) => (
                  <div key={i} className="note"><strong>{n.change}</strong><span>{n.why}</span></div>
                ))}
              </div>
            ))}
          </div>
          <div className="step-acts">
            <button className="press btn btn-main" onClick={() => { setD({ ...ideal.layers, from: d.from }); toast("הגרסה המלאה הוחלה. מלאו את הסוגריים."); }}>החל את הגרסה המלאה</button>
            <button className="press btn" onClick={() => copyText(assemble(ideal.layers), toast)}><IconCopy width={16} height={16} />העתק אותה</button>
            <button className="press btn-quiet" onClick={() => setIdeal(null)}>הסתר</button>
          </div>
        </section>
      )}

      <h2 className="section-title">הספרייה שלי</h2>
      <p className="section-lead">פרומפטים ששמרתם, עם הציון שקיבלו.</p>
      {lib.length === 0 ? (
        <div className="empty card"><b>הספרייה ריקה.</b>כתבו פרומפט ולחצו "שמור בספרייה", או פתחו פרומפט פתיחה מתוך שיעור.</div>
      ) : (
        <div className="library">
          {lib.map((s) => (
            <div key={s.id} className="card lib-row">
              <div><b>{s.name}</b><small>ציון <bdi className="num">{s.score}</bdi> · {new Date(s.at).toLocaleDateString("he-IL")}</small></div>
              <button className="press btn-quiet" onClick={() => { setD({ settings: s.settings, project: s.project, chat: s.chat, from: s.name }); setIdeal(null); window.scrollTo({ top: 0, behavior: "smooth" }); }}>טען</button>
              <button className="press icon-btn" aria-label={`מחיקת ${s.name}`} title="מחיקה" onClick={() => setLib(lib.filter((x) => x.id !== s.id))}><IconX /></button>
            </div>
          ))}
        </div>
      )}

      <h2 className="section-title">כללי אצבע</h2>
      <p className="section-lead">שישה כללים לפני ששולחים.</p>
      <div className="rules-grid">
        {RULES.map(([n, h, t]) => (
          <div key={n} className="card rule-card"><span className="n">{n}</span><h4>{h}</h4><Rich as="p">{t}</Rich></div>
        ))}
      </div>
    </main>
  );
}

