import type { ReactNode } from "react";
import Rich from "../components/Rich";
import { IconPrint } from "../components/Icons";
import { TRACK_HEX, byId } from "../data/course";
import { href } from "../lib/route";
import { PatternArticle } from "./Feature";

// ריכוזי ידע: כל כתבה בפריסה אחרת, בשפה אחת (סעיף 7 בשפת העיצוב).
// כל טקסט בכתיב Rich: **מודגש**, ==תובנה==, ~~לועזית~~, ^^מקור^^.

type Link = { to: number; rule: string; insight: string; action: string };
type Art = {
  id: string; kind: string; kicker: string; title: string; deck: string;
  layout: "full" | "split" | "strip" | "collage"; layoutName: string;
  Hero: () => ReactNode; caption: string;
  body: string[];
  quote: { tr: string; orig: string; origDir: "ltr" | "rtl"; cite: string };
  after: string[];
  insight: string;
  haiku: [string, string, string]; haikuNote: string;
  links: Link[];
  post: string;
  sources: string[];
  inspiration: string;
};

const T = { fontFamily: "IBM Plex Sans Hebrew, sans-serif" } as const;
const M = { fontFamily: "IBM Plex Mono, monospace" } as const;

// ===== איורים בקוד =====
function StreetEyes() {
  // חזית רחוב: חלונות שמסתכלים (זהב) וחלונות כבויים, ומדרכה עם ספירה לפי שעה
  const bld = [
    { x: 20, w: 120, h: 230, f: 5 }, { x: 150, w: 90, h: 180, f: 4 }, { x: 250, w: 140, h: 260, f: 6 },
    { x: 400, w: 100, h: 150, f: 3 }, { x: 510, w: 130, h: 210, f: 5 },
  ];
  const lit = (i: number, r: number, c: number) => (i * 7 + r * 3 + c * 5) % 4 !== 0;
  const counts = [["08:00", 14], ["12:00", 31], ["17:00", 42], ["21:00", 23]] as const;
  return (
    <svg viewBox="0 0 660 420" role="img" aria-label="חזית רחוב: חלונות שמשקיפים על המדרכה, וספירת עוברים לפי שעה" style={{ direction: "ltr", display: "block", width: "100%", height: "auto" }}>
      <rect width="660" height="420" fill="#16365F" />
      {bld.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={300 - b.h} width={b.w} height={b.h} fill="none" stroke="#E9EEF5" strokeWidth="1.5" />
          {Array.from({ length: b.f }).filter((_, r) => 300 - b.h + 14 + r * 44 + 26 < 262).map((_, r) => Array.from({ length: Math.floor(b.w / 34) }).map((__, c) => (
            <rect key={`${r}-${c}`} x={b.x + 10 + c * 34} y={300 - b.h + 14 + r * 44} width="20" height="26"
              fill={lit(i, r, c) ? "#E2B04A" : "none"} stroke="#E9EEF5" strokeWidth="1" opacity={lit(i, r, c) ? 0.9 : 0.5} />
          )))}
          <rect x={b.x + b.w / 2 - 12} y={272} width="24" height="28" fill="#E2B04A" opacity=".85" />
        </g>
      ))}
      <line x1="0" y1="300" x2="660" y2="300" stroke="#E9EEF5" strokeWidth="2" />
      <line x1="0" y1="326" x2="660" y2="326" stroke="#E9EEF5" strokeWidth="1" strokeDasharray="6 5" opacity=".6" />
      {counts.map(([h, n], i) => (
        <g key={h}>
          <rect x={60 + i * 150} y={392 - n * 1.3} width="28" height={n * 1.3} fill="#E2B04A" opacity=".8" />
          <text x={74 + i * 150} y={410} textAnchor="middle" fill="#E9EEF5" style={{ ...M, fontSize: 11 }}>{h}</text>
          <text x={100 + i * 150} y={388} fill="#FFE45C" style={{ ...M, fontSize: 12, fontWeight: 600 }}>{n}</text>
        </g>
      ))}
      <text x="640" y="30" textAnchor="end" fill="#E9EEF5" style={{ ...T, fontSize: 13 }}>חלון מואר: עיניים על הרחוב</text>
      <text x="640" y="50" textAnchor="end" fill="#E9EEF5" style={{ ...T, fontSize: 13, opacity: 0.75 }}>עמודות: עוברים בדקה, לפי שעה (להמחשה)</text>
    </svg>
  );
}

