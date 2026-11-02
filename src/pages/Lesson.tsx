import { useEffect, useState } from "react";
import Rich, { Lines } from "../components/Rich";
import { IconCopy, IconNext, IconPlay, IconPrev, IconX } from "../components/Icons";
import Deck, { deckFor } from "../components/Deck";
import { ORDER, TRACK_HEX, byId, trackOf } from "../data/course";
import { assemble, stepPrompt } from "../lib/prompt";
import { go, href } from "../lib/route";
import { save, useStored, PROGRESS_KEY, type Progress } from "../lib/store";

// שיעורים שבהם תוקן מספר תקן שגוי מהגרסה המקורית
const FIXED: Record<number, string> = {
  1: "תוקן מהגרסה הקודמת: בידוד תרמי הוא ת\"י 1045, לא 1142.",
  6: "תוקן מהגרסה הקודמת: מעקות הם ת\"י 1142, לא 1139.",
  21: "תוקן מהגרסה הקודמת: הדוגמה ייחסה לת\"י 1142 מגבלת זיגוג. 1142 עוסק במעקות. זו בדיוק הטעות שהשיעור מלמד לתפוס.",
  30: "תוקן מהגרסה הקודמת: 1139 הוחלף ב-1045 (בידוד תרמי).",
};

export function copyText(text: string, toast: (s: string) => void) {
  const done = () => toast("הועתק ללוח");
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done, () => toast("ההעתקה נחסמה. סמנו את הטקסט והעתיקו ידנית."));
  else toast("ההעתקה נחסמה. סמנו את הטקסט והעתיקו ידנית.");
}

