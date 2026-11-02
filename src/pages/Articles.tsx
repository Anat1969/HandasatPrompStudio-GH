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
  layout: "full" | "split" | "strip" | "collage" | "infographic" | "qa" | "timeline"; layoutName: string;
  qa?: { q: string; a: string }[];
  timeline?: { year: string; title: string; text: string; lesson?: number }[];
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


function ContextFlow() {
  // בהשראת מינאר: רוחב הסרט הוא כמות ההקשר שהמודל מחזיק, מפנייה לפנייה. הרוחבים להמחשה.
  const X = [1030, 810, 590, 370, 150];
  const top = [64, 48, 34, 20, 8];
  const lost = ["המגרש", "התקן", "הלקוח", "הטון"];
  const band = (y: number, w: number[]) =>
    [...X.map((x, i) => `${x},${y - w[i] / 2}`), ...[...X].reverse().map((x, i) => `${x},${y + w[w.length - 1 - i] / 2}`)].join(" ");
  return (
    <svg viewBox="0 0 1100 500" role="img" aria-label="שני סרטים: בצ'אט בלבד ההקשר נמס מפנייה לפנייה, בשלוש שכבות הוא נשמר" style={{ direction: "ltr", display: "block", width: "100%", height: "auto" }}>
      <rect width="1100" height="500" fill="#F7F5EF" />
      <text x="1070" y="52" textAnchor="end" fill="#B8322A" style={{ ...T, fontSize: 16, fontWeight: 700 }}>רק בצ'אט: ההקשר נמס</text>
      <polygon points={band(150, top)} fill="#E2B04A" opacity=".9" />
      {lost.map((l, i) => {
        const x = (X[i] + X[i + 1]) / 2;
        return (
          <g key={l}>
            <line x1={x} y1={150 - top[i] / 2 - 4} x2={x} y2={92} stroke="#B8322A" strokeWidth="1.2" />
            <text x={x} y={84} textAnchor="middle" fill="#B8322A" style={{ ...T, fontSize: 13 }}>{`נשכח: ${l}`}</text>
          </g>
        );
      })}
      <text x="1070" y="272" textAnchor="end" fill="#1E7A55" style={{ ...T, fontSize: 16, fontWeight: 700 }}>שלוש שכבות: ההקשר נוסע עם כל פנייה</text>
      <polygon points={band(350, [64, 64, 64, 64, 64])} fill="#16365F" opacity=".88" />
      <text x="590" y="355" textAnchor="middle" fill="#E9EEF5" style={{ ...T, fontSize: 13 }}>הגדרות + פרויקט: מגרש, תקן, לקוח, טון</text>
      {X.map((x, i) => (
        <g key={x}>
          <line x1={x} y1={190} x2={x} y2={310} stroke="#9A9EA6" strokeDasharray="3 4" />
          <text x={x + 4} y={440} textAnchor="end" fill="#4E525B" style={{ ...T, fontSize: 13 }}>פנייה</text>
          <text x={x + 10} y={440} fill="#15171C" style={{ ...M, fontSize: 13, fontWeight: 600 }}>{i + 1}</text>
        </g>
      ))}
      <line x1="1050" y1="465" x2="130" y2="465" stroke="#15171C" strokeWidth="1.2" />
      <polygon points="130,465 142,459 142,471" fill="#15171C" />
      <text x="1070" y="490" textAnchor="end" fill="#7C808A" style={{ ...T, fontSize: 12 }}>כיוון השיחה. רוחב הסרט: כמות ההקשר שהמודל מחזיק (להמחשה, לא מדידה)</text>
    </svg>
  );
}


