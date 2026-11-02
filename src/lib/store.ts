import { useEffect, useRef, useState } from "react";

// שמירה אוטומטית ב-localStorage, עם חיווי "נשמר". עטוף ב-try כי אחסון עלול להיות חסום.
const PREFIX = "hps:";
export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}
export function save(key: string, value: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("hps-store", { detail: key }));
    return true;
  } catch {
    return false;
  }
}

export function useStored<T>(key: string, fallback: T): [T, (v: T | ((p: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(() => load(key, fallback));
  const [saved, setSaved] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => { setValue(load(key, fallback)); }, [key]); // eslint-disable-line
  useEffect(() => {
    const on = (e: Event) => { if ((e as CustomEvent).detail === key) setValue(load(key, fallback)); };
    window.addEventListener("hps-store", on);
    return () => window.removeEventListener("hps-store", on);
  }, [key]); // eslint-disable-line
  const set = (v: T | ((p: T) => T)) => {
    setValue((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      save(key, next);
      return next;
    });
    setSaved(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSaved(false), 1600);
  };
  return [value, set, saved];
}

// התקדמות: לכל שיעור מערך של 3 שלבים שבוצעו
export type Progress = Record<string, boolean[]>;
export const PROGRESS_KEY = "progress";
export const doneCount = (p: Progress, id: number) => (p[id] || []).filter(Boolean).length;

export function exportAll() {
  const out: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    if (k.startsWith(PREFIX)) out[k.slice(PREFIX.length)] = JSON.parse(localStorage.getItem(k)!);
  }
  return out;
}
export function importAll(data: Record<string, unknown>) {
  Object.entries(data).forEach(([k, v]) => save(k, v));
}
