import { useEffect, useMemo, useState } from "react";
import { IconCopy } from "../components/Icons";
import { ORDER, TRACKS, TRACK_HEX, TOTAL_STEPS } from "../data/course";
import { fetchCohort, newCohort, type CohortRow } from "../lib/sync";
import { href, setParams, type Route } from "../lib/route";
import { copyText } from "./Lesson";

// מבט כיתה למרצה: מפת חום של משתתפים מול שיעורים. המספרים מחושבים מסימוני השלבים בלבד.
const CELL = ["#ECE9E1", "#F3DDA6", "#E2B04A", "#1E7A55"]; // 0, 1, 2, 3 שלבים
const done = (r: CohortRow, id: number) => (r.progress[String(id)] || []).filter(Boolean).length;
const total = (r: CohortRow) => ORDER.reduce((s, l) => s + Math.min(done(r, l.id), l.steps.length), 0);
const ago = (iso: string) => {
  const h = (Date.now() - new Date(iso).getTime()) / 36e5;
  return h < 1 ? "בשעה האחרונה" : h < 24 ? `לפני ${Math.round(h)} שעות` : `לפני ${Math.round(h / 24)} ימים`;
};

export default function Class({ route, toast }: { route: Route; toast: (s: string) => void }) {
  const code = (route.params.c || "").toLowerCase();
  const [typed, setTyped] = useState(code);
  const [rows, setRows] = useState<CohortRow[] | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    if (code.length < 8) { setRows(null); return; }
    setBusy(true); setErr("");
    try { setRows(await fetchCohort(code)); } catch (e: any) { setErr(e.message || "השרת לא זמין"); } finally { setBusy(false); }
  };
  useEffect(() => { load(); }, [code]); // eslint-disable-line

  const sorted = useMemo(() => [...(rows || [])].sort((a, b) => total(b) - total(a)), [rows]);
  const stats = useMemo(() => {
    if (!rows?.length) return null;
    const avg = Math.round((rows.reduce((s, r) => s + total(r), 0) / (rows.length * TOTAL_STEPS)) * 100);
    const per = ORDER.map((l) => ({
      l,
      full: rows.filter((r) => done(r, l.id) >= l.steps.length).length,
      partial: rows.filter((r) => { const d = done(r, l.id); return d > 0 && d < l.steps.length; }).length,
    }));
    const stuck = [...per].sort((a, b) => b.partial - a.partial)[0];
    const started = per.filter((x) => x.full + x.partial > 0);
    const best = [...per].sort((a, b) => b.full - a.full)[0];
    const quiet = rows.filter((r) => Date.now() - new Date(r.updated_at).getTime() > 7 * 864e5).length;
    return { avg, per, stuck, best, started: started.length, quiet };
  }, [rows]);
  const link = `${location.origin}${location.pathname}#/sync?c=${code}`;

  return (
    <main className="page">
      <div className="crumbs"><a href={href("home")}>הבית</a><span>/</span><span>מבט כיתה</span></div>
      <div className="kicker">למרצה</div>
      <h1 className="page-title">הכיתה במבט אחד.</h1>
      <p className="page-sub lines">
        <span>כל שורה היא משתתף, כל עמודה היא שיעור. הצבע אומר כמה שלבים בוצעו.</span>
        <span>מוצגים רק <strong>שם</strong>, <strong>סימוני שלבים</strong> ו<strong>מספר עבודות</strong>. רפלקציות, טיוטות ותמונות לא נחשפים.</span>
      </p>

      <div className="toolbar">
        <form className="chips" onSubmit={(e) => { e.preventDefault(); setParams(route, { c: typed.trim().toLowerCase() }); }} style={{ gap: 8 }}>
          <input className="field" dir="ltr" style={{ width: 240 }} aria-label="קוד כיתה" placeholder="kita-xxxxx-xxxxx" value={typed} onChange={(e) => setTyped(e.target.value)} />
          <button className="press btn" type="submit" disabled={typed.trim().length < 8}>הצג כיתה</button>
          <button className="press btn-quiet" type="button" onClick={() => { const c = newCohort(); setTyped(c); setParams(route, { c }); }}>צור קוד כיתה חדש</button>
        </form>
        {code.length >= 8 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="press btn-quiet" onClick={() => copyText(link, toast)}><IconCopy width={14} height={14} />העתק קישור הצטרפות</button>
            <button className="press btn-quiet" disabled={busy} onClick={load}>{busy ? "טוען..." : "רענן"}</button>
          </div>
        )}
      </div>

      {code.length < 8 && (
        <div className="tones" style={{ marginTop: 20 }}>
          <div className="tone tone-neutral"><span className="label">1</span><h4>צרו קוד כיתה.</h4><p>קוד אחד לכל מחזור. מי שמחזיק בקוד רואה את רשימת המשתתפים.</p></div>
          <div className="tone tone-neutral"><span className="label">2</span><h4>שלחו קישור הצטרפות.</h4><p>המשתתפים פותחים אותו, יוצרים קוד סנכרון, והכיתה מתמלאת.</p></div>
          <div className="tone tone-insight"><span className="label">3</span><h4>רואים איפה נתקעים.</h4><p>השיעור עם הכי הרבה שלבים פתוחים הוא הנושא לפגישה הבאה.</p></div>
        </div>
      )}
      {err && <div className="tone tone-problem" style={{ marginTop: 20 }}><span className="label">שגיאה</span><p>{err}. נסו לרענן בעוד רגע.</p></div>}
      {rows && rows.length === 0 && !err && (
        <div className="empty card" style={{ marginTop: 20 }}>
          <b>עוד אין משתתפים בכיתה {code}.</b>
          שלחו את קישור ההצטרפות. משתתף מופיע כאן אחרי הסנכרון הראשון שלו.
        </div>
      )}

      {stats && (
        <>
          <div className="class-kpis">
            <div className="card"><span className="label">משתתפים</span><bdi className="num big">{rows!.length}</bdi></div>
            <div className="card"><span className="label">התקדמות ממוצעת</span><bdi className="num big">{stats.avg}%</bdi></div>
            <div className="card"><span className="label">שיעורים שנפתחו</span><bdi className="num big">{stats.started}/{ORDER.length}</bdi></div>
            <div className="card"><span className="label">לא עדכנו שבוע</span><bdi className="num big" style={{ color: stats.quiet ? "var(--amber)" : undefined }}>{stats.quiet}</bdi></div>
          </div>
          <div className="tones" style={{ marginTop: 16 }}>
            <div className="tone tone-problem">
              <span className="label">איפה נתקעים</span>
              {stats.stuck.partial ? <><h4>שיעור {stats.stuck.l.code}: {stats.stuck.l.title}</h4><p><bdi className="num">{stats.stuck.partial}</bdi> משתתפים התחילו ולא סיימו.</p></> : <h4>אין שיעור פתוח באמצע.</h4>}
            </div>
            <div className="tone tone-solution">
              <span className="label">מה עובד</span>
              {stats.best.full ? <><h4>שיעור {stats.best.l.code}: {stats.best.l.title}</h4><p><bdi className="num">{stats.best.full}</bdi> משתתפים השלימו את שלושת השלבים.</p></> : <h4>עוד אין שיעור שהושלם.</h4>}
            </div>
            <div className="tone tone-insight">
              <span className="label">לפגישה הבאה</span>
              <h4>{stats.stuck.partial ? `פותחים בשלב הפתוח של שיעור ${stats.stuck.l.code}.` : "ממשיכים לשיעור הבא בסדר הקורס."}</h4>
              <p>חישוב מסימוני השלבים בלבד. איכות התוצרים נבדקת בתיק העבודות.</p>
            </div>
          </div>

          <h2 className="section-title">מפת חום: משתתפים מול שיעורים</h2>
          <div className="legend-key" aria-label="מקרא">
            {["לא התחיל", "שלב 1", "2 שלבים", "הושלם"].map((t, i) => <span key={t}><i style={{ background: CELL[i] }} />{t}</span>)}
            <span>· צבע הכותרת: הקומה</span>
          </div>
          <div className="heat-wrap">
            <table className="heat">
              <thead>
                <tr>
                  <th className="h-name">משתתף</th>
                  {ORDER.map((l) => (
                    <th key={l.id} title={`${l.code} · ${l.title}`} style={{ borderTop: `4px solid ${TRACK_HEX[l.track]}` }}>
                      <a href={href("lesson", String(l.id))}>{l.code}</a>
                    </th>
                  ))}
                  <th>סה"כ</th><th>עבודות</th><th>עדכון</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((r, i) => (
                  <tr key={i}>
                    <td className="h-name">{r.name || "בלי שם"}</td>
                    {ORDER.map((l) => {
                      const d = Math.min(done(r, l.id), 3);
                      return <td key={l.id} title={`${r.name || ""} · ${l.code}: ${d}/3`}><i style={{ background: CELL[d] }} /></td>;
                    })}
                    <td><bdi className="num">{Math.round((total(r) / TOTAL_STEPS) * 100)}%</bdi></td>
                    <td><bdi className="num">{r.works}</bdi></td>
                    <td className="h-ago">{ago(r.updated_at)}</td>
                  </tr>
                ))}
                <tr className="h-sum">
                  <td className="h-name">השלימו</td>
                  {stats.per.map((x) => <td key={x.l.id}><bdi className="num">{x.full}</bdi></td>)}
                  <td colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mode-note" style={{ marginTop: 8 }}>
            העמודות לפי סדר הקורס, וצבע הכותרת הוא הקומה: {TRACKS.map((t) => t.name).join(" · ")}. לחיצה על מספר שיעור פותחת אותו.
          </p>
        </>
      )}
    </main>
  );
}
