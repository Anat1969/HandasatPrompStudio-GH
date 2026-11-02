// כיתות של המרצה: נשמרות במכשיר (ומסתנכרנות עם קוד הסנכרון שלה), וזמינות מתוך כפתור הלוגו.
import { load, save } from "./store";

export type Cohort = { code: string; name: string; at: number };
const KEY = "teacher:cohorts";
const FIRST: Cohort = { code: "kita-bpeb7-v2snw", name: "מחזור ראשון", at: 1793592000000 };

export const cohorts = (): Cohort[] => {
  const list = load<Cohort[]>(KEY, []);
  return list.length ? list : [FIRST];
};
export const addCohort = (code: string, name: string) => {
  const list = cohorts().filter((c) => c.code !== code);
  save(KEY, [{ code, name: name.trim() || "כיתה בלי שם", at: Date.now() }, ...list]);
};
export const renameCohort = (code: string, name: string) =>
  save(KEY, cohorts().map((c) => (c.code === code ? { ...c, name } : c)));

const base = () => `${location.origin}${location.pathname}`.replace(/\/app\/index\.html$/, "/app/index.html");
export const joinLink = (code: string) => `${base()}#/sync?c=${code}`;
export const classLink = (code: string) => `${base()}#/class?c=${code}`;

// הודעה מוכנה לוואטסאפ ולצ'אט של זום
export const inviteText = (c: Cohort) => [
  `שלום לכולם,`,
  `מצטרפים לקורס "הנדסת פרומפטים" ב-3 צעדים:`,
  `1. פותחים את הקישור: ${joinLink(c.code)}`,
  `2. כותבים את השם, ולוחצים "צור קוד וסנכרן".`,
  `3. שומרים את קוד הסנכרון שמופיע. איתו ממשיכים מכל מכשיר.`,
  `מכאן ההתקדמות שלכם נשמרת, ואני רואה איפה צריך עזרה.`,
  `כיתה: ${c.name}`,
].join("\n");

export const whatsapp = (c: Cohort) => `https://wa.me/?text=${encodeURIComponent(inviteText(c))}`;
