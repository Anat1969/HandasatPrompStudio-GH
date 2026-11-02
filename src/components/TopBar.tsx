import { useEffect, useMemo, useRef, useState } from "react";
import { LESSONS } from "../data/course";
import { href, go } from "../lib/route";
import { matches, highlight } from "../lib/search";
import { IconSearch, IconX } from "./Icons";

const TABS = [
  ["home", "הבית"],
  ["lessons", "שיעורים"],
  ["studio", "סטודיו פרומפטים"],
  ["portfolio", "תיק עבודות"],
  ["feature", "כתבה"],
] as const;

type Hit = { cat: string; lesson: number; title: string; sub: string };
const CATS = ["שיעורים", "שלבים", "שאלות"];

export function Hl({ text, q }: { text: string; q: string }) {
  return <>{highlight(text, q).map(([t, on], i) => (on ? <mark className="hit" key={i}>{t}</mark> : <span key={i}>{t}</span>))}</>;
}

export function searchAll(q: string): Hit[] {
  if (!q.trim()) return [];
  const out: Hit[] = [];
  for (const l of LESSONS) {
    const head = `${l.title} ${l.kicker} ${l.insight} ${l.lead} ${l.summary} ${l.tags.join(" ")}`;
    if (matches(head, q)) out.push({ cat: "שיעורים", lesson: l.id, title: `${l.code} · ${l.title}`, sub: l.insight });
    l.steps.forEach((s) => {
      if (matches(`${s.title} ${s.desc} ${s.deliverable}`, q)) out.push({ cat: "שלבים", lesson: l.id, title: `${s.title}`, sub: `שיעור ${l.code} · ${s.desc}` });
    });
    l.faq.forEach((f) => {
      if (matches(`${f.question} ${f.answer}`, q)) out.push({ cat: "שאלות", lesson: l.id, title: f.question, sub: `שיעור ${l.code} · ${f.answer}` });
    });
  }
  return out;
}

export default function TopBar({ page, q, setQ }: { page: string; q: string; setQ: (q: string) => void }) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<string | null>(null);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => searchAll(q), [q]);
  const shown = cat ? hits.filter((h) => h.cat === cat) : hits;

  useEffect(() => {
    const on = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", on);
    return () => document.removeEventListener("pointerdown", on);
  }, []);
  useEffect(() => { setOpen(false); }, [page]);

  const pickHit = (h: Hit) => { setOpen(false); go("lesson", String(h.lesson)); };

  return (
    <header className="topbar">
      <div className="topbar-in">
        <a className="brand" href={href("home")} aria-label="הנדסת פרומפטים: לדף הבית">
          <img src="./icon.svg" alt="" width={30} height={30} />
          <span>הנדסת פרומפטים<small>BLUEPRINT.AI · לאדריכלים</small></span>
        </a>
        <nav className="tabs" aria-label="ניווט ראשי">
          {TABS.map(([id, label]) => (
            <a key={id} className="tab" href={href(id)} aria-current={page === id || (id === "lessons" && page === "lesson") ? "page" : undefined}>{label}</a>
          ))}
        </nav>
        <div className="search" ref={box}>
          <IconSearch className="s-ico" />
          <input
            ref={input}
            className="field"
            type="search"
            aria-label="חיפוש בקורס"
            placeholder="חיפוש: שיעור, שלב, שאלה"
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); setCat(null); }}
            onFocus={(e) => { e.target.select(); if (q) setOpen(true); }}
            onKeyDown={(e) => {
              if (e.key === "Escape") { setQ(""); setOpen(false); }
              if (e.key === "Enter") { setOpen(false); go("lessons", undefined, { q }); }
            }}
          />
          {q && <button className="s-x" aria-label="ניקוי חיפוש" title="ניקוי (Esc)" onClick={() => { setQ(""); setOpen(false); input.current?.focus(); }}><IconX /></button>}
          {open && q.trim() && (
            <div className="s-panel" role="listbox" aria-label="תוצאות חיפוש">
              <div className="s-counts">
                <button className="chip-t" aria-pressed={!cat} onClick={() => setCat(null)}>הכול <span className="num">{hits.length}</span></button>
                {CATS.map((c) => {
                  const n = hits.filter((h) => h.cat === c).length;
                  return <button key={c} className="chip-t" aria-pressed={cat === c} disabled={!n} onClick={() => setCat(cat === c ? null : c)}>{c} <span className="num">{n}</span></button>;
                })}
              </div>
              {shown.length === 0 && <div className="s-empty">לא נמצאה התאמה ל"{q}". נסו מילה אחרת, למשל <b>תקן</b>, <b>רחוב</b> או <b>NotebookLM</b>.</div>}
              {shown.slice(0, 40).map((h, i) => (
                <button key={i} className="s-item" onClick={() => pickHit(h)}>
                  <Hl text={h.title} q={q} />
                  <small>{h.cat} · <Hl text={h.sub.length > 110 ? h.sub.slice(0, 110) + "…" : h.sub} q={q} /></small>
                </button>
              ))}
            </div>
          )}
        </div>
        <ai-menu chat="https://claude.ai/code/session_018qeN1BJ8BJrmR9kGiyKZyU"></ai-menu>
      </div>
    </header>
  );
}
