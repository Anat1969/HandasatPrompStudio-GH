import { Fragment } from "react";

// טקסט עשיר: **מודגש**, ==תובנה== (מרקר צהוב), ומספרים מודגשים אוטומטית בכיוון LTR מבודד.
const TOKEN = /(\*\*[^*]+\*\*|==[^=]+==)/g;
const NUM = /(\d[\d,]*(?:\.\d+)?%?)/g;

function Numbers({ text }: { text: string }) {
  return <>{text.split(NUM).map((part, i) => (i % 2 ? <bdi key={i} className="num">{part}</bdi> : <Fragment key={i}>{part}</Fragment>))}</>;
}

export default function Rich({ children, as: Tag = "span", className }: { children: string; as?: any; className?: string }) {
  const parts = String(children).split(TOKEN);
  return (
    <Tag className={className}>
      {parts.map((part, i) => {
        if (part.startsWith("**")) return <strong key={i}><Numbers text={part.slice(2, -2)} /></strong>;
        if (part.startsWith("==")) return <mark key={i} className="insight"><Numbers text={part.slice(2, -2)} /></mark>;
        return <Numbers key={i} text={part} />;
      })}
    </Tag>
  );
}

// כל משפט בשורה חדשה
export function Lines({ text, className }: { text: string; className?: string }) {
  const parts = text.split(/(?<=[.?!])\s+(?=[^\s])/u).filter(Boolean);
  return <span className={`lines ${className || ""}`}>{parts.map((p, i) => <Rich key={i}>{p}</Rich>)}</span>;
}
