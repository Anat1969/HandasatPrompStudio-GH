import { useEffect, useRef, useState } from "react";
import Chips from "../components/Chips";
import { IconX } from "../components/Icons";
import { ORDER, TRACK_HEX, byId } from "../data/course";
import { allWorks, compress, delWork, putWork, type Work } from "../lib/idb";
import { href, setParams, type Route } from "../lib/route";
import { useStored } from "../lib/store";

export default function Portfolio({ route, editing, toast }: { route: Route; editing: boolean; toast: (s: string) => void }) {
  const [students, setStudents] = useStored<string[]>("students", []);
  const [me, setMe] = useStored<string>("student:current", "");
  const [works, setWorks] = useState<Work[]>([]);
  const [name, setName] = useState("");
  const [lesson, setLesson] = useState<number>(Number(route.params.l) || 1);
  const [desc, setDesc] = useState("");
  const [img, setImg] = useState("");
  const [over, setOver] = useState(false);
  const [zoom, setZoom] = useState<Work | null>(null);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  const filter = (route.params.s || "").split(",").filter(Boolean);

  const refresh = () => allWorks().then((w) => setWorks(w.sort((a, b) => b.at - a.at))).catch(() => setErr("הדפדפן חוסם אחסון מקומי. פתחו את האתר בחלון רגיל (לא פרטי)."));
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (route.params.l) setLesson(Number(route.params.l)); }, [route.params.l]);

  const take = async (f?: File | null) => {
    if (!f) return;
    setErr("");
    try { setImg(await compress(f)); } catch (e: any) { setErr(e.message || "לא הצלחתי לקרוא את הקובץ."); }
  };
  useEffect(() => {
    const on = (e: ClipboardEvent) => {
      const f = [...(e.clipboardData?.files || [])].find((x) => x.type.startsWith("image/"));
      if (f) take(f);
    };
    window.addEventListener("paste", on);
    return () => window.removeEventListener("paste", on);
  }, []);
  useEffect(() => {
    if (!zoom) return;
    const on = (e: KeyboardEvent) => { if (e.key === "Escape") setZoom(null); };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [zoom]);

  const addStudent = () => {
    const n = name.trim();
    if (!n) return;
    if (!students.includes(n)) setStudents([...students, n]);
    setMe(n);
    setName("");
  };
  const submit = async () => {
    if (!me || !img) return;
    try {
      await putWork({ id: String(Date.now()), student: me, lesson, desc: desc.trim(), img, at: Date.now() });
      setImg(""); setDesc("");
      toast("העבודה נשמרה בתיק");
      refresh();
    } catch {
      setErr("האחסון במכשיר מלא. מחקו עבודות ישנות במצב עריכה, ונסו שוב.");
    }
  };

  const shown = works.filter((w) => (!filter.length || filter.includes(w.student)) && (!route.params.l || String(w.lesson) === route.params.l));
  const counts = (s: string) => works.filter((w) => w.student === s).length;

  return (
    <main className="page">
      <div className="crumbs"><a href={href("home")}>הבית</a><span>/</span><span>תיק עבודות</span></div>
      <div className="kicker">תיק עבודות</div>
      <h1 className="page-title">כל תוצר, ליד השיעור שלו.</h1>
      <p className="page-sub lines">
        <span>מעלים צילום של התוצר, מתארים במשפט, ובוחרים שיעור.</span>
        <span>הכול נשמר <strong>במכשיר הזה</strong>, בלי חשבון ובלי שרת. לגיבוי: ייצוא מתוך כפתור הלוגו.</span>
      </p>

      <div className="port" style={{ marginTop: 24 }}>
        <section className="card uploader" aria-label="העלאת עבודה">
          <span className="label">1. מי מעלה</span>
          {students.length > 0 && (
            <div className="chips" role="group" aria-label="בחירת משתתף">
              {students.map((s) => (
                <span className="chip-g" key={s}>
                  <button className="chip-t" aria-pressed={me === s} onClick={() => setMe(s)}>{s}</button>
                  {editing && <button className="chip-add" aria-label={`הסרת ${s}`} onClick={() => { setStudents(students.filter((x) => x !== s)); if (me === s) setMe(""); }}>−</button>}
                </span>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: 8 }}>
            <input className="field" aria-label="שם משתתף חדש" placeholder="שם משתתף חדש" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addStudent()} />
            <button className="press btn" onClick={addStudent} disabled={!name.trim()}>הוסף</button>
          </div>

          <label className="label" htmlFor="lsel">2. לאיזה שיעור</label>
          <select id="lsel" className="field" value={lesson} onChange={(e) => setLesson(Number(e.target.value))}>
            {ORDER.map((l) => <option key={l.id} value={l.id}>{l.code} · {l.title}</option>)}
          </select>

          <span className="label">3. התוצר</span>
          <div className={`drop${over ? " over" : ""}`} role="button" tabIndex={0} aria-label="בחירת תמונה"
            onClick={() => file.current?.click()} onKeyDown={(e) => e.key === "Enter" && file.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); take(e.dataTransfer.files[0]); }}>
            {img ? <img src={img} alt="תצוגה מקדימה של העבודה" /> : <span>גררו לכאן תמונה, לחצו לבחירה,<br />או הדביקו (Ctrl+V)</span>}
          </div>
          <input ref={file} type="file" accept="image/*" hidden onChange={(e) => take(e.target.files?.[0])} />
          <textarea className="field" rows={3} aria-label="תיאור העבודה" placeholder="משפט אחד: מה עשיתם ומה למדתם." value={desc} onChange={(e) => setDesc(e.target.value)} />
          {err && <p style={{ color: "var(--redline)", fontSize: 13.5 }}>{err}</p>}
          <button className="press btn btn-main" onClick={submit} disabled={!me || !img}>שמור בתיק</button>
          {(!me || !img) && <p className="mode-note">{!me ? "בחרו או הוסיפו משתתף כדי לשמור." : "בחרו תמונה כדי לשמור."}</p>}
        </section>

        <section aria-label="הגלריה">
          <div className="toolbar" style={{ marginTop: 0 }}>
            <Chips label="סינון לפי משתתף" value={filter}
              options={students.map((s) => ({ id: s, label: s, count: counts(s) }))}
              onChange={(v) => setParams(route, { s: v.join(",") })} />
            {route.params.l && (
              <button className="press btn-quiet" onClick={() => setParams(route, { l: "" })}>
                שיעור {byId(route.params.l)?.code} בלבד <IconX width={12} height={12} />
              </button>
            )}
          </div>
          {shown.length === 0 ? (
            <div className="empty card"><b>{works.length ? "אין עבודות בסינון הזה." : "התיק עוד ריק."}</b>{works.length ? "נקו את הסינון כדי לראות את כל העבודות." : "העלו את התוצר הראשון מהטופס. הוא יופיע כאן מיד."}</div>
          ) : (
            <div className="gallery">
              {shown.map((w) => {
                const l = byId(w.lesson);
                return (
                  <figure key={w.id} className="card work" style={{ margin: 0, borderTop: `3px solid ${l ? TRACK_HEX[l.track] : "var(--rule)"}` }}>
                    <button className="img" onClick={() => setZoom(w)} aria-label={`הגדלת העבודה של ${w.student}`}><img src={w.img} alt={w.desc || `עבודה של ${w.student}`} loading="lazy" /></button>
                    <figcaption className="cap">
                      <span className="who"><b>{w.student}</b>{l && <a href={href("lesson", String(l.id))} className="src">שיעור {l.code}</a>}</span>
                      {w.desc && <span>{w.desc}</span>}
                      <span className="src">{new Date(w.at).toLocaleDateString("he-IL")}</span>
                      {editing && <button className="press btn-quiet" onClick={async () => { await delWork(w.id); refresh(); }}>מחיקה</button>}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {zoom && (
        <div className="overlay" role="dialog" aria-modal="true" aria-label="תמונה מוגדלת" onClick={(e) => { if (e.target === e.currentTarget) setZoom(null); }}>
          <div className="zoom">
            <div className="z-cap"><span><b>{zoom.student}</b> · שיעור {byId(zoom.lesson)?.code} · {zoom.desc}</span><button className="press icon-btn" onClick={() => setZoom(null)} aria-label="סגירה"><IconX /></button></div>
            <img src={zoom.img} alt={zoom.desc || zoom.student} />
          </div>
        </div>
      )}
    </main>
  );
}
