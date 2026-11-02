import Rich from "../components/Rich";
import { IconPrint } from "../components/Icons";
import { TRACKS, TRACK_HEX, byId } from "../data/course";
import { href } from "../lib/route";

// כתבה מוזיאלית (סעיף 7 בשפת העיצוב): תמונה מובילה, אות פתיחה, ציטוט, תובנה, הייקו, חיבורים, פוסט ומקורות.
// בלי צילום ברישיון מתאים: איור SVG שנבנה בקוד ברוח ה-DNA (שרטוט על ציאנוטייפ).

function PatternNet() {
  // רשת התבניות של הקורס: שורה לכל קומה, צומת לכל שיעור, קווים בין שיעורים סמוכים ובין קומות.
  const W = 1100, Hh = 640, rows = TRACKS.length, TOP = 50, BOT = 400;
  const nodes = TRACKS.flatMap((t, r) => t.lessons.map((id, k) => {
    const n = t.lessons.length;
    const x = W - 120 - (k + 0.5) * ((W - 240) / n) - (r % 2) * 30;
    const y = BOT - r * ((BOT - TOP) / (rows - 1));
    return { id, t: t.id, x, y, r };
  }));
  const links: [number, number][] = [];
  TRACKS.forEach((t) => t.lessons.forEach((id, k) => { if (k) links.push([t.lessons[k - 1], id]); }));
  TRACKS.forEach((t, r) => { if (r) links.push([TRACKS[r - 1].lessons[0], t.lessons[0]]); links.push([TRACKS[Math.max(0, r - 1)].lessons.at(-1)!, t.lessons.at(-1)!]); });
  const pos = (id: number) => nodes.find((n) => n.id === id)!;
  return (
    <svg viewBox={`0 0 ${W} ${Hh}`} role="img" aria-label="רשת התבניות של הקורס: 24 שיעורים בחמש שורות, מחוברים זה לזה" style={{ direction: "ltr" }}>
      <defs>
        <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="rgba(255,255,255,.08)" /></pattern>
      </defs>
      <rect width={W} height={Hh} fill="#16365F" />
      <rect width={W} height={Hh} fill="url(#g)" />
      {links.filter(([a, b]) => a !== b).map(([a, b], i) => {
        const A = pos(a), B = pos(b);
        const len = Math.hypot(A.x - B.x, A.y - B.y);
        return <line key={i} className="draw" style={{ ["--len" as any]: len, ["--i" as any]: i % 12 }} x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke="rgba(233,238,245,.55)" strokeWidth="1.2" />;
      })}
      {nodes.map((n, i) => (
        <g key={n.id} className="rise" style={{ ["--i" as any]: i }}>
          <rect x={n.x - 17} y={n.y - 17} width="34" height="34" fill="#16365F" stroke={TRACK_HEX[n.t] === "#16365F" ? "#E9EEF5" : TRACK_HEX[n.t]} strokeWidth="2.5" />
          <text x={n.x} y={n.y + 5} textAnchor="middle" fill="#E9EEF5" style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 13, fontWeight: 600 }}>{String(n.id).padStart(2, "0")}</text>
        </g>
      ))}
    </svg>
  );
}

function Anatomy() {
  // תבנית של אלכסנדר מול פרומפט בשלוש שכבות
  const rows = [
    ["הקשר", "מה התבנית הגדולה שהיא חלק ממנה", "הגדרות + פרויקט"],
    ["בעיה", "מה חוזר ומכאיב בסביבה", "המשימה בצ'אט"],
    ["לב הפתרון", "ההוראה, בלי לקבע צורה", "פורמט התוצר והמגבלות"],
    ["קישורים", "תבניות קטנות שמשלימות", "הפרומפט הבא בשרשרת"],
  ];
  return (
    <svg viewBox="0 0 520 330" role="img" aria-label="השוואה: מבנה תבנית אצל אלכסנדר מול מבנה פרומפט" style={{ direction: "ltr" }}>
      <rect width="520" height="330" fill="#FFFFFF" />
      <text x="500" y="34" textAnchor="end" style={{ fontFamily: "IBM Plex Sans Hebrew", fontSize: 14, fontWeight: 700 }} fill="#15171C">תבנית (1977)</text>
      <text x="170" y="34" textAnchor="end" style={{ fontFamily: "IBM Plex Sans Hebrew", fontSize: 14, fontWeight: 700 }} fill="#2C5A93">פרומפט (היום)</text>
      {rows.map(([h, a, b], i) => {
        const y = 62 + i * 66;
        return (
          <g key={h}>
            <rect x="290" y={y} width="214" height="50" fill="#F3F1EA" stroke="#15171C" strokeWidth="1.2" />
            <text x="494" y={y + 21} textAnchor="end" style={{ fontFamily: "IBM Plex Sans Hebrew", fontSize: 14, fontWeight: 700 }} fill="#15171C">{h}</text>
            <text x="494" y={y + 40} textAnchor="end" style={{ fontFamily: "IBM Plex Sans Hebrew", fontSize: 11.5 }} fill="#4E525B">{a}</text>
            <line className="draw" style={{ ["--len" as any]: 100, ["--i" as any]: i }} x1="288" y1={y + 25} x2="188" y2={y + 25} stroke="#B8322A" strokeWidth="1.5" strokeDasharray="4 3" />
            <rect x="16" y={y} width="170" height="50" fill="#E6ECF4" stroke="#2C5A93" strokeWidth="1.2" />
            <text x="176" y={y + 30} textAnchor="end" style={{ fontFamily: "IBM Plex Sans Hebrew", fontSize: 13, fontWeight: 600 }} fill="#16365F">{b}</text>
          </g>
        );
      })}
    </svg>
  );
}

