import raw from "./course.json";

export type Step = { num: string; title: string; desc: string; deliverable: string };
export type Lesson = {
  id: number; code: string; kicker: string; title: string; lead: string; insight: string; summary: string;
  minutes: number; tags: string[]; track: string; steps: Step[]; example: string;
  faq: { question: string; answer: string }[]; deck: boolean;
};
export type Track = { id: string; name: string; q: string; lead: string; lessons: number[] };

export const TRACKS: Track[] = raw.tracks;
export const LESSONS: Lesson[] = raw.lessons as Lesson[];
export const byId = (id: number | string) => LESSONS.find((l) => String(l.id) === String(id));
export const trackOf = (id: string) => TRACKS.find((t) => t.id === id)!;
export const trackColor = (id: string) => `var(--t-${id})`;
export const TRACK_HEX: Record<string, string> = {
  base: "#16365F", research: "#2E7D7A", urban: "#B5652B", tools: "#5B4AA6", identity: "#A87B1F",
};
export const TOTAL_STEPS = LESSONS.reduce((s, l) => s + l.steps.length, 0);
export const TOTAL_MIN = LESSONS.reduce((s, l) => s + l.minutes, 0);

// סדר הקורס: לפי מספר השיעור המקורי
export const ORDER = [...LESSONS].sort((a, b) => a.id - b.id);