function SheetRedline() {
  // גיליון חזית עם תיקון באדום וחותמת: המכונה משרטטת, האדם בודק וחותם
  return (
    <svg viewBox="0 0 1100 300" role="img" aria-label="גיליון חזית: מעגל תיקון אדום סביב ציטוט תקן שגוי, וחותמת שנחתמה" style={{ direction: "ltr", display: "block", width: "100%", height: "auto" }}>
      <rect width="1100" height="300" fill="#F7F5EF" />
      <g stroke="#16365F" strokeWidth="1.4" fill="none">
        <rect x="40" y="40" width="560" height="220" />
        {Array.from({ length: 6 }).map((_, r) => Array.from({ length: 8 }).map((__, c) => (
          <rect key={`${r}${c}`} x={62 + c * 66} y={56 + r * 33} width={44} height={20} fill={c > 4 ? "#DCE6F4" : "none"} />
        )))}
      </g>
      <text x="580" y="34" textAnchor="end" fill="#16365F" style={{ ...T, fontSize: 13, fontWeight: 600 }}>חזית דרומית, הצעת AI</text>
      <ellipse cx="460" cy="120" rx="120" ry="70" fill="none" stroke="#B8322A" strokeWidth="3" />
      <line x1="560" y1="80" x2="690" y2="60" stroke="#B8322A" strokeWidth="2" />
      <text x="1000" y="52" textAnchor="end" fill="#B8322A" style={{ ...T, fontSize: 16, fontWeight: 700 }}>"זיגוג 60% לפי תקן 1142"</text>
      <text x="1000" y="76" textAnchor="end" fill="#B8322A" style={{ ...T, fontSize: 14 }}>ת"י 1142 עוסק במעקות. לבדוק מול ת"י 1045.</text>
      <g transform="translate(700 130)">
        <rect width="340" height="130" fill="#FFFFFF" stroke="#15171C" strokeWidth="2" />
        <line x1="0" y1="44" x2="340" y2="44" stroke="#15171C" />
        <line x1="0" y1="88" x2="340" y2="88" stroke="#15171C" />
        <line x1="110" y1="44" x2="110" y2="130" stroke="#15171C" />
        <text x="326" y="29" textAnchor="end" fill="#15171C" style={{ ...T, fontSize: 15, fontWeight: 700 }}>חותמת גיליון</text>
        <text x="326" y="72" textAnchor="end" fill="#4E525B" style={{ ...T, fontSize: 13 }}>נבדק מול תקן</text>
        <text x="326" y="116" textAnchor="end" fill="#4E525B" style={{ ...T, fontSize: 13 }}>נחתם בידי</text>
        <text x="55" y="72" textAnchor="middle" fill="#1E7A55" style={{ ...M, fontSize: 18, fontWeight: 700 }}>✓</text>
        <text x="55" y="116" textAnchor="middle" fill="#16365F" style={{ ...T, fontSize: 13, fontWeight: 600 }}>אדריכל/ית</text>
      </g>
    </svg>
  );
}