function ScoreSheet() {
  // פרטיטורה כפרומפט: מפתח וקצב (הגדרות), הרכב (פרויקט), התיבה הנוכחית (צ'אט), ותיבת TACET
  const staves = [70, 170];
  const lines = (y: number) => [0, 1, 2, 3, 4].map((k) => <line key={k} x1="60" y1={y + k * 10} x2="1060" y2={y + k * 10} stroke="#15171C" strokeWidth="1" />);
  const notes = [[690, 3], [740, 1], [790, 2], [840, 0], [890, 2], [940, 4]];
  return (
    <svg viewBox="0 0 1100 300" role="img" aria-label="פרטיטורה: מפתח וטמפו בתחילת השורה, שמות הכלים בצד, תיבה עם תווים, ותיבת שקט" style={{ direction: "ltr", display: "block", width: "100%", height: "auto" }}>
      <rect width="1100" height="300" fill="#F7F5EF" />
      {staves.map((y) => <g key={y}>{lines(y)}</g>)}
      <line x1="60" y1="70" x2="60" y2="210" stroke="#15171C" strokeWidth="3" />
      {[300, 640, 1000, 1060].map((x) => <line key={x} x1={x} y1="70" x2={x} y2="210" stroke="#15171C" strokeWidth="1.2" />)}
      <rect x="66" y="58" width="130" height="164" fill="#16365F" opacity=".1" stroke="#16365F" />
      <text x="80" y="104" fill="#16365F" style={{ ...M, fontSize: 34, fontWeight: 600 }}>4</text>
      <text x="80" y="134" fill="#16365F" style={{ ...M, fontSize: 34, fontWeight: 600 }}>4</text>
      <text x="120" y="50" fill="#16365F" style={{ fontFamily: "serif", fontSize: 18, fontStyle: "italic", fontWeight: 700 }}>Allegro</text>
      <text x="196" y="250" textAnchor="end" fill="#16365F" style={{ ...T, fontSize: 14, fontWeight: 700 }}>הגדרות: חל על הכול</text>
      <text x="40" y="96" textAnchor="end" fill="#2E7D7A" style={{ ...T, fontSize: 13, fontWeight: 700 }}>כינור</text>
      <text x="40" y="196" textAnchor="end" fill="#2E7D7A" style={{ ...T, fontSize: 13, fontWeight: 700 }}>צ'לו</text>
      <text x="60" y="290" fill="#2E7D7A" style={{ ...T, fontSize: 14, fontWeight: 700 }}>פרויקט: ההרכב</text>
      <rect x="644" y="58" width="352" height="164" fill="#B5652B" opacity=".08" stroke="#B5652B" />
      {notes.map(([x, k], i) => (
        <g key={i}>
          <ellipse cx={x} cy={110 - k * 5} rx="8" ry="6" fill="#15171C" transform={`rotate(-20 ${x} ${110 - k * 5})`} />
          <line x1={x + 7} y1={110 - k * 5} x2={x + 7} y2={110 - k * 5 - 34} stroke="#15171C" strokeWidth="1.5" />
        </g>
      ))}
      <text x="700" y="160" fill="#15171C" style={{ fontFamily: "serif", fontSize: 18, fontStyle: "italic", fontWeight: 700 }}>mf</text>
      <text x="996" y="250" textAnchor="end" fill="#B5652B" style={{ ...T, fontSize: 14, fontWeight: 700 }}>צ'אט: התיבה של עכשיו</text>
      <text x="470" y="186" textAnchor="middle" fill="#B8322A" style={{ ...M, fontSize: 18, fontWeight: 700, letterSpacing: ".1em" }}>TACET</text>
      <text x="470" y="250" textAnchor="middle" fill="#B8322A" style={{ ...T, fontSize: 13 }}>מגבלה היא הוראה: "שותק"</text>
    </svg>
  );
}