const LINKS = [
  { to: 9, rule: "תבנית היא הנחיה עם מבנה קבוע ופרמטרים משתנים.", insight: "מה שאלכסנדר עשה לחלון ישיבה, אפשר לעשות לניתוח אתר.", action: "הפכו משימה אחת שחזרה השבוע לתבנית עם 3 עד 7 פרמטרים." },
  { to: 11, rule: "מפרידים את מה שקבוע ממה שמשתנה.", insight: "הקבוע נכתב פעם אחת. רק הפרמטר משתנה בין פרויקטים.", action: "סמנו בסוגריים מרובעים כל מילה שתשתנה בפרויקט הבא." },
  { to: 19, rule: "שאלה טובה מגדירה את המקום מחדש.", insight: "\"עיר נמל או עיר ליד נמל\" היא תבנית, לא שאלה על אשדוד בלבד.", action: "הריצו את אותה תבנית על עיר שנייה, והשוו." },
  { to: 21, rule: "תבנית בלי אימות משכפלת טעות.", insight: "AI ישכפל תקן שגוי בכל פרויקט, באותו ביטחון.", action: "הוסיפו לכל תבנית שורת אימות: מספר תקן ונושאו." },
];

export default function Feature() {
  return (
    <main className="page">
      <article className="ft" dir="rtl">
        <div className="ops no-print"><button className="press btn-quiet" onClick={() => window.print()}><IconPrint width={16} height={16} />הדפסה ל-A4</button></div>
        <figure className="ft-hero" style={{ margin: 0 }}>
          <PatternNet />
          <div className="ft-head">
            <div className="ft-kicker">כתבה · שפה ושיטה</div>
            <h1 className="ft-title">שפת תבניות לשיחה עם מכונה.</h1>
            <Rich as="p" className="ft-deck">{"מה ספר אדריכלות מ-1977 מלמד על פרומפטים: **בעיה שחוזרת**, ולב הפתרון שלה."}</Rich>
          </div>
        </figure>
        <figcaption className="ft-caption">רשת השיעורים של הקורס: שורה לכל קומה, ריבוע לכל שיעור. איור בקוד, בהשראת שרטוט ציאנוטייפ.</figcaption>

        <div className="ft-col">
          <p className="ft-drop">
            בשנת <bdi className="num">1977</bdi> פרסמו <strong>כריסטופר אלכסנדר</strong> <span className="latin">Christopher Alexander</span> ושותפיו ספר של <bdi className="num">253</bdi> תבניות.{" "}
            כל תבנית מתארת בעיה שחוזרת בסביבה הבנויה, ואת לב הפתרון שלה: מחלון עם מקום ישיבה, ועד מבנה של אזור שלם. <span className="src">(A Pattern Language, Oxford University Press)</span>
          </p>
          <p>
            המבנה של כל תבנית קבוע: <strong>הקשר</strong>, <strong>בעיה</strong>, <strong>לב הפתרון</strong>, וקישור לתבניות גדולות וקטנות ממנה.{" "}
            זה בדיוק המבנה של פרומפט טוב: <strong>הגדרות ופרויקט</strong> נותנים הקשר, <strong>הצ'אט</strong> מציג את הבעיה, ו<strong>פורמט התוצר</strong> הוא לב הפתרון.
          </p>
          <blockquote className="ft-quote">
            <span className="tr-l">תרגום</span>
            <p className="tr">"כל תבנית מתארת בעיה שחוזרת שוב ושוב בסביבה שלנו, ואז מתארת את לב הפתרון לבעיה, כך שאפשר להשתמש בפתרון הזה מיליון פעמים, בלי לעשות אותו אף פעם באותה דרך."</p>
            <p className="orig">"Each pattern describes a problem which occurs over and over again in our environment, and then describes the core of the solution to that problem, in such a way that you can use this solution a million times over, without ever doing it the same way twice."</p>
            <cite>כריסטופר אלכסנדר, שרה אישיקאווה, מוריי סילברסטיין, <i>A Pattern Language</i>, Oxford University Press, <bdi className="num">1977</bdi>, עמ' x</cite>
          </blockquote>
          <p>
            ההבדל בין שאלה לתבנית הוא ההבדל בין חובבן למקצוען.{" "}
            שאלה נכתבת מחדש בכל פעם. תבנית נכתבת פעם אחת, ומופעלת על כל פרויקט עם פרמטרים אחרים.{" "}
            ובלשון של אלכסנדר: אף פעם לא באותה דרך.
          </p>
        </div>

        <div className="ft-split">
          <figure style={{ margin: 0 }}>
            <Anatomy />
            <figcaption className="ft-caption">אנטומיה: ארבעת חלקי התבנית, והמקום שלהם בפרומפט בשלוש שכבות.</figcaption>
          </figure>
          <div className="ft-col" style={{ margin: 0 }}>
            <p>
              קחו את השאלה של שיעור <bdi className="num">19</bdi>: <strong>אשדוד</strong> <span className="latin">Ashdod</span>, עיר נמל או עיר ליד נמל?{" "}
              העיר קמה ב-<bdi className="num">1956</bdi>, והנמל נפתח ב-<bdi className="num">1965</bdi>. <span className="src">(עיריית אשדוד; חברת נמל אשדוד)</span>
            </p>
            <p>
              כשאלה חד־פעמית, היא נותנת מאמר. כתבנית, היא נותנת כלי:{" "}
              <strong>[עיר]</strong>, <strong>[מוסד מרכזי]</strong>, והאם העיר <strong>נשענת</strong> עליו או רק <strong>נמצאת לידו</strong>.
            </p>
            <p>
              אותה תבנית שואלת על <strong>חיפה</strong> <span className="latin">Haifa</span> והנמל שלה, על <strong>באר שבע</strong> <span className="latin">Be'er Sheva</span> והאוניברסיטה, ועל <strong>רחובות</strong> <span className="latin">Rehovot</span> ומכון ויצמן.
            </p>
          </div>
        </div>

        <div className="ft-col">
          <aside className="ft-insight"><span className="label">תובנה</span><Rich as="p">{"==פרומפט טוב הוא תבנית: בעיה שחוזרת, ולב הפתרון שלה.=="}</Rich></aside>

          <aside className="ft-haiku" aria-label="הייקו">
            <span>עגור בנמל</span>
            <span>שאלה עולה לאט</span>
            <span>העיר מקשיבה</span>
            <small>מה ההייקו מאיר: שאלה טובה מרימה משקל, כמו עגור. היא לא עונה במקום העיר.</small>
          </aside>

          <section className="ft-links" aria-label="חיבורים">
            <h2 className="section-title" style={{ marginTop: 0 }}>חיבורים לשיעורים</h2>
            {LINKS.map((k) => {
              const l = byId(k.to)!;
              return (
                <a key={k.to} className="press ft-link" href={href("lesson", String(k.to))} style={{ borderInlineStart: `4px solid ${TRACK_HEX[l.track]}` }}>
                  <span className="label">שיעור {l.code} · {l.title}</span>
                  <span><b>הכלל:</b> {k.rule}</span>
                  <span><b>מה זה אומר:</b> {k.insight}</span>
                  <span><b>מה עושים:</b> {k.action}</span>
                </a>
              );
            })}
          </section>

          <section>
            <h2 className="section-title">פוסט מוכן לשיתוף</h2>
            <div className="ft-post">{`ב-1977 כריסטופר אלכסנדר כתב ספר על אדריכלות. בלי לדעת, הוא כתב גם מדריך לפרומפטים.
כל אחת מ-253 התבניות בספר בנויה כך: הקשר, בעיה שחוזרת, ולב הפתרון.
זה מה שחסר לרוב הפרומפטים: הם שאלה, לא תבנית.
שאלה נכתבת מחדש בכל פעם. תבנית נכתבת פעם אחת, ומופעלת על כל פרויקט.
הדרך: קחו משימה שחזרה אצלכם השבוע. כתבו את ההקשר הקבוע פעם אחת, וסמנו בסוגריים את מה שמשתנה: עיר, מגרש, תקן.
איזו משימה במשרד שלכם ראויה להיות תבנית?`}</div>
          </section>

          <section className="ft-sources">
            <h2 className="section-title">מקורות</h2>
            <ol>
              <li>Christopher Alexander, Sara Ishikawa, Murray Silverstein, <i>A Pattern Language: Towns, Buildings, Construction</i>, Oxford University Press, 1977.</li>
              <li>Anthropic, <a href="https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview" target="_blank" rel="noreferrer">Prompt engineering overview</a>.</li>
              <li>שיעורים 09, 11, 19 ו-21 בקורס הזה.</li>
            </ol>
          </section>
        </div>
      </article>
    </main>
  );
}
