// בורר אחיד: "הכול" מאפס, כל לחיצה מחליפה, "+" מוסיף ו"−" מסיר. לחיצה על הבחירה היחידה מחזירה ל"הכול".
export type Opt = { id: string; label: string; color?: string; count?: number };

export default function Chips({ options, value, onChange, label }: { options: Opt[]; value: string[]; onChange: (v: string[]) => void; label: string }) {
  const all = value.length === 0;
  const pick = (id: string) => {
    if (value.length === 1 && value[0] === id) onChange([]);
    else onChange([id]);
  };
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  return (
    <div className="chips" role="group" aria-label={label}>
      <button className="chip-t" aria-pressed={all} onClick={() => onChange([])}>הכול</button>
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <span className="chip-g" key={o.id}>
            <button className="chip-t" aria-pressed={on} onClick={() => pick(o.id)}>
              {o.color && <i className="chip-dot" style={{ background: o.color }} />}
              {o.label}
              {o.count != null && <span className="num" style={{ fontSize: 12, fontWeight: 500 }}>{o.count}</span>}
            </button>
            {!all && (
              <button className="chip-add" aria-label={on ? `הסר ${o.label}` : `הוסף ${o.label}`} title={on ? "הסר מהבחירה" : "הוסף לבחירה"} onClick={() => toggle(o.id)}>
                {on ? "−" : "+"}
              </button>
            )}
          </span>
        );
      })}
    </div>
  );
}