function FogStand() {
  // מהחיפושית לביתן: פני שטח עם גבשושיות שאוספים טל, מתורגמים לגג הצללה על חולות החוף
  const bumps = Array.from({ length: 14 }, (_, i) => 120 + i * 62);
  return (
    <svg viewBox="0 0 1100 320" role="img" aria-label="מעקרון בטבע למבנה: גבשושיות שאוספות טיפות, וגג הצללה על חולות" style={{ direction: "ltr", display: "block", width: "100%", height: "auto" }}>
      <rect width="1100" height="320" fill="#16365F" />
      <path d="M0 270 C 180 240, 300 290, 480 262 S 820 236, 1100 268 L1100 320 L0 320 Z" fill="#E2C48A" opacity=".85" />
      <path d="M90 150 Q 550 70 1010 150" fill="none" stroke="#E9EEF5" strokeWidth="4" />
      {bumps.map((x) => {
        const t = (x - 90) / 920, y = 150 - Math.sin(Math.PI * t) * 40;
        return <g key={x}><circle cx={x} cy={y - 6} r="6" fill="#E9EEF5" /><circle cx={x + 3} cy={y + 18} r="3.5" fill="#7FD3E6" /></g>;
      })}
      {[180, 400, 700, 920].map((x) => <line key={x} x1={x} y1={150 - Math.sin(Math.PI * ((x - 90) / 920)) * 40} x2={x} y2="262" stroke="#E9EEF5" strokeWidth="3" />)}
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${30 + i * 18} ${40 + i * 14} q 40 -10 80 0`} stroke="#E9EEF5" strokeWidth="1.5" fill="none" opacity=".5" />)}
      <text x="1070" y="40" textAnchor="end" fill="#E9EEF5" style={{ ...T, fontSize: 15, fontWeight: 700 }}>עיקרון: גבשושית אוספת טיפה, שקע מוביל אותה</text>
      <text x="1070" y="62" textAnchor="end" fill="#E9EEF5" style={{ ...T, fontSize: 13, opacity: .8 }}>מבנה: גג הצללה שאוסף טל מרוח הים (רעיון לתרגיל, לא פרויקט קיים)</text>
      <text x="40" y="300" fill="#16365F" style={{ ...T, fontSize: 13, fontWeight: 600 }}>חולות החוף</text>
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
  {
    id: "minard", kind: "אינפוגרפיקה", kicker: "אינפוגרפיקה · זרימה ואובדן", title: "מה נשאר בדרך.",
    deck: "ב-**1869** שרטט **שארל ז'וזף מינאר** צבא שנמס בשלג. אותו שרטוט מראה מה קורה להקשר בשיחה ארוכה עם מכונה.",
    layout: "infographic", layoutName: "אינפוגרפיקה מובילה, וגוף בשני טורים", Hero: ContextFlow,
    caption: "בהשראת מינאר: שני סרטים, אותה שיחה. רוחב הסרט הוא ההקשר שהמודל מחזיק. הרוחבים להמחשה. איור בקוד.",
    body: [
      "המהנדס הצרפתי **שארל ז'וזף מינאר** ~~Charles Joseph Minard~~ שרטט ב-**1869** את מסע **נפוליאון** ~~Napoleon~~ לרוסיה ב-**1812**. רוחב הסרט הוא גודל הצבא: **422,000** חיילים ביציאה, כ-**100,000** במוסקבה, ו-**10,000** שחזרו. ^^(Carte figurative des pertes successives en hommes de l'Armée Française dans la campagne de Russie, 1869)^^",
      "בשרטוט אחד יש שישה נתונים: גודל הצבא, מיקום בשני צירים, כיוון התנועה, הטמפרטורה בנסיגה ותאריכים. לא צריך לקרוא מספר כדי להבין. ==הסרט נמס, וזה כל הסיפור.==",
      "שיחה ארוכה עם מודל היא מסע כזה. בפנייה הראשונה כתבתם הכול: **מגרש** ב**אשדוד** ~~Ashdod~~, **3** כיתות, **ת\"י 1045**, ולקוח עירוני. בפנייה החמישית, בצ'אט חדש, נשארה רק השאלה.",
      "זה לא כשל של המודל. זה כשל של **שכבות**: מה שנכתב בצ'אט נעלם בצ'אט הבא. מה שנכתב בהגדרות ובפרויקט נוסע עם כל פנייה. בשרטוט, הסרט העליון נמס, והתחתון שומר על רוחבו.",
    ],
    quote: {
      tr: "\"ייתכן שזו הגרפיקה הסטטיסטית הטובה ביותר שצוירה אי פעם.\"",
      orig: "\"It may well be the best statistical graphic ever drawn.\"",
      origDir: "ltr", cite: "אדוארד טאפטי, The Visual Display of Quantitative Information, Graphics Press, 1983",
    },
    after: [
      "**הכלל המעשי:** לפני שיחה ארוכה, ציירו לעצמכם את הסרט. מה חייב להגיע עד הפנייה האחרונה? את זה מעבירים לשכבת הפרויקט, ולא כותבים שוב בצ'אט.",
      "**ובדיקה אחת באמצע:** בפנייה השלישית, בקשו מהמודל לסכם במשפט אחד מה הוא יודע על הפרויקט. אם המגרש או התקן חסרים, הסרט כבר נמס.",
    ],
    insight: "מה שנכתב רק בצ'אט, נמס בדרך.",
    haiku: ["נהר של שלג", "הסרט מצטמק", "קו שחור חוזר"],
    haikuNote: "מה ההייקו מאיר: אובדן נראה לפני שקוראים אותו. גם אובדן של הקשר.",
    links: [
      { to: 3, rule: "שותף מחקר נבנה בסבבי משוב.", insight: "כל סבב מוסיף רוחב לסרט, רק אם ההקשר נשמר.", action: "בסבב השלישי, בקשו מהמודל לסכם מה הוא יודע על הפרויקט." },
      { to: 12, rule: "התובנה נמצאת בין המקורות.", insight: "מקור שהועלה למחברת הוא הקשר שלא נמס.", action: "העלו את מסמכי הפרויקט פעם אחת, במקום להדביק אותם בכל שאלה." },
      { to: 22, rule: "בלי תאריך, תכנית נשארת רעיון.", insight: "תכנית פעולה היא מסע ארוך, שמאבד פרטים בכל שלב.", action: "פתחו כל שלב בשורה אחת: מה נקבע עד עכשיו." },
    ],
    post: `ב-1869 שארל ז'וזף מינאר שרטט את הצבא של נפוליאון כסרט: 422,000 חיילים יצאו, 10,000 חזרו. רואים את האובדן לפני שקוראים מספר.
ככה נראית גם שיחה ארוכה עם AI. בפנייה הראשונה כתבתי מגרש, תקן ולקוח. בפנייה החמישית נשארה רק השאלה.
הפתרון לא בניסוח טוב יותר, אלא בשכבות: מה שחייב להגיע עד הסוף עובר להגדרות הפרויקט, ולא נכתב שוב בצ'אט.
מה הפרט שהמודל שלכם שוכח הכי מהר?`,
    sources: [
      "Charles Joseph Minard, Carte figurative des pertes successives en hommes de l'Armée Française dans la campagne de Russie 1812-1813, 1869.",
      "Edward R. Tufte, The Visual Display of Quantitative Information, Graphics Press, 1983.",
      "שיעורים 03, 12 ו-22 בקורס הזה.",
    ],
    inspiration: "שארל ז'וזף מינאר, 1869",
  },
  {
    id: "score", kind: "ראיון", kicker: "שאלות ותשובות · מוזיקה ומבנה", title: "התווים הם פרומפט.",
    deck: "פרטיטורה לא מנגנת. היא אומרת למי, באיזה קצב, ומה עכשיו. **שלוש שכבות**, כתובות על חמישה קווים.",
    layout: "qa", layoutName: "שאלות ותשובות: שיחה עם הקורא", Hero: ScoreSheet,
    caption: "פרטיטורה כפרומפט: מפתח וטמפו (הגדרות), ההרכב (פרויקט), התיבה הנוכחית (צ'אט), ותיבת שקט. איור בקוד.",
    body: [
      "מלחין לא נמצא באולם כשהיצירה מנוגנת. כל מה שיש לו הוא **דף**: סימנים שנגן זר יקרא, בשנה אחרת ובעיר אחרת, ויבין. זו בדיוק המשימה של פרומפט: להעביר כוונה למי שלא היה בחדר.",
    ],
    qa: [
      { q: "מה כתוב בפרטיטורה לפני התו הראשון?", a: "**מפתח**, **משקל** ו**הוראת טמפו**, כמו ~~Allegro~~. הם חלים על כל היצירה, ולא נכתבים שוב בכל תיבה. זו שכבת **ההגדרות**: שפה, טון ומבנה, פעם אחת." },
      { q: "ומי מנגן?", a: "בצד השורה רשום **ההרכב**: אילו כלים ובאיזה סדר. אותם תווים נשמעים אחרת ברביעיית מיתרים ובתזמורת. זו שכבת **הפרויקט**: למי, איפה ובאיזה הקשר." },
      { q: "ומה הצ'אט?", a: "**התיבה הנוכחית**: כמה תווים, דינמיקה, אולי סימן הדגשה. היא קצרה, כי כל השאר כבר כתוב. ==תיבה טובה קצרה, כי השכבות שמעליה עושות את העבודה.==" },
      { q: "ומה עם שקט?", a: "בשנת **1952** בוצעה לראשונה **4′33″** של **ג'ון קייג'** ~~John Cage~~. בפרטיטורה כתובה לכל אחד משלושת הפרקים מילה אחת: **TACET**, \"שותק\". גם זו הוראה מדויקת. בפרומפט: \"בלי הקדמה\", \"אל תמציא מספרי סעיפים\". ==מגבלה היא תו.==" },
      { q: "ואיך זה נשמע בעיר?", a: "ב**אשדוד** ~~Ashdod~~ פועלת **התזמורת האנדלוסית הישראלית** ~~Israeli Andalusian Orchestra~~. אותה מנגינה בהרכב אחר היא יצירה אחרת. כך גם פרומפט: אותו צ'אט, בפרויקט של גן ילדים באשדוד או של מגדל בתל אביב, מחזיר תשובה אחרת לגמרי." },
    ],
    quote: {
      tr: "\"אין לי מה לומר, ואני אומר את זה, וזו שירה כפי שאני צריך אותה.\"",
      orig: "\"I have nothing to say and I am saying it and that is poetry as I need it.\"",
      origDir: "ltr", cite: "ג'ון קייג', Lecture on Nothing, בתוך Silence, Wesleyan University Press, 1961",
    },
    after: [
      "**הכלל המעשי:** כתבו את הפרומפט כמו פרטיטורה. קודם מה שחל על כל היצירה, אחר כך ההרכב, ורק בסוף התיבה של עכשיו, עם שורת \"שותק\" אחת: מה המודל לא עושה.",
    ],
    insight: "תיבה קצרה, כי השכבות שמעליה עושות את העבודה.",
    haiku: ["דף לבן, שקט", "כנר קורא מפתח", "הקשת עולה"],
    haikuNote: "מה ההייקו מאיר: לפני הצליל, קוראים את מה שחל על הכול.",
    links: [
      { to: 1, rule: "הקשר קבוע שייך להגדרות.", insight: "המפתח והטמפו לא נכתבים בכל תיבה.", action: "העבירו להגדרות כל שורה שחוזרת בשתי שאלות שלכם." },
      { to: 9, rule: "תבנית היא הנחיה עם פרמטרים.", insight: "פרטיטורה מנוגנת אלף פעמים, בכל פעם בהרכב אחר.", action: "כתבו תבנית אחת, והריצו אותה על שני פרויקטים." },
      { to: 21, rule: "AI טועה בביטחון. אימות עוצר.", insight: "TACET היא הוראה מדויקת של מה לא לעשות.", action: "הוסיפו לכל צ'אט שורת \"אל\": מה המודל לא ממציא." },
    ],
    post: `פרטיטורה היא הפרומפט הוותיק בעולם.
לפני התו הראשון כתובים מפתח וטמפו: חלים על הכול, ולא חוזרים בכל תיבה.
בצד השורה כתוב ההרכב: אותם תווים, תזמורת אחרת, יצירה אחרת.
והתיבה עצמה קצרה, כי כל השאר כבר כתוב.
ג'ון קייג' כתב יצירה שלמה עם הוראה אחת: TACET, שותק. גם מגבלה היא תו.
מה ה"מפתח והטמפו" שאתם כותבים מחדש בכל שאלה?`,
    sources: [
      "John Cage, 4′33″, בכורה: דייוויד טיודור (David Tudor), וודסטוק, ניו יורק, 1952.",
      "John Cage, \"Lecture on Nothing\", Silence: Lectures and Writings, Wesleyan University Press, 1961.",
      "התזמורת האנדלוסית הישראלית, אשדוד.",
      "שיעורים 01, 09 ו-21 בקורס הזה.",
    ],
    inspiration: "ג'ון קייג', 1952",
  },
  {
    id: "nature", kind: "ציר זמן", kicker: "ציר זמן · טבע ומבנה", title: "לשאול את הטבע.",
    deck: "**170** שנה של אדריכלים ששאלו עלה, סבון וטרמיט איך לבנות. היום שואלים מכונה, ואותה שאלה עובדת.",
    layout: "timeline", layoutName: "ציר זמן: חמש תחנות מ-1851 עד היום", Hero: FogStand,
    caption: "מהחיפושית לביתן: עיקרון של איסוף טיפות, מתורגם לגג הצללה על חולות החוף. רעיון לתרגיל, לא פרויקט קיים. איור בקוד.",
    body: [
      "אדריכלים שואלים את הטבע כבר מאה ושבעים שנה. לא איך הוא **נראה**, אלא איך הוא **פותר**: איך עלה נושא משקל, איך קרום סבון מוצא את השטח הקטן ביותר, איך תלולית מתקררת בלי מזגן.",
    ],
    timeline: [
      { year: "1851", title: "ארמון הבדולח, לונדון", text: "**ג'וזף פקסטון** ~~Joseph Paxton~~ בנה חממה לשושנת המים **ויקטוריה אמזוניקה** ~~Victoria amazonica~~, ולמד מצלעות העלה הענק איך לשאת גג קל. מאותו עיקרון צמח **ארמון הבדולח** ~~Crystal Palace~~.", lesson: 4 },
      { year: "1972", title: "הפארק האולימפי, מינכן", text: "**פריי אוטו** ~~Frei Otto~~ חקר קרומי סבון ורשתות, ותכנן עם משרד **בניש** ~~Behnisch~~ את גג הרשת של הפארק האולימפי ב**מינכן** ~~Munich~~.", lesson: 6 },
      { year: "1996", title: "איסטגייט, הרארה", text: "**מיק פירס** ~~Mick Pearce~~ תכנן ב**הרארה** ~~Harare~~ בניין משרדים שמתקרר באוורור טבעי, בהשראת תלוליות טרמיטים.", lesson: 20 },
      { year: "1997", title: "למילה יש שם", text: "**ג'נין בניוס** ~~Janine Benyus~~ פרסמה את **ביומימיקרי** ~~Biomimicry~~, והציעה לראות בטבע מודל, קנה מידה ומורה." },
      { year: "היום", title: "פרומפט ביומימטי", text: "במקום \"תכנן הצללה\", שואלים: \"איך אורגניזם בחולות חוף פותר חום, מלח ומחסור במים? חלץ את העיקרון, ותרגם אותו למבנה.\"", lesson: 7 },
    ],
    quote: {
      tr: "\"הטבע כמודל. הטבע כקנה מידה. הטבע כמורה.\"",
      orig: "\"Nature as model. Nature as measure. Nature as mentor.\"",
      origDir: "ltr", cite: "ג'נין בניוס, Biomimicry: Innovation Inspired by Nature, William Morrow, 1997",
    },
    after: [
      "**דוגמה מהעיר:** טיילת על חולות החוף ב**אשדוד** ~~Ashdod~~ צריכה צל, ומתמודדת עם שמש, מלח ורוח. **חיפושית מדבר נמיב** ~~Namib Desert beetle~~ אוספת טיפות ערפל על גבשושיות בגבה. שאלה ביומימטית למודל היא: \"מה העיקרון? איך הוא נראה כגג הצללה?\" התשובה היא כיוון לבדיקה, לא פתרון מוכן.",
      "**הפרומפט בשלוש שכבות:** בהגדרות: \"הבחן בין עיקרון לצורה, וסמן מה צריך אימות מדעי\". בפרויקט: \"ביתן הצללה בטיילת חוף, אשדוד, רוח ים מלוחה\". בצ'אט: \"מפה 3 אורגניזמים שפותרים את אותה בעיה, בטבלה: אורגניזם, עיקרון, תרגום למבנה, מקור\".",
    ],
    insight: "השאלה הביומימטית: איך הטבע כבר פותר את זה?",
    haiku: ["תלולית טרמיט", "רוח עוברת בפנים", "המשרד נושם"],
    haikuNote: "מה ההייקו מאיר: הפתרון כבר קיים. צריך רק לשאול את מי שפתר.",
    links: [
      { to: 4, rule: "החומר מספר את הסיפור יותר מהצורה.", insight: "פקסטון לא העתיק עלה. הוא העתיק את מבנה הצלעות.", action: "בקשו מהמודל את העיקרון, לא את הצורה." },
      { to: 7, rule: "\"מה אם\" פותחת מה ש\"מה\" סוגרת.", insight: "\"מה אם המבנה היה נושם כמו תלולית?\" היא שאלת \"מה אם\".", action: "הוסיפו לכל שאלה תכנונית גרסה ביומימטית אחת." },
      { to: 20, rule: "המעגל החלש קובע את איכות המבנה.", insight: "במעגל הסביבתי, הטבע כבר בדק פתרונות.", action: "במעגל החלש, שאלו: איזה אורגניזם חי בתנאים האלה?" },
    ],
    post: `ב-1851 ג'וזף פקסטון למד מעלה של שושנת מים איך לשאת גג. ב-1996 מיק פירס למד מטרמיטים איך לקרר משרדים בלי מזגן.
אדריכלים שואלים את הטבע כבר 170 שנה. לא איך הוא נראה, אלא איך הוא פותר.
היום אפשר לשאול את אותה שאלה גם מודל AI: "איזה אורגניזם פותר חום, מלח ורוח? חלץ את העיקרון ותרגם אותו למבנה."
התשובה היא כיוון לבדיקה, לא פתרון מוכן.
איזו בעיה בפרויקט שלכם הטבע כבר פתר?`,
    sources: [
      "Janine M. Benyus, Biomimicry: Innovation Inspired by Nature, William Morrow, 1997.",
      "Eastgate Centre, Harare, Mick Pearce, 1996.",
      "Olympiapark München, Behnisch & Partner עם Frei Otto, 1972.",
      "Joseph Paxton, Crystal Palace, London, 1851.",
      "שיעורים 04, 06, 07 ו-20 בקורס הזה.",
    ],
    inspiration: "ג'נין בניוס, 1997",
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
      {a.layout === "infographic" && (<><Head a={a} /><figure className="ft-info" style={{ margin: 0 }}><a.Hero /></figure></>)}
      {a.layout === "qa" && (<><Head a={a} /><figure className="ft-strip" style={{ margin: 0 }}><a.Hero /></figure></>)}
      {a.layout === "timeline" && (<><Head a={a} /><figure className="ft-info" style={{ margin: 0 }}><a.Hero /></figure></>)}
      <figcaption className="ft-caption">{a.caption}</figcaption>

      {a.layout === "infographic" && (
        <div className="ft-two">{a.body.map((p, i) => <Rich key={i} as="p" className={i === 0 ? "ft-p ft-drop" : "ft-p"}>{p}</Rich>)}</div>
      )}
      <div className="ft-col">
        {a.layout !== "infographic" && a.body.map((p, i) => <Rich key={i} as="p" className={i === 0 ? "ft-p ft-drop" : "ft-p"}>{p}</Rich>)}
        {a.qa && (
          <section className="ft-qa" aria-label="שאלות ותשובות">
            {a.qa.map((x, i) => (
              <div key={i} className="ft-qa-item">
                <p className="ft-q"><span className="label">שאלה</span>{x.q}</p>
                <Rich as="p" className="ft-a">{x.a}</Rich>
              </div>
            ))}
          </section>
        )}
        {a.timeline && (
          <ol className="ft-timeline" aria-label="ציר זמן">
            {a.timeline.map((t, i) => (
              <li key={i} className="rise" style={{ ["--i" as any]: i }}>
                <span className="ft-year num">{t.year}</span>
                <div>
                  <b>{t.title}</b>
                  <Rich as="p">{t.text}</Rich>
                  {t.lesson && <a className="src" href={href("lesson", String(t.lesson))}>בקורס: שיעור {String(t.lesson).padStart(2, "0")}</a>}
                </div>
              </li>
            ))}
          </ol>
        )}
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
      <h1 className="page-title">שבע כתבות, שבע דרכים לקרוא פרומפט.</h1>
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