function Triad({ k }: { k: 0 | 1 | 2 }) {
  const label = [["חוזק", "firmitas", "הגדרות"], ["תועלת", "utilitas", "פרויקט"], ["יופי", "venustas", "צ'אט"]][k];
  const color = ["#16365F", "#2E7D7A", "#B5652B"][k];
  return (
    <svg viewBox="0 0 320 300" role="img" aria-label={`${label[0]} (${label[1]}), שכבת ה${label[2]}`} style={{ direction: "ltr", display: "block", width: "100%", height: "auto", background: "#FFFFFF" }}>
      {k === 0 && (
        <g stroke={color} strokeWidth="2" fill="none">
          <rect x="120" y="40" width="80" height="16" /><rect x="132" y="56" width="56" height="150" />
          {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={140 + i * 8} y1="60" x2={140 + i * 8} y2="202" opacity=".5" />)}
          <rect x="112" y="206" width="96" height="18" /><line x1="60" y1="224" x2="260" y2="224" />
        </g>
      )}
      {k === 1 && (
        <g stroke={color} strokeWidth="2" fill="none">
          <rect x="50" y="40" width="220" height="184" />
          <line x1="50" y1="120" x2="190" y2="120" /><line x1="190" y1="40" x2="190" y2="224" /><line x1="120" y1="120" x2="120" y2="224" />
          <path d="M190 160 A24 24 0 0 1 214 184" /><circle cx="85" cy="80" r="6" fill={color} /><circle cx="230" cy="190" r="6" fill={color} />
          <path d="M85 80 L150 170 L230 190" strokeDasharray="5 4" />
        </g>
      )}
      {k === 2 && (
        <g stroke={color} strokeWidth="2" fill="none">
          <path d="M70 224 L70 120 A90 90 0 0 1 250 120 L250 224" />
          {[-40, -20, 0, 20, 40].map((a) => <line key={a} x1={160} y1={60} x2={160 + a * 2.6} y2={220} stroke="#E2B04A" strokeWidth="1.6" opacity=".9" />)}
          <circle cx="160" cy="60" r="12" fill="#FFE45C" stroke="#E2B04A" />
          <line x1="40" y1="224" x2="280" y2="224" />
        </g>
      )}
      <text x="300" y="262" textAnchor="end" fill={color} style={{ ...T, fontSize: 18, fontWeight: 700 }}>{label[0]}</text>
      <text x="20" y="262" fill="#7C808A" style={{ ...M, fontSize: 13, fontStyle: "italic" }}>{label[1]}</text>
      <text x="300" y="286" textAnchor="end" fill="#4E525B" style={{ ...T, fontSize: 13 }}>{`שכבת ה${label[2]}`}</text>
    </svg>
  );
}