export default function Lesson({ id, editing, toast }: { id: string; editing: boolean; toast: (s: string) => void }) {
  const l = byId(id);
  const [progress, setProgress, savedP] = useStored<Progress>(PROGRESS_KEY, {});
  const [note, setNote, savedN] = useStored<string>(`note:${id}`, "");
  const [rec, setRec] = useStored<string>(`rec:${id}`, "");
  const [openPrompt, setOpenPrompt] = useState<number | null>(null);
  const [deck, setDeck] = useState(false);

  const idx = ORDER.findIndex((x) => String(x.id) === String(id));
  const prev = ORDER[idx - 1], next = ORDER[idx + 1];

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (deck || /INPUT|TEXTAREA/.test(t.tagName)) return;
      if (e.key === "ArrowLeft" && next) go("lesson", String(next.id));
      if (e.key === "ArrowRight" && prev) go("lesson", String(prev.id));
      if (e.key === "Escape") go("lessons");
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [id, deck]); // eslint-disable-line

  if (!l) {
    return (
      <main className="page read">
        <div className="empty card"><b>אין שיעור במספר הזה.</b>חזרו לרשימת השיעורים ובחרו שיעור. <a href={href("lessons")}>לשיעורים</a></div>
      </main>
    );
  }
  const track = trackOf(l.track);
  const steps = progress[l.id] || [];
  const done = steps.filter(Boolean).length;
  const toggle = (k: number) => setProgress((p) => {
    const cur = [...(p[l.id] || [false, false, false])];
    cur[k] = !cur[k];
    return { ...p, [l.id]: cur };
  });
  const openStudio = (k: number) => {
    save("studio:draft", { ...stepPrompt(l, l.steps[k]), from: `${l.code} · ${l.steps[k].title}` });
    go("studio");
  };
  const c = TRACK_HEX[l.track];

  return (
    <main className="page" style={{ ["--c" as any]: c }}>
      <div className="ops" aria-label="תפעול">
        <a className="press icon-btn" href={prev ? href("lesson", String(prev.id)) : undefined} aria-disabled={!prev} title="השיעור הקודם (חץ ימינה)" aria-label="השיעור הקודם" style={!prev ? { opacity: .35, pointerEvents: "none" } : undefined}><IconPrev /></a>
        <span className="pos"><bdi className="num">{idx + 1} / {ORDER.length}</bdi></span>
        <a className="press icon-btn" href={next ? href("lesson", String(next.id)) : undefined} title="השיעור הבא (חץ שמאלה)" aria-label="השיעור הבא" style={!next ? { opacity: .35, pointerEvents: "none" } : undefined}><IconNext /></a>
        <a className="press icon-btn" href={href("lessons")} title="חזרה לשיעורים (Esc)" aria-label="סגירה וחזרה לשיעורים"><IconX /></a>
      </div>

      <div className="lesson-layout">
        <article>
          <div className="crumbs"><a href={href("home")}>הבית</a><span>/</span><a href={href("lessons", undefined, { t: l.track })}>{track.name}</a><span>/</span><span>שיעור {l.code}</span></div>
          <div className="kicker" style={{ color: c }}>שיעור {l.code} · {l.kicker}</div>
          <h1 className="page-title">{l.title}</h1>
          <p className="page-insight"><Rich>{`==${l.insight}==`}</Rich></p>
          <p className="page-sub lines" style={{ marginTop: 10 }}>
            <Rich>{l.lead}</Rich>
            <Rich>{l.summary}</Rich>
          </p>
          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <button className="press btn btn-main" onClick={() => setDeck(true)}><IconPlay width={16} height={16} />צפה במצגת השיעור</button>
            <span className="mode-note"><bdi className="num">{deckFor(l).length}</bdi> שקפים{l.deck ? " · המצגת המקורית של הקורס" : " · נבנתה מתוכן השיעור"}. חיצים לניווט, Esc לסגירה.</span>
          </div>

          <h2 className="section-title">שלושה שלבים, שלושה תוצרים</h2>
          <p className="section-lead">לחיצה על המספר מסמנת שלב כבוצע. לכל שלב פרומפט פתיחה בשלוש שכבות, מוכן להעתקה.</p>
          <div className="steps">
            <div className="steps-line"><i style={{ height: `${(done / l.steps.length) * 100}%` }} /></div>
            {l.steps.map((s, k) => {
              const on = !!steps[k];
              const p = stepPrompt(l, s);
              return (
                <div key={k} className={`step rise${on ? " done" : ""}`} style={{ ["--i" as any]: k }}>
                  <button className="step-node press" aria-pressed={on} onClick={() => toggle(k)} aria-label={`${on ? "בטל סימון" : "סמן כבוצע"}: ${s.title}`} title={on ? "בוצע. לחיצה מבטלת" : "סמן כבוצע"}>
                    {on ? "✓" : s.num}
                  </button>
                  <div className="card step-body">
                    <h3>{s.title}</h3>
                    <Lines text={s.desc} />
                    <div className="deliver"><span className="label">התוצר</span><Rich>{s.deliverable}</Rich></div>
                    <div className="step-acts">
                      <button className="press btn-quiet" aria-expanded={openPrompt === k} onClick={() => setOpenPrompt(openPrompt === k ? null : k)}>
                        {openPrompt === k ? "הסתר פרומפט" : "פרומפט פתיחה"}
                      </button>
                      <button className="press btn-quiet" onClick={() => copyText(assemble(p), toast)}><IconCopy width={14} height={14} />העתק</button>
                      <button className="press btn-quiet" onClick={() => openStudio(k)}>פתח בסטודיו ומדוד</button>
                    </div>
                    {openPrompt === k && (
                      <div className="prompt-box" aria-label="פרומפט פתיחה">
                        <span className="lyr"><b>[הגדרות]</b>{"\n" + p.settings}</span>{"\n\n"}
                        <span className="lyr"><b>[פרויקט]</b>{"\n" + p.project}</span>{"\n\n"}
                        <span className="lyr"><b>[צ'אט]</b>{"\n" + p.chat}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {savedP && <p className="saved" style={{ marginTop: 8 }}>נשמר</p>}

          <h2 className="section-title">דוגמה לפתרון</h2>
          <div className="tone tone-solution">
            <span className="label">כך זה נראה כשזה עובד</span>
            <Lines text={l.example} />
            <p className="example-note">דוגמת תרגול. המספרים בה להמחשה, לא ממצא מחקרי.</p>
            {FIXED[l.id] && <p className="fixnote">{FIXED[l.id]}</p>}
          </div>

          <h2 className="section-title">שאלות ותשובות</h2>
          <div className="faq">
            {l.faq.map((f, i) => (
              <details key={i}>
                <summary>{f.question}</summary>
                <div className="a"><Lines text={f.answer} /></div>
              </details>
            ))}
          </div>

          <h2 className="section-title">רפלקציה</h2>
          <p className="section-lead">מה עבד, מה הפתיע, מה תשנו בפעם הבאה. נשמר אוטומטית במכשיר.</p>
          <textarea className="field" aria-label="רפלקציה על השיעור" rows={5} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="למשל: הפרומפט עם הקשר הפרויקט נתן תשובה שמפנה לתקן הנכון. בפעם הבאה אוסיף דוגמה." />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, gap: 8, flexWrap: "wrap" }}>
            <span className="saved">{savedN ? "נשמר" : ""}</span>
            <a className="press btn-quiet" href={href("portfolio", undefined, { l: String(l.id) })}>העלה תוצר לתיק העבודות</a>
          </div>
        </article>

        <aside className="titleblock" aria-label="חותמת הגיליון">
          <div className="tb-big">
            <div><span className="label">גיליון</span><div style={{ fontWeight: 700, fontSize: 15 }}>{track.name}</div></div>
            <bdi className="num">{l.code}</bdi>
          </div>
          <div className="tb-row"><span className="label">קומה</span><span>{track.q}</span></div>
          <div className="tb-row"><span className="label">משך</span><span><bdi className="num">{l.minutes}</bdi> דקות</span></div>
          <div className="tb-row"><span className="label">נושאים</span><span style={{ direction: "ltr", textAlign: "right" }}>{l.tags.join(" · ")}</span></div>
          <div className="tb-row"><span className="label">ביצוע</span>
            <span>
              <bdi className="num">{done}/{l.steps.length}</bdi>{" "}
              <span style={{ color: done === l.steps.length ? "var(--permit)" : done ? "var(--amber)" : "var(--ink-mute)", fontWeight: 600 }}>
                {done === l.steps.length ? "הושלם" : done ? "בתהליך" : "עוד לא התחיל"}
              </span>
            </span>
          </div>
          <div className="tb-row"><span className="label">הקלטה</span>
            <span>
              {rec ? <a href={rec} target="_blank" rel="noreferrer">צפה בהקלטת ההרצאה</a> : <span style={{ color: "var(--ink-mute)" }}>{editing ? "הוסיפו קישור למטה" : "טרם צורפה"}</span>}
            </span>
          </div>
          {editing && (
            <div className="tb-act">
              <label className="label" htmlFor="rec">קישור להקלטה (מצב עריכה)</label>
              <input id="rec" className="field" type="url" dir="ltr" placeholder="https://..." value={rec} onChange={(e) => setRec(e.target.value.trim())} />
            </div>
          )}
          <div className="tb-act">
            {next && <a className="press btn" href={href("lesson", String(next.id))}>השיעור הבא: {next.code}</a>}
          </div>
        </aside>
      </div>
      {deck && <Deck lesson={l} onClose={() => setDeck(false)} />}
    </main>
  );
}
