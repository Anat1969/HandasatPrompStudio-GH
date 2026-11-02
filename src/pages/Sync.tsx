import { useEffect, useState } from "react";
import { IconCopy } from "../components/Icons";
import { code, cohort, connect, disconnect, learnerName, newCode, onStatus, pull, push, schedule, type SyncStatus } from "../lib/sync";
import { href, type Route } from "../lib/route";
import { save } from "../lib/store";
import { copyText } from "./Lesson";

const WORD: Record<string, [string, string]> = {
  off: ["לא מסונכרן", "var(--ink-mute)"],
  idle: ["מחובר", "var(--cyan-2)"],
  busy: ["מסנכרן...", "var(--amber)"],
  ok: ["מסונכרן", "var(--permit)"],
  error: ["שגיאת סנכרון", "var(--redline)"],
};

export default function Sync({ route, toast }: { route: Route; toast: (s: string) => void }) {
  const [st, setSt] = useState<SyncStatus>({ state: "off" });
  const [c, setC] = useState(code());
  const [name, setName] = useState(learnerName());
  const [typed, setTyped] = useState(route.params.k || "");
  const [kita, setKita] = useState(route.params.c || cohort());
  useEffect(() => { if (route.params.c && !cohort()) { save("sync:cohort", route.params.c.toLowerCase()); schedule(); } }, [route.params.c]);
  const [busy, setBusy] = useState(false);
  useEffect(() => onStatus(setSt), []);

  const link = `${location.origin}${location.pathname}#/sync?k=${c}`;
  const run = async (fn: () => Promise<unknown>) => { setBusy(true); try { await fn(); } finally { setBusy(false); setC(code()); } };
  const [w, col] = WORD[c ? st.state : "off"];

  return (
    <main className="page read">
      <div className="crumbs"><a href={href("home")}>הבית</a><span>/</span><span>סנכרון</span></div>
      <div className="kicker">סנכרון וגיבוי</div>
      <h1 className="page-title">קוד אחד, כל המכשירים שלך.</h1>
      <p className="page-sub lines">
        <span>ההתקדמות, הרפלקציות, ספריית הפרומפטים ותיק העבודות נשמרים בשרת, תחת <strong>קוד סנכרון</strong> פרטי.</span>
        <span>בלי חשבון ובלי סיסמה. מי שמחזיק בקוד רואה את הנתונים, לכן שומרים אותו כמו מפתח.</span>
      </p>

      <div className="card" style={{ marginTop: 24, display: "grid", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <span className="label">מצב</span>
          <strong style={{ color: col, fontSize: 18 }}>{w}</strong>
        </div>
        {c && st.state === "ok" && st.at && <p className="mode-note">עדכון אחרון: {new Date(st.at).toLocaleTimeString("he-IL")}</p>}
        {c && st.state === "error" && <p style={{ color: "var(--redline)", fontSize: 14 }}>{st.msg}. הנתונים שמורים במכשיר, והסנכרון ינסה שוב בשינוי הבא.</p>}

        {c ? (
          <>
            <span className="label">קוד הסנכרון שלך</span>
            <div style={{ fontFamily: "var(--mono)", fontSize: "clamp(22px, 4vw, 32px)", fontWeight: 600, direction: "ltr", textAlign: "center", padding: "14px", background: "var(--cyan-wash)", letterSpacing: ".04em" }}>{c}</div>
            <div className="step-acts">
              <button className="press btn" onClick={() => copyText(c, toast)}><IconCopy width={16} height={16} />העתק קוד</button>
              <button className="press btn" onClick={() => copyText(link, toast)}>העתק קישור למכשיר אחר</button>
              <button className="press btn btn-main" disabled={busy} onClick={() => run(async () => { await pull(); await push(); toast("סונכרן"); })}>סנכרן עכשיו</button>
            </div>
            <label className="label" htmlFor="nm">שם (מופיע בתיק העבודות)</label>
            <input id="nm" className="field" value={name} maxLength={40} onChange={(e) => { setName(e.target.value); save("sync:name", e.target.value); }} />
            <label className="label" htmlFor="kita">קוד כיתה (לא חובה): המרצה רואה את ההתקדמות שלך</label>
            <input id="kita" className="field" dir="ltr" placeholder="kita-xxxxx-xxxxx" value={kita}
              onChange={(e) => setKita(e.target.value)}
              onBlur={() => { save("sync:cohort", kita.trim().toLowerCase()); schedule(); }} />
            <p className="mode-note">המרצה רואה רק שם, סימוני שלבים ומספר עבודות. רפלקציות, טיוטות ותמונות לא נחשפים.</p>
            <button className="press btn-quiet" style={{ justifySelf: "start" }} onClick={() => { disconnect(); setC(""); toast("המכשיר נותק. הנתונים נשארו בשרת ובמכשיר."); }}>נתק את המכשיר הזה</button>
          </>
        ) : (
          <div className="tones" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            <div className="tone tone-solution">
              <span className="label">מכשיר ראשון</span>
              <h4>צרו קוד חדש.</h4>
              <input className="field" placeholder="השם שלך" aria-label="השם שלך" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} />
              <button className="press btn btn-main" style={{ marginTop: 10 }} disabled={busy} onClick={() => run(() => connect(newCode(), name))}>צור קוד וסנכרן</button>
            </div>
            <div className="tone tone-neutral">
              <span className="label">כבר יש לי קוד</span>
              <h4>חברו את המכשיר הזה.</h4>
              <input className="field" dir="ltr" placeholder="xxxxx-xxxxx-xxxxx" aria-label="קוד סנכרון קיים" value={typed} onChange={(e) => setTyped(e.target.value)} />
              <button className="press btn" style={{ marginTop: 10 }} disabled={busy || typed.trim().length < 16} onClick={() => run(async () => { await connect(typed, name); toast("המכשיר חובר, והנתונים מוזגו"); })}>חבר ומזג</button>
            </div>
          </div>
        )}
      </div>

      <h2 className="section-title">מה נשמר, ואיך</h2>
      <div className="tones" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <div className="tone tone-neutral"><span className="label">מה</span><p className="lines"><span>סימוני ביצוע, רפלקציות, טיוטות וספריית הסטודיו, קישורי הקלטות ותיק העבודות.</span></p></div>
        <div className="tone tone-neutral"><span className="label">איפה</span><p className="lines"><span>Supabase, פרויקט <strong>cultura-GH</strong>, טבלה פרטית.</span><span>השרת שומר רק טביעת <strong>sha256</strong> של הקוד, לא את הקוד עצמו.</span></p></div>
        <div className="tone tone-insight"><span className="label">מיזוג</span><p className="lines"><span><mark className="insight">שום דבר לא נמחק בסנכרון.</mark></span><span>שלבים שבוצעו, ספריית הפרומפטים, המשתתפים ותיק העבודות מתאחדים. בטקסט, כמו רפלקציה, הגרסה החדשה יותר מנצחת.</span></p></div>
      </div>
    </main>
  );
}
