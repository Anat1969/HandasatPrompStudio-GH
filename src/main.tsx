import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/app.css";

createRoot(document.getElementById("root")!).render(<App />);

// service worker רק כשהבסיס הוא "/" (לא בקישור raw.githack)
if ("serviceWorker" in navigator && import.meta.env.PROD && import.meta.env.BASE_URL === "/") {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
