import Chips from "../components/Chips";
import Rich from "../components/Rich";
import { Hl, searchAll } from "../components/TopBar";
import { LESSONS, ORDER, TRACKS, TRACK_HEX, byId, type Lesson } from "../data/course";
import { href, setParams, type Route } from "../lib/route";
import { useStored, PROGRESS_KEY, type Progress, doneCount } from "../lib/store";

function Card({ l, progress, q, faded, i }: { l: Lesson; progress: Progress; q: string; faded: boolean; i: number }) {
  const done = doneCount(progress, l.id);
  return (
    <a className={`press l-card rise${faded ? " faded" : ""}`} href={href("lesson", String(l.id))} style={{ ["--c" as any]: TRACK_HEX[l.track], ["--i" as any]: Math.min(i, 12) }}>
      <span className="code num">{l.code}</span>
      <span className="kick">{l.kicker}</span>
      <h3><Hl text={l.title} q={q} /></h3>
      <span className="ins"><Rich>{`==${l.insight}==`}</Rich></span>
      <span className="meta">
        <span><bdi className="num">{l.minutes}</bdi> דק׳ · {l.tags.join(" · ")}</span>
        <span className="steps-pips" aria-label={`${done} מתוך ${l.steps.length} שלבים`}>
          {l.steps.map((_, k) => <i key={k} className={(progress[l.id] || [])[k] ? "on" : ""} />)}
        </span>
      </span>
    </a>
  );
}

export default function Lessons({ route, q, setQ }: { route: Route; q: string; setQ: (s: string) => void }) {
  const [progress] = useStored<Progress>(PROGRESS_KEY, {});
  const sel = (route.params.t || "").split(",").filter(Boolean);
  const ordered = route.params.v === "order";
  const query = route.params.q ?? q;
  const hitIds = new Set(searchAll(query).map((h) => h.lesson));
  const searching = query.trim().length > 0;
  const visibleTracks = TRACKS.filter((t) => !sel.length || sel.includes(t.id));
  const inSel = (l: Lesson) => !sel.length || sel.includes(l.track);
  const shownCount = LESSONS.filter((l) => inSel(l) && (!searching || hitIds.has(l.id))).length;

  return (
    <main className="page">
      <div className="crumbs"><a href={href("home")}>הבית</a><span>/</span><span>שיעורים</span></div>
      <div className="kicker">תכנית הלימודים</div>
      <h1 className="page-title">24 שיעורים בחמש קומות.</h1>
      <p className="page-sub lines">
        <span>כל שיעור: <strong>תובנה</strong> אחת, <strong>3</strong> שלבי תרגול, <strong>תוצר</strong> מוגדר ופרומפט פתיחה מוכן.</span>
        <span>פסי ההתקדמות בכל כרטיס מתמלאים כשמסמנים שלב כבוצע.</span>
      </p>

      <div className="toolbar">
        <Chips label="בחירת קומה" value={sel}
          options={TRACKS.map((t) => ({ id: t.id, label: t.name, color: TRACK_HEX[t.id], count: t.lessons.length }))}
          onChange={(v) => setParams(route, { t: v.join(",") })} />
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <button className="press btn-quiet" aria-pressed={ordered} onClick={() => setParams(route, { v: ordered ? "" : "order" })}>סדר הקורס</button>
          <span className="mode-note">{ordered ? "מוצג לפי מספר השיעור, מ-01 עד 30." : "מוצג לפי קומות. \"סדר הקורס\" מציג לפי מספר השיעור."}</span>
        </div>
      </div>
      {searching && (
        <p className="mode-note" style={{ margin: "6px 0 0" }}>
          חיפוש "<strong>{query}</strong>": <bdi className="num">{shownCount}</bdi> שיעורים מודגשים, השאר מעומעמים.{" "}
          <button className="press btn-quiet" onClick={() => { setQ(""); setParams(route, { q: "" }); }}>ניקוי חיפוש</button>
        </p>
      )}

      {searching && shownCount === 0 && (
        <div className="empty card" style={{ marginTop: 24 }}>
          <b>לא נמצא שיעור שמתאים ל"{query}".</b>
          נסו מילה אחרת, או נקו את החיפוש כדי לראות את כל השיעורים.
        </div>
      )}

      {ordered ? (
        <div className="lesson-grid" style={{ marginTop: 24 }}>
          {ORDER.filter(inSel).map((l, i) => <Card key={l.id} l={l} i={i} progress={progress} q={query} faded={searching && !hitIds.has(l.id)} />)}
        </div>
      ) : (
        visibleTracks.map((t) => {
          const idx = TRACKS.indexOf(t);
          const done = t.lessons.filter((id) => doneCount(progress, id) >= byId(id)!.steps.length).length;
          return (
            <section key={t.id} className="track-block" style={{ ["--c" as any]: TRACK_HEX[t.id] }}>
              <div className="track-head">
                <span className="fl">קומה {idx + 1}</span>
                <h2>{t.name}<small>{t.q}</small></h2>
                <span className="cnt"><bdi className="num">{done}</bdi> מתוך <bdi className="num">{t.lessons.length}</bdi> הושלמו</span>
              </div>
              <Rich as="p" className="section-lead">{t.lead}</Rich>
              <div className="lesson-grid">
                {t.lessons.map((id, i) => {
                  const l = byId(id)!;
                  return <Card key={id} l={l} i={i} progress={progress} q={query} faded={searching && !hitIds.has(id)} />;
                })}
              </div>
            </section>
          );
        })
      )}
    </main>
  );
}
