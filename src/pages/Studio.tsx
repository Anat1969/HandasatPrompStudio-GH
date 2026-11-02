import { useMemo } from "react";
import Rich from "../components/Rich";
import { IconCopy, IconX } from "../components/Icons";
import { assemble, DEFAULT_SETTINGS } from "../lib/prompt";
import { measure, verdict } from "../lib/meter";
import { href } from "../lib/route";
import { useStored } from "../lib/store";
import { copyText } from "./Lesson";

type Draft = { settings: string; project: string; chat: string; from?: string };
type Saved = Draft & { id: string; name: string; at: number; score: number };

const PRESETS: { name: string; d: Draft }[] = [
  { name: "רמת צ'אט בלבד", d: { settings: "", project: "", chat: "עזור לי לתכנן כיתה לבית ספר" } },
  { name: "שלוש שכבות: כיתה", d: {
    settings: DEFAULT_SETTINGS,
    project: "אתה יועץ תכנון למבני חינוך.\nפרויקט: בית ספר יסודי באשדוד, גילאי 6 עד 12, אקלים ים־תיכוני לח.\nמסמכי רקע: הנחיות משרד החינוך לתכנון בתי ספר, ת\"י 1045 (בידוד תרמי).",
    chat: "הצע תכנון לכיתת אם אחת: שטח, תאורה טבעית, אקוסטיקה וריהוט.\nפורמט: טבלה של 4 עמודות (נושא, המלצה, נימוק, מקור), עד 8 שורות.\nלדוגמה: \"תאורה | חלונות בצפון | אור רך בלי סנוור | ...\".\nלפני שאתה עונה, שאל אותי עד 2 שאלות הבהרה.",
  } },
  { name: "אימות פלט: חזית", d: {
    settings: DEFAULT_SETTINGS,
    project: "אתה בוחן איכות לתכנון חזיתות.\nפרויקט: בניין מגורים בתל אביב, 8 קומות, חזית דרומית ומערבית.",
    chat: "בדוק את הצעת החזית המצורפת מול ת\"י 1045 ות\"י 5282.\nפורמט: טבלת אימות: פרמטר, ערך מוצע, דרישה, עובר או נכשל, מקור.\nסמן מה צריך אימות מול נוסח התקן העדכני, ואל תמציא מספרי סעיפים.",
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

export default function Studio({ toast }: { toast: (s: string) => void }) {
  const [d, setD, saved] = useStored<Draft>("studio:draft", PRESETS[1].d);
  const [lib, setLib] = useStored<Saved[]>("studio:lib", []);
  const { checks, total } = useMemo(() => measure(d), [d]);
  const v = verdict(total);
  const full = assemble(d);
  const R = 50, C = 2 * Math.PI * R;
  const toneVar = `var(--${v.tone})`;

  const set = (k: keyof Draft) => (e: React.ChangeEvent<HTMLTextAreaElement>) => setD({ ...d, [k]: e.target.value });
  const store = () => {
    const name = d.from || (d.chat.trim().split(/\s+/).slice(0, 6).join(" ") || "פרומפט בלי שם");
    setLib([{ ...d, id: String(Date.now()), name, at: Date.now(), score: total }, ...lib].slice(0, 50));
    toast(`נשמר בספרייה: ${name}`);
  };

  return (
    <main className="page">
      <div className="crumbs"><a href={href("home")}>הבית</a><span>/</span><span>סטודיו פרומפטים</span></div>
      <div className="kicker">סטודיו</div>
      <h1 className="page-title">פרומפט נבנה בשכבות, ונמדד.</h1>
      <p className="page-sub lines">
        <span>כותבים כל שכבה בנפרד, ורואים את הפרומפט המלא ואת הציון מתעדכנים תוך כדי הקלדה.</span>
        <span>המדד בודק <strong>8</strong> רכיבים, ומסביר לכל אחד מה נמדד, איך ומה המגבלה.</span>
      </p>
      <div className="toolbar">
        <div className="chips" role="group" aria-label="דוגמאות מוכנות">
          <span className="chip-hint" style={{ marginInlineStart: 0 }}>טען דוגמה:</span>
          {PRESETS.map((p) => <button key={p.name} className="chip-t" onClick={() => setD(p.d)}>{p.name}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {d.from && <span className="mode-note">נטען מ: <strong>{d.from}</strong></span>}
          <span className="saved">{saved ? "נשמר" : ""}</span>
          <button className="press btn-quiet" onClick={() => setD({ settings: "", project: "", chat: "" })}>ניקוי</button>
        </div>
      </div>

      <div className="studio">
        <section aria-label="שלוש השכבות">
          <div className="layer" style={{ ["--c" as any]: "var(--t-base)" }}>
            <div className="layer-head"><b>הגדרות</b><small>המטבח: נכון תמיד</small></div>
            <span className="rule-line">שפה, טון, מבנה ועקרונות קבועים.</span>
            <textarea className="field" aria-label="שכבת ההגדרות" rows={4} value={d.settings} onChange={set("settings")} placeholder="ענה בעברית, בטון מקצועי. פתח בשורת תובנה..." />
          </div>
          <div className="layer" style={{ ["--c" as any]: "var(--t-research)" }}>
            <div className="layer-head"><b>פרויקט</b><small>התפריט: נכון לסוג העבודה</small></div>
            <span className="rule-line">תפקיד, מקום, סוג מבנה, תקנים ומסמכי רקע.</span>
            <textarea className="field" aria-label="שכבת הפרויקט" rows={4} value={d.project} onChange={set("project")} placeholder="אתה יועץ תכנון... פרויקט: ... תקנים: ..." />
          </div>
          <div className="layer" style={{ ["--c" as any]: "var(--t-urban)" }}>
            <div className="layer-head"><b>צ'אט</b><small>ההזמנה: נכון עכשיו</small></div>
            <span className="rule-line">פועל אחד, פורמט פלט, מגבלה ודוגמה.</span>
            <textarea className="field" aria-label="שכבת הצ'אט" rows={5} value={d.chat} onChange={set("chat")} placeholder="השווה... פורמט: טבלה של... לדוגמה: ..." />
          </div>

          <h2 className="section-title" style={{ marginTop: 28 }}>הפרומפט המלא</h2>
          <div className="prompt-box" aria-label="הפרומפט המורכב">{full || "כתבו בשכבות למעלה, והפרומפט המלא יופיע כאן."}</div>
          <div className="step-acts">
            <button className="press btn btn-main" disabled={!full} onClick={() => copyText(full, toast)}><IconCopy width={16} height={16} />העתק פרומפט</button>
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
                <p className="mode-note">ציון משוקלל מתוך <bdi className="num">100</bdi>. ירוק מ-<bdi className="num">80</bdi>, כתום מ-<bdi className="num">50</bdi>.</p>
              </div>
            </div>
          </div>
          <div className="checks">
            {checks.map((c) => {
              const st = c.score === 1 ? "pass" : c.score > 0 ? "part" : "fail";
              return (
                <div key={c.key} className={`check ${st}`}>
                  <span className="mk" aria-hidden="true">{st === "pass" ? "✓" : st === "part" ? "½" : "✗"}</span>
                  <div>
                    <b>{c.name}</b>
                    <small>{c.found ? <>נמצא: "<span>{c.found.slice(0, 40)}</span>"</> : c.what}</small>
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
            <div className="check na">
              <span className="mk" aria-hidden="true">–</span>
              <div><b>נכונות התוכן</b><small>לא נמדד. מספרי תקנים, מידות ועובדות בודק איש המקצוע.</small></div>
              <span className="pts">אדם</span>
            </div>
          </div>
          <p className="src">
            על מה המדד נשען: מודל שלוש השכבות (שיעור 01), ומדריך הנדסת הפרומפטים של Anthropic: בהירות, הקשר ותפקיד, דוגמאות, פורמט, וחשיבה בשלבים.{" "}
            <a href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" target="_blank" rel="noreferrer">המקור</a>.
            אמינות: מנוע דטרמיניסטי. אותו טקסט מקבל תמיד אותו ציון, והוא בודק נוכחות של רכיבים, לא איכות תשובה.
          </p>
        </aside>
      </div>

      <h2 className="section-title">הספרייה שלי</h2>
      <p className="section-lead">פרומפטים ששמרתם, עם הציון שקיבלו. נשמר במכשיר.</p>
      {lib.length === 0 ? (
        <div className="empty card"><b>הספרייה ריקה.</b>כתבו פרומפט ולחצו "שמור בספרייה", או פתחו פרומפט פתיחה מתוך שיעור.</div>
      ) : (
        <div className="library">
          {lib.map((s) => (
            <div key={s.id} className="card lib-row">
              <div><b>{s.name}</b><small>ציון <bdi className="num">{s.score}</bdi> · {new Date(s.at).toLocaleDateString("he-IL")}</small></div>
              <button className="press btn-quiet" onClick={() => { setD({ settings: s.settings, project: s.project, chat: s.chat, from: s.name }); window.scrollTo({ top: 0, behavior: "smooth" }); }}>טען</button>
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