// ===== תוכן =====
export const ARTICLES: Art[] = [
  {
    id: "jacobs", kind: "כתבה", kicker: "כתבה · עיר ומרחב", title: "עיניים על הרחוב.",
    deck: "**ג'יין ג'ייקובס** לא שאלה כמה רחב הרחוב. היא שאלה מי מסתכל עליו. זו השאלה שכדאי לשאול גם את המכונה.",
    layout: "split", layoutName: "פיצול: איור וכותרת זה לצד זה", Hero: StreetEyes,
    caption: "חזית רחוב: חלון מואר הוא עין על הרחוב. העמודות הן ספירה לדוגמה, לא מדידה. איור בקוד.",
    body: [
      "בשנת **1961** פרסמה **ג'יין ג'ייקובס** ~~Jane Jacobs~~ את **מותן וחייהן של ערים אמריקאיות גדולות**. היא לא הייתה מתכננת ערים. היא כתבה מתוך הרחוב שבו גרה, **רחוב הדסון** ~~Hudson Street~~ בניו יורק. ^^(The Death and Life of Great American Cities, Random House)^^",
      "המושג שטבעה, **עיניים על הרחוב**, הוא כמעט כלל מדיד: רחוב בטוח וחי כשיש בו חזיתות פעילות, כניסות קרובות, ואנשים שמסתכלים עליו לאורך כל היום. זה בדיוק מה ששיעור **08** מבקש לזהות: דפוסים, לא תחושות.",
    ],
    quote: {
      tr: "\"לערים יש היכולת לספק משהו לכל אחד, רק משום שהן נוצרות על ידי כל אחד, ורק כאשר הן נוצרות כך.\"",
      orig: "\"Cities have the capability of providing something for everybody, only because, and only when, they are created by everybody.\"",
      origDir: "ltr", cite: "ג'יין ג'ייקובס, The Death and Life of Great American Cities, Random House, 1961",
    },
    after: [
      "המכונה לא רואה את הרחוב. היא יודעת רק מה שתיארתם לה. לכן פרומפט עירוני טוב הוא **תצפית**: שעה, אורך מקטע, ספירה.",
      "במקום \"האם הרחוב הזה חי?\", כתבו: \"מקטע של **100** מטר ב**אשדוד** ~~Ashdod~~. **12** כניסות, **3** מהן פתוחות אחרי **21:00**. השווה למקטע השני, וזהה **5** דפוסים.\" זו השאלה שג'ייקובס הייתה שואלת.",
      "והתשובה מחזירה אתכם לרחוב: מה לספור בפעם הבאה, ובאיזו שעה.",
    ],
    insight: "פרומפט עירוני טוב הוא תצפית: שעה, מקטע וספירה.",
    haiku: ["אישה בחלון", "סופרת את העוברים", "הרחוב עוד ער"],
    haikuNote: "מה ההייקו מאיר: התצפית קודמת לתכנון. מי שסופר, רואה.",
    links: [
      { to: 8, rule: "רחוב חי נמדד בקומת הקרקע.", insight: "חזיתות פעילות וכניסות קרובות הן נתון, לא טעם.", action: "ספרו כניסות ב-100 מטר בשני רחובות, ותנו למודל להשוות." },
      { to: 14, rule: "מרחב ציבורי נקרא בארבע שכבות.", insight: "\"מתי\" היא השכבה שהכי קל לשכוח.", action: "הוסיפו לכל פרומפט עירוני שלוש שעות ביום." },
      { to: 18, rule: "המתאם המפתיע פותח את התכנון.", insight: "עיניים על הרחוב הן מתאם בין שימוש לבטיחות.", action: "בקשו מהמודל מתאם אחד בין שכבות, ובדקו אותו בשטח." },
    ],
    post: `ב-1961 ג'יין ג'ייקובס כתבה ספר על ערים, בלי להיות מתכננת. היא פשוט הסתכלה מהחלון.
המושג שטבעה, "עיניים על הרחוב", הוא כמעט כלל מדיד: חזיתות פעילות, כניסות קרובות, אנשים שמסתכלים.
כשאני שואלת מודל AI "האם הרחוב הזה חי?", אני מקבלת חיבור. כשאני כותבת לו תצפית: 100 מטר, 12 כניסות, 3 פתוחות בערב, אני מקבלת ניתוח.
הדרך: לפני שאתם שואלים על מקום, ספרו משהו אחד בשלוש שעות ביום.
מה הייתם סופרים ברחוב שלכם?`,
    sources: [
      "Jane Jacobs, The Death and Life of Great American Cities, Random House, 1961.",
      "שיעורים 08, 14 ו-18 בקורס הזה.",
    ],
    inspiration: "ג'יין ג'ייקובס, 1961",
  },
  {
    id: "machine", kind: "מאמר", kicker: "מאמר · אימות ואחריות", title: "מכונה כותבת. אדם חותם.",
    deck: "לה קורבוזיה קרא לבית **מכונה למגורים**. מאה שנה אחר כך המכונה כותבת בעצמה, ובביטחון מלא. מי חותם על הגיליון?",
    layout: "strip", layoutName: "רצועה: כותרת על נייר, ואיור ברוחב מלא מתחתיה", Hero: SheetRedline,
    caption: "גיליון חזית: מעגל תיקון סביב ציטוט תקן שגוי, וחותמת שנחתמת רק אחרי בדיקה. איור בקוד.",
    body: [
      "בשנת **1923** כתב **לה קורבוזיה** ~~Le Corbusier~~ ש\"הבית הוא מכונה למגורים\". הוא ביקש מהאדריכלות את מה שמהנדסים כבר ידעו: תקן, דיוק, וחזרה בלי טעות. ^^(Vers une architecture, 1923)^^",
      "היום המכונה כבר לא רק בונה. היא **כותבת**: חזית, פרוגרמה, טבלת תקנים. והיא כותבת באותו טון בטוח גם כשהיא טועה.",
    ],
    quote: {
      tr: "\"הבית הוא מכונה למגורים.\"",
      orig: "\"La maison est une machine à habiter.\"",
      origDir: "ltr", cite: "לה קורבוזיה, Vers une architecture, 1923",
    },
    after: [
      "בשיעור **21** המודל הציע חזית דרומית עם **60%** זיגוג, \"לפי תקן **1142**\". הבדיקה גילתה שת\"י **1142** עוסק במעקות, לא באנרגיה. המודל לא שיקר: הוא פשוט לא יודע שהוא לא יודע.",
      "לכן החותמת על הגיליון לא עוברת למכונה. **רשימת אימות** היא החותמת: מספר תקן ונושאו, יחידות מידה, מקור, ומה הנחה. בלי סימון בכל שורה, אין חתימה.",
      "דוגמה מהעיר: הצעה לבניין מגורים מול הים ב**אשדוד** ~~Ashdod~~. המודל ממליץ על זיגוג רחב לנוף. רשימת האימות שואלת מה הכיוון, מה דורש ת\"י **1045** לבידוד, ומה עושה רוח ים מלוחה לפרופילים.",
    ],
    insight: "המכונה מייצרת. רק אדם חותם על הגיליון.",
    haiku: ["חותם בפינה", "מכונה כתבה מהר", "האדם קורא"],
    haikuNote: "מה ההייקו מאיר: המהירות של המכונה והאחריות של האדם, באותו גיליון.",
    links: [
      { to: 21, rule: "AI טועה בביטחון.", insight: "טון בטוח אינו ראיה לנכונות.", action: "הוסיפו לכל פלט טבלת אימות: ערך, דרישה, מקור, עובר או נכשל." },
      { to: 6, rule: "קודם המגבלה הטכנית, אחריה ההשראה.", insight: "השראה בלי מגבלה מייצרת חזית שאי אפשר לבנות.", action: "פתחו כל בקשה יצירתית במגבלות הטכניות שלה." },
      { to: 23, rule: "AI מנתח לחצים. האדריכל מחליט.", insight: "ההמלצה חתומה בשם אדם, לא בשם מודל.", action: "סיימו כל המלצה בשורה: מה קבעתי אני, ומה הציע המודל." },
    ],
    post: `ב-1923 לה קורבוזיה קרא לבית "מכונה למגורים".
מאה שנה אחר כך, מכונה כתבה לי חזית עם 60% זיגוג "לפי תקן 1142". ת"י 1142 עוסק במעקות.
המכונה לא שיקרה. היא פשוט לא יודעת שהיא לא יודעת, וכותבת באותו ביטחון.
לכן אני לא נותנת לה לחתום. לכל פלט אני מצרפת רשימת אימות: מספר תקן ונושאו, מקור, ומה הנחה.
מה ברשימת האימות שלכם?`,
    sources: [
      "Le Corbusier, Vers une architecture, Paris, 1923.",
      "שיעורים 06, 21 ו-23 בקורס הזה.",
    ],
    inspiration: "לה קורבוזיה, 1923",
  },
  {
    id: "vitruvius", kind: "פוסט ארוך", kicker: "עיון · שלוש שכבות", title: "חוזק, תועלת, יופי.",
    deck: "לפני כאלפיים שנה **ויטרוביוס** חילק את הבניין לשלושה. אותה חלוקה מסדרת גם פרומפט.",
    layout: "collage", layoutName: "קולאז': שלושה איורים בגריד אחד", Hero: () => (
      <div className="ft-triad"><Triad k={0} /><Triad k={1} /><Triad k={2} /></div>
    ),
    caption: "שלושת העקרונות של ויטרוביוס, וקריאה שלי שמצמידה כל אחד לשכבה בפרומפט. איור בקוד.",
    body: [
      "בספר הראשון של **על האדריכלות** ~~De architectura~~ קובע **ויטרוביוס** ~~Vitruvius~~ שכל בניין צריך לענות על שלושה: **חוזק**, **תועלת** ו**יופי**. ^^(ספר א', פרק 3. נכתב בערך בין 30 ל-15 לפנה\"ס)^^",
      "זו לא רשימת מעלות. זה **סדר בנייה**: קודם מה שמחזיק, אחר כך מה שמשרת, ורק אז מה שמרגש.",
    ],
    quote: {
      tr: "\"ויש לעשות את כל אלה כך שיישמרו בהם החוזק, התועלת והיופי.\"",
      orig: "\"Haec autem ita fieri debent, ut habeatur ratio firmitatis, utilitatis, venustatis.\"",
      origDir: "ltr", cite: "ויטרוביוס, De architectura, ספר א', פרק 3",
    },
    after: [
      "**פרשנות שלי, לא של ויטרוביוס:** שלוש השכבות של שיעור **01** הולכות באותו סדר. **הגדרות** הן החוזק: שפה, מבנה ועקרון אימות, מה שמחזיק כל שיחה. **פרויקט** הוא התועלת: למי, איפה, ולפי איזה תקן. **צ'אט** הוא הרגע עצמו, השאלה שמכניסה אור.",
      "ומכאן כלל מעשי: פרומפט שמתחיל ביופי, \"תן לי רעיון מרגש לגן ילדים\", נופל כמו קשת בלי עמוד. אותה שאלה, אחרי הגדרות ופרויקט של גן ב**אשדוד** ~~Ashdod~~ עם **3** כיתות, עומדת.",
    ],
    insight: "סדר הבנייה הוא גם סדר הפרומפט: חוזק, תועלת, יופי.",
    haiku: ["אבן על אבן", "הקשת נושאת גג", "ואז אור נכנס"],
    haikuNote: "מה ההייקו מאיר: קודם מה שמחזיק, אחר כך מה שמשרת, ובסוף מה שמאיר.",
    links: [
      { to: 1, rule: "הקשר קבוע שייך להגדרות.", insight: "החוזק נכתב פעם אחת, ונושא כל שאלה.", action: "כתבו היום 4 שורות הגדרות, והפסיקו לחזור עליהן בצ'אט." },
      { to: 11, rule: "מבנה קבוע, פרמטרים משתנים.", insight: "התועלת היא הפרמטרים: מגרש, קהל, תקן.", action: "סמנו בסוגריים כל פרט שמשתנה בין פרויקטים." },
      { to: 16, rule: "ה-DNA שלך כבר בפרויקטים שלך.", insight: "היופי אישי, אבל הוא נשען על חוזק ותועלת.", action: "הוסיפו להגדרות שורה אחת מה-DNA האדריכלי שלכם." },
    ],
    post: `ויטרוביוס כתב לפני כאלפיים שנה שכל בניין צריך חוזק, תועלת ויופי.
אני קוראת את זה כסדר בנייה, וגם כסדר של פרומפט.
חוזק: ההגדרות שמחזיקות כל שיחה. תועלת: הפרויקט, למי ואיפה. יופי: השאלה של עכשיו.
פרומפט שמתחיל ביופי, "תן לי רעיון מרגש", נופל כמו קשת בלי עמוד.
באיזו שכבה מתחילים הפרומפטים שלכם?`,
    sources: [
      "Vitruvius, De architectura, ספר א', פרק 3.",
      "שיעורים 01, 11 ו-16 בקורס הזה.",
    ],
    inspiration: "ויטרוביוס, על האדריכלות",
  },
];

