// תיק העבודות נשמר במכשיר (IndexedDB), כי תמונות גדולות מדי ל-localStorage.
export type Work = { id: string; student: string; lesson: number; desc: string; img: string; at: number };
const DB = "hps-portfolio", STORE = "works";
const open = () => new Promise<IDBDatabase>((res, rej) => {
  const r = indexedDB.open(DB, 1);
  r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});
const tx = async (mode: IDBTransactionMode) => (await open()).transaction(STORE, mode).objectStore(STORE);
const wrap = <T,>(req: IDBRequest<T>) => new Promise<T>((res, rej) => { req.onsuccess = () => res(req.result); req.onerror = () => rej(req.error); });
export const allWorks = async () => (await wrap((await tx("readonly")).getAll())) as Work[];
export const putWork = async (w: Work) => wrap((await tx("readwrite")).put(w));
export const delWork = async (id: string) => wrap((await tx("readwrite")).delete(id));

// דחיסה: עד 1400 פיקסל, JPEG 0.82. שומר על הפרופורציה, לא חותך.
export function compress(file: Blob, max = 1400): Promise<string> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext("2d")!;
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height);
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("הקובץ אינו תמונה")); };
    img.src = url;
  });
}
