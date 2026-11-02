import { useEffect, useState } from "react";
import Rich from "./Rich";
import { IconNext, IconPrev, IconX } from "./Icons";

// מצגת שיעור 01, מתוך הגרסה המקורית. התוכן זוקק: תובנה בכל שקף, משפט בכל שורה.
type Slide = { k: string; title: string; sub?: string; list?: string[]; big?: string; cols?: { h: string; t: string; tone?: "bad" | "good" }[] };

const SLIDES: Slide[] = [
  { k: "פתיחה", title: "הסוד לתשובות מדויקות.", sub: "איך הופכים את Claude מעוזר כללי למומחה אישי, בעזרת **שלוש רמות בקרה**." },
  { k: "הבעיה", title: "תשובה בינונית היא לא אשמת הכלי.", sub: "שואלים, מקבלים תשובה. לפעמים טובה, לפעמים פחות. ==הבעיה בשיטה, לא בכלי.==" },
  { k: "המחיר", big: "70%", title: "מהפוטנציאל לא ממומש.", sub: "כשעובדים רק ברמת הצ'אט. הערכה של מחברת הקורס, לא מדידה." },
  { k: "הפתרון", title: "מערכת בקרה משולשת.", sub: "התשובה נקבעת לא רק בשאלה האחרונה. היא תוצר של שלוש רמות:", list: ["**הגדרות** (Settings)", "**פרויקט** (Project)", "**צ'אט** (Chat)"] },
  { k: "מטאפורה", title: "מסעדת שף.", sub: "מנה מושלמת תלויה ב**מטבח**, ב**תפריט** וב**הזמנה**. לא רק במלצר.", list: ["מטבח + תפריט + הזמנה = המנה המושלמת"] },
  { k: "רמה 1", title: "ההגדרות: המטבח שלכם.", sub: "פילטר קבוע שעובר על כל שיחה.", list: ["**שפה**: עברית, אנגלית", "**טון**: פורמלי, ישיר, יצירתי", "**מבנה**: פסקאות, רשימות, דוגמאות", "**עיקרון**: תמיד סנתז את הבקשה לפני שתענה"] },
  { k: "כלל הזהב", title: "נכון תמיד? שייך להגדרות.", sub: "==אם זה נכון לכל שיחה ובכל הקשר, זה לא נכתב שוב בשאלה.==" },
  { k: "רמה 2", title: "הפרויקט: התפריט המקצועי.", sub: "הסביבה של סוג עבודה אחד.", list: ["**תחום**: 'אתה עוזר לי בתכנון מבני ציבור'", "**מסמכי רקע**: תקנים, פרוגרמה, תיק פרויקט", "**כלל ייחודי**: 'בפרויקט זה, התייחס תמיד לת\"י 1045 (בידוד תרמי)'", "**מינוח**: 'השתמש במינוח אדריכלי מדויק'"] },
  { k: "רמה 3", title: "הצ'אט: ההזמנה הנקודתית.", sub: "השאלה של עכשיו. ==נכון רק לשאלה הזאת? נשאר בצ'אט.==" },
  { k: "סינתזה", title: "כך נוצרת תשובה מדויקת.", list: ["**שאלה**: עזור לי לתכנן כיתה לבית ספר.", "**הגדרות**: ענה בעברית, פתח בסינתזה, כתוב בפסקאות.", "**פרויקט**: תכנון בתי ספר, גילאי 6 עד 12, הנחיות משרד החינוך.", "**צ'אט**: כיתה. לא מסדרון ולא חצר."] },
  { k: "לפני ואחרי", title: "ההבדל בין חובבן למקצוען.", cols: [
    { h: "לפני: צ'אט בלבד", t: "המודל שואל: איזה בניין? איזה גיל? איזה תקן? **תסכול**, בזבוז זמן, תשובה גנרית.", tone: "bad" },
    { h: "אחרי: שלוש רמות", t: "\"בהתבסס על הקשר תכנון בתי הספר, הנה הצעה לכיתה...\" **דיוק**, חיסכון בזמן, תשובה מותאמת.", tone: "good" },
  ] },
  { k: "הטעות", title: "עובדים רק ברמת הצ'אט.", sub: "מכניסים את כל ההקשר לשאלה, שוב ושוב. ותוהים למה התשובות לא עקביות." },
  { k: "המודל החדש", title: "מטבח, תפריט, הזמנה.", cols: [
    { h: "הגדרות", t: "מה שנכון **תמיד**." },
    { h: "פרויקט", t: "מה שנכון ל**סוג העבודה**." },
    { h: "צ'אט", t: "מה שנכון **עכשיו**." },
  ] },
  { k: "סיום", title: "הפסיקו לעבוד קשה. התחילו לעבוד חכם.", sub: "==תשובות שמותאמות לאופן שבו אתם עובדים.== התרגיל: לבנות את שלוש השכבות שלכם." },
];

export default function Deck({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const nxt = () => setI((x) => Math.min(SLIDES.length - 1, x + 1));
  const prv = () => setI((x) => Math.max(0, x - 1));
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" || e.key === " ") { e.preventDefault(); nxt(); }
      if (e.key === "ArrowRight") prv();
    };
    window.addEventListener("keydown", on);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", on); document.body.style.overflow = ""; };
  }, []); // eslint-disable-line
  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-label="מצגת שיעור 01" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="deck">
        <div className="deck-top">
          <span>שיעור 01 · שליטה מיטבית ב-AI</span>
          <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span>{s.k} · <bdi className="num">{i + 1}/{SLIDES.length}</bdi></span>
            <button className="press icon-btn" onClick={onClose} aria-label="סגירת המצגת" title="סגירה (Esc)"><IconX /></button>
          </span>
        </div>
        <div className="deck-body" key={i}>
          {s.big && <div className="d-big rise">{s.big}</div>}
          <h2 className="rise">{s.title}</h2>
          {s.sub && <Rich as="p" className="d-sub rise">{s.sub}</Rich>}
          {s.list && <div className="d-list">{s.list.map((x, k) => <Rich key={k} as="div" className="rise">{x}</Rich>)}</div>}
          {s.cols && (
            <div className="d-cols">
              {s.cols.map((c, k) => (
                <div key={k} className={`d-col rise ${c.tone || ""}`} style={{ ["--i" as any]: k }}>
                  <b style={{ display: "block", marginBottom: 6 }}>{c.h}</b>
                  <Rich>{c.t}</Rich>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="deck-foot">
          <button className="press icon-btn" onClick={prv} disabled={i === 0} aria-label="השקף הקודם" title="הקודם (חץ ימינה)"><IconPrev /></button>
          <div className="dots" aria-hidden="true">{SLIDES.map((_, k) => <i key={k} className={k <= i ? "on" : ""} />)}</div>
          <button className="press icon-btn" onClick={nxt} disabled={i === SLIDES.length - 1} aria-label="השקף הבא" title="הבא (חץ שמאלה)"><IconNext /></button>
        </div>
      </div>
    </div>
  );
}
