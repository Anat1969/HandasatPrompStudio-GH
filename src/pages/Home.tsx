import { useState } from "react";
import Building from "../components/Building";
import Rich from "../components/Rich";
import { LESSONS, TRACKS, TRACK_HEX, TOTAL_STEPS, TOTAL_MIN, byId } from "../data/course";
import { href } from "../lib/route";
import { useStored, PROGRESS_KEY, type Progress, doneCount } from "../lib/store";

export default function Home() {
  const [progress] = useStored<Progress>(PROGRESS_KEY, {});
  const [active, setActive] = useState<string | null>(null);
  const doneSteps = LESSONS.reduce((s, l) => s + doneCount(progress, l.id), 0);
  const doneLessons = LESSONS.filter((l) => doneCount(progress, l.id) >= l.steps.length).length;
  const pct = Math.round((doneSteps / TOTAL_STEPS) * 100);
  const next = [...LESSONS].sort((a, b) => a.id - b.id).find((l) => doneCount(progress, l.id) < l.steps.length);

  return (
    <main className="page">
      <section className="hero">
        <div className="rise">
          <div className="kicker">קורס AI לאדריכלים · BLUEPRINT.AI</div>
          <h1><bdi className="num">24</bdi> שיעורים, <bdi className="num">5</bdi> קומות, כלי אחד שלך.</h1>
          <p className="page-sub lines">
            <span>כל שיעור מתחיל ב<strong>בריף</strong> ומסתיים ב<strong>תוצר</strong>.</span>
            <span>כל קומה נשענת על הקודמת: מ<strong>שליטה בהקשר</strong> ועד <strong>DNA אדריכלי</strong> אישי.</span>
            <span>
              <bdi className="num">{TOTAL_STEPS}</bdi> שלבי תרגול, כ-<bdi className="num">{Math.round(TOTAL_MIN / 60)}</bdi> שעות הרצאה.
            </span>
          </p>
          <div className="hero-cta">
            <a className="press btn btn-main" href={href("lesson", String(next ? next.id : 1))}>
              {doneSteps ? `המשך: שיעור ${next ? next.code : "01"}` : "התחל בשיעור 01"}
            </a>
            <a className="press btn" href={href("studio")}>פתח את סטודיו הפרומפטים</a>
          </div>
          <div className="progress-line" aria-label="התקדמות בקורס">
            <div className="label">נבנה עד עכשיו: <bdi className="num">{pct}%</bdi> · <bdi className="num">{doneLessons}</bdi> מתוך <bdi className="num">24</bdi> חלונות דולקים</div>
            <div className="bar"><i style={{ width: `${pct}%` }} /></div>
          </div>
        </div>
        <div className="building-wrap">
          <Building progress={progress} active={active} onActive={setActive} />
          <div>
            <ul className="legend" aria-label="מקרא הקומות">
              {[...TRACKS].reverse().map((t) => {
                const n = t.lessons.filter((id) => doneCount(progress, id) >= byId(id)!.steps.length).length;
                return (
                  <li key={t.id}>
                    <a className={`press legend-row${active === t.id ? " on" : ""}`} href={href("lessons", undefined, { t: t.id })}
                      onPointerEnter={() => setActive(t.id)} onPointerLeave={() => setActive(null)}
                      onFocus={() => setActive(t.id)} onBlur={() => setActive(null)}>
                      <i className="sw" style={{ background: TRACK_HEX[t.id] }} />
                      <span><b>{t.name}</b><small>{t.q}</small></span>
                      <span className="num" style={{ fontSize: 13 }}>{n}/{t.lessons.length}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            <div className="legend-key" aria-label="מקרא החלונות">
              <span><i style={{ background: "#E2B04A" }} />הושלם</span>
              <span><i style={{ background: "#F3DDA6" }} />בתהליך</span>
              <span><i style={{ background: "#13253F" }} />עוד לא</span>
            </div>
          </div>
        </div>
      </section>

      <h2 className="section-title">למה הקורס הזה</h2>
      <p className="section-lead">בעיה, פתרון ותובנה, במבט אחד.</p>
      <div className="tones">
        <div className="tone tone-problem rise" style={{ ["--i" as any]: 1 }}>
          <span className="label">הבעיה</span>
          <h4>תשובה גנרית לשאלה מקצועית.</h4>
          <p className="lines"><span>רוב האנשים עובדים רק ב<strong>צ'אט</strong>.</span><span>הם מקלידים את ההקשר מחדש בכל שאלה, ומקבלים תשובה שלא מכירה את ה<strong>מגרש</strong>, ה<strong>תקן</strong> וה<strong>לקוח</strong>.</span></p>
        </div>
        <div className="tone tone-solution rise" style={{ ["--i" as any]: 2 }}>
          <span className="label">הפתרון</span>
          <h4>שלוש שכבות של הקשר.</h4>
          <p className="lines"><span><strong>הגדרות</strong>: מה שנכון תמיד.</span><span><strong>פרויקט</strong>: מה שנכון לסוג העבודה.</span><span><strong>צ'אט</strong>: מה שנכון עכשיו.</span></p>
        </div>
        <div className="tone tone-insight rise" style={{ ["--i" as any]: 3 }}>
          <span className="label">התובנה</span>
          <h4>הפרומפט הוא שרטוט, לא שאלה.</h4>
          <p className="lines"><span><Rich>{"==כמו תוכנית עבודה, הוא נבנה בשכבות, נבדק ונחתם.=="}</Rich></span><span>את זה בונים בסטודיו, ומודדים ב<strong>11</strong> רכיבים, לפי שכבה.</span></p>
        </div>
      </div>

      <h2 className="section-title">מפת הקורס: חמש קומות</h2>
      <p className="section-lead">כל קומה היא שאלה אחת. לחיצה פותחת את השיעורים שלה.</p>
      <div className="floors-map">
        {TRACKS.map((t, i) => {
          const n = t.lessons.filter((id) => doneCount(progress, id) >= byId(id)!.steps.length).length;
          return (
            <a key={t.id} className="press floor-card rise" style={{ ["--c" as any]: TRACK_HEX[t.id], ["--i" as any]: i }} href={href("lessons", undefined, { t: t.id })}
              onPointerEnter={() => setActive(t.id)} onPointerLeave={() => setActive(null)}>
              <span className="label">קומה <bdi className="num">{i + 1}</bdi></span>
              <h3>{t.name}</h3>
              <div>
                <div className="q">{t.q}</div>
                <Rich as="p">{t.lead}</Rich>
              </div>
              <div className="foot"><span>שיעורים {t.lessons.map((x) => String(x).padStart(2, "0")).join(" · ")}</span><bdi className="num">{n}/{t.lessons.length}</bdi></div>
            </a>
          );
        })}
      </div>

      <h2 className="section-title">שלושה כלים שמחוץ לשיעורים</h2>
      <div className="tones">
        <a className="press tone tone-neutral" href={href("studio")} style={{ textDecoration: "none", color: "inherit" }}>
          <span className="label">סטודיו פרומפטים</span>
          <h4>בונים פרומפט בשלוש שכבות ומודדים אותו.</h4>
          <p className="lines"><span>מדד של <strong>11</strong> רכיבים, מפורק להגדרות, פרויקט וצ'אט.</span><span>ו<strong>הגרסה המלאה</strong>: איך הפרומפט שלך נראה ב-<strong>100</strong>.</span></p>
        </a>
        <a className="press tone tone-neutral" href={href("portfolio")} style={{ textDecoration: "none", color: "inherit" }}>
          <span className="label">תיק עבודות</span>
          <h4>כל תוצר נשמר ליד השיעור שלו.</h4>
          <p className="lines"><span>תמונה, תיאור ושם, לכל משתתף.</span><span>עם <strong>קוד סנכרון</strong>: בכל המכשירים שלך, בלי חשבון.</span></p>
        </a>
        <a className="press tone tone-neutral" href={href("feature")} style={{ textDecoration: "none", color: "inherit" }}>
          <span className="label">כתבות</span>
          <h4>ארבעה הוגים, ארבעה שיעורים בפרומפט.</h4>
          <p className="lines"><span><strong>אלכסנדר</strong>, <strong>ג'ייקובס</strong>, <strong>לה קורבוזיה</strong> ו<strong>ויטרוביוס</strong>, מחוברים לשיעורים.</span><span>עם ציטוט מהמקור, הייקו ודוגמה מ<strong>אשדוד</strong> <span className="latin">Ashdod</span>.</span></p>
        </a>
      </div>

      <div className="inspire">
        <span>בהשראת <strong>שפת תבניות</strong> <span className="latin">A Pattern Language</span>, כריסטופר אלכסנדר, <bdi className="num">1977</bdi>: כל שיעור הוא תבנית שאפשר להפעיל שוב ושוב.</span>
        <a href={href("sync")} style={{ color: "inherit" }}>ההתקדמות נשמרת במכשיר, ובקוד סנכרון גם בשרת.</a>
      </div>
    </main>
  );
}
