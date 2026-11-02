// סט אייקוני קו אחד: קו 1.75, 24×24, בצבע הטקסט. רק לתפעול, לא לקישוט.
const P = (d: string) => (props: any) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true" {...props}>
    <path d={d} />
  </svg>
);
export const IconX = P("M6 6l12 12M18 6L6 18");
export const IconNext = P("M15 5l-7 7 7 7"); // בעברית "הבא" הוא שמאלה
export const IconPrev = P("M9 5l7 7-7 7");
export const IconSearch = P("M10.5 17a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM15.5 15.5L20 20");
export const IconCopy = P("M8 8h11v11H8zM5 16V5h11");
export const IconPlay = P("M8 5l11 7-11 7z");
export const IconPrint = P("M7 9V4h10v5M7 17H4v-7h16v7h-3M7 14h10v6H7z");
