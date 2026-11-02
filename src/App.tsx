import { useEffect, useState } from "react";
import TopBar from "./components/TopBar";
import Home from "./pages/Home";
import Lessons from "./pages/Lessons";
import Lesson from "./pages/Lesson";
import Studio from "./pages/Studio";
import Portfolio from "./pages/Portfolio";
import Feature from "./pages/Feature";
import { useRoute } from "./lib/route";
import { exportAll, importAll, save, PROGRESS_KEY } from "./lib/store";

const TITLES: Record<string, string> = { home: "הבית", lessons: "שיעורים", lesson: "שיעור", studio: "סטודיו פרומפטים", portfolio: "תיק עבודות", feature: "כתבה" };

export default function App() {
  const route = useRoute();
  const [q, setQState] = useState(() => { try { return sessionStorage.getItem("hps:q") || ""; } catch { return ""; } });
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState("");
  const setQ = (v: string) => { setQState(v); try { sessionStorage.setItem("hps:q", v); } catch { /* חסום */ } };
  const toast = (s: string) => { setMsg(s); window.setTimeout(() => setMsg(""), 2200); };

  useEffect(() => { document.title = `${TITLES[route.page] || "הבית"} · הנדסת פרומפטים`; }, [route.page]);

  // פעולות העריכה והמערכת נכנסות לכפתור הלוגו, לא לסרגל
  useEffect(() => {
    const menu = document.querySelector("ai-menu") as any;
    if (!menu) return;
    menu.items = [
      { label: "מצב עריכה", pressed: editing, onSelect: () => setEditing((e) => !e) },
      { label: "ייצוא התקדמות וטיוטות", onSelect: () => {
        const blob = new Blob([JSON.stringify(exportAll(), null, 1)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = `handasat-progress-${new Date().toISOString().slice(0, 10)}.json`; a.click();
      } },
      { label: "ייבוא התקדמות מקובץ", onSelect: () => {
        const i = document.createElement("input"); i.type = "file"; i.accept = "application/json";
        i.onchange = async () => { try { importAll(JSON.parse(await i.files![0].text())); toast("ההתקדמות יובאה"); } catch { toast("הקובץ לא תקין. בחרו קובץ ייצוא של האפליקציה."); } };
        i.click();
      } },
      ...(editing ? [{ label: "איפוס ההתקדמות", onSelect: () => { if (confirm("לאפס את סימוני הביצוע בכל השיעורים?")) { save(PROGRESS_KEY, {}); toast("ההתקדמות אופסה"); } } }] : []),
    ];
    menu.status = editing ? "מצב עריכה" : "";
  }, [editing]);

  let page;
  switch (route.page) {
    case "lessons": page = <Lessons route={route} q={q} setQ={setQ} />; break;
    case "lesson": page = <Lesson key={route.id} id={route.id || "1"} editing={editing} toast={toast} />; break;
    case "studio": page = <Studio toast={toast} />; break;
    case "portfolio": page = <Portfolio route={route} editing={editing} toast={toast} />; break;
    case "feature": page = <Feature />; break;
    default: page = <Home />;
  }

  return (
    <>
      <TopBar page={route.page} q={q} setQ={setQ} />
      {page}
      <footer className="foot">
        <div className="foot-in">
          <span>הנדסת פרומפטים · קורס AI לאדריכלים · אד' ענת שטיבלמן A&I</span>
          <span>ההתקדמות, הטיוטות ותיק העבודות נשמרים במכשיר הזה בלבד.</span>
        </div>
      </footer>
      {msg && <div className="toast" role="status">{msg}</div>}
    </>
  );
}
