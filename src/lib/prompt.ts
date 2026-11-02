import type { Lesson, Step } from "../data/course";

// פרומפט פתיחה לכל שלב: שלוש השכבות של שיעור 01 (הגדרות, פרויקט, צ'אט), מוכן להעתקה.
export const DEFAULT_SETTINGS =
  "ענה בעברית, בטון מקצועי־אדריכלי.\nפתח בשורת תובנה אחת, ואז פרט.\nכשאתה מסתמך על תקן, ציין את מספרו ואת נושאו, וסמן מה צריך אימות.";

export function stepPrompt(lesson: Lesson, step: Step) {
  return {
    settings: DEFAULT_SETTINGS,
    project: `אתה עוזר לאדריכל/ית בתרגיל "${lesson.title}".\nההקשר שלי: [סוג הפרויקט, עיר, תקנים רלוונטיים, מי הלקוח].`,
    chat: `${step.desc}\nפורמט הפלט: ${step.deliverable}\nלפני שאתה עונה, שאל אותי עד 2 שאלות הבהרה אם חסר לך מידע.`,
  };
}

export const assemble = (p: { settings: string; project: string; chat: string }) =>
  [
    p.settings.trim() && `[הגדרות]\n${p.settings.trim()}`,
    p.project.trim() && `[פרויקט]\n${p.project.trim()}`,
    p.chat.trim() && `[צ'אט]\n${p.chat.trim()}`,
  ].filter(Boolean).join("\n\n");