export const ALL = [
  { id: "patterns", kind: "כתבה", kicker: "כתבה · שפה ושיטה", title: "שפת תבניות לשיחה עם מכונה.", deck: "מה ספר אדריכלות מ-**1977** מלמד על פרומפטים: **בעיה שחוזרת**, ולב הפתרון שלה.", layoutName: "תמונה מלאה ואחריה פיצול", lessons: [9, 11, 19, 21], inspiration: "כריסטופר אלכסנדר, 1977" },
  ...ARTICLES.map((a) => ({ id: a.id, kind: a.kind, kicker: a.kicker, title: a.title, deck: a.deck, layoutName: a.layoutName, lessons: a.links.map((l) => l.to), inspiration: a.inspiration })),
];

function Head({ a }: { a: Art }) {
  return (
    <header className="ft-head ft-head-paper">
      <div className="ft-kicker">{a.kicker}</div>
      <h1 className="ft-title">{a.title}</h1>
      <Rich as="p" className="ft-deck">{a.deck}</Rich>
    </header>
  );
}

function ArticleView({ a }: { a: Art }) {
  const idx = ALL.findIndex((x) => x.id === a.id);
  const next = ALL[(idx + 1) % ALL.length];
  return (
    <article className={`ft ft-l-${a.layout}`} dir="rtl">
      <div className="ops no-print">
        <a className="press btn-quiet" href={href("feature")}>כל הכתבות</a>
        <button className="press btn-quiet" onClick={() => window.print()}><IconPrint width={16} height={16} />הדפסה ל-A4</button>
      </div>
      {a.layout === "split" && (
        <div className="ft-split ft-split-hero"><figure style={{ margin: 0 }}><a.Hero /></figure><Head a={a} /></div>
      )}
      {a.layout === "strip" && (<><Head a={a} /><figure className="ft-strip" style={{ margin: 0 }}><a.Hero /></figure></>)}
      {a.layout === "collage" && (<><Head a={a} /><figure style={{ margin: 0 }}><a.Hero /></figure></>)}
      <figcaption className="ft-caption">{a.caption}</figcaption>

      <div className="ft-col">
        {a.body.map((p, i) => <Rich key={i} as="p" className={i === 0 ? "ft-p ft-drop" : "ft-p"}>{p}</Rich>)}
        <blockquote className="ft-quote">
          <span className="tr-l">תרגום</span>
          <p className="tr">{a.quote.tr}</p>
          <p className="orig" dir={a.quote.origDir}>{a.quote.orig}</p>
          <cite>{a.quote.cite}</cite>
        </blockquote>
        {a.after.map((p, i) => <Rich key={i} as="p" className="ft-p">{p}</Rich>)}

        <aside className="ft-insight"><span className="label">תובנה</span><Rich as="p">{`==${a.insight}==`}</Rich></aside>
        <aside className="ft-haiku" aria-label="הייקו">
          {a.haiku.map((l, i) => <span key={i}>{l}</span>)}
          <small>{a.haikuNote}</small>
        </aside>

        <section className="ft-links" aria-label="חיבורים">
          <h2 className="section-title" style={{ marginTop: 0 }}>חיבורים לשיעורים</h2>
          {a.links.map((k) => {
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
          <div className="ft-post">{a.post}</div>
        </section>
        <section className="ft-sources">
          <h2 className="section-title">מקורות</h2>
          <ol>{a.sources.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </section>
        <a className="press ft-link no-print" href={href("feature", next.id)} style={{ marginTop: 24 }}>
          <span className="label">הכתבה הבאה</span>
          <span><b>{next.title}</b></span>
        </a>
      </div>
    </article>
  );
}

function Index() {
  return (
    <main className="page">
      <div className="crumbs"><a href={href("home")}>הבית</a><span>/</span><span>כתבות</span></div>
      <div className="kicker">ריכוזי ידע</div>
      <h1 className="page-title">ארבע כתבות, ארבעה אבות.</h1>
      <p className="page-sub lines">
        <span>כל כתבה מחברת הוגה אחד מהאדריכלות והעיר לשיעורים בקורס.</span>
        <span>בכל אחת: ציטוט מהמקור, <strong>תובנה</strong>, הייקו, חיבורים ופוסט מוכן. כל אחת בפריסה אחרת.</span>
      </p>
      <div className="articles-grid">
        {ALL.map((a, i) => (
          <a key={a.id} className="press article-card rise" style={{ ["--i" as any]: i }} href={href("feature", a.id)}>
            <span className="label">{a.kicker}</span>
            <h2>{a.title}</h2>
            <Rich as="p">{a.deck}</Rich>
            <span className="meta">
              <span>בהשראת {a.inspiration}</span>
              <span>שיעורים {a.lessons.map((n) => String(n).padStart(2, "0")).join(" · ")}</span>
            </span>
            <span className="src">פריסה: {a.layoutName}</span>
          </a>
        ))}
      </div>
    </main>
  );
}

export default function Feature({ id }: { id?: string }) {
  if (!id) return <Index />;
  if (id === "patterns") return <PatternArticle />;
  const a = ARTICLES.find((x) => x.id === id);
  if (!a) return <Index />;
  return <main className="page"><ArticleView a={a} /></main>;
}
