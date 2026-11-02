import { useEffect, useState } from "react";

// ניתוב hash: הכתובת נושאת את הדף ואת הבחירות, כך שהעתקת קישור שומרת את המצב.
export type Route = { page: string; id?: string; params: Record<string, string> };
const parse = (): Route => {
  const [path, query = ""] = window.location.hash.replace(/^#\/?/, "").split("?");
  const [page, id] = (path || "home").split("/");
  return { page: page || "home", id, params: Object.fromEntries(new URLSearchParams(query)) };
};

export function useRoute() {
  const [route, setRoute] = useState(parse);
  useEffect(() => {
    const on = () => {
      const next = parse();
      setRoute((prev) => {
        if (prev.page !== next.page || prev.id !== next.id) window.scrollTo({ top: 0 });
        return next;
      });
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  return route;
}

export const href = (page: string, id?: string, params?: Record<string, string>) => {
  const clean = params ? Object.fromEntries(Object.entries(params).filter(([, v]) => v)) : null;
  const q = clean && Object.keys(clean).length ? "?" + new URLSearchParams(clean).toString() : "";
  if (page === "home" && !q) return "#/";
  return `#/${page}${id ? "/" + id : ""}${q}`;
};

export const go = (page: string, id?: string, params?: Record<string, string>) => {
  window.location.hash = href(page, id, params);
};

// מעדכן פרמטרים בלי להוסיף רשומה להיסטוריה ובלי לגלול
export const setParams = (route: Route, params: Record<string, string>) => {
  const next = href(route.page, route.id, { ...route.params, ...params });
  history.replaceState(null, "", next);
  window.dispatchEvent(new HashChangeEvent("hashchange"));
};
