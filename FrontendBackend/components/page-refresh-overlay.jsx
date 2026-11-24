"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const dashboardRoutes = ["/inventory", "/admin", "/employee", "/dashboard", "/workspace"];

function isDashboardRoute(pathname) {
  return dashboardRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function getPageLoadingLabel(pathname) {
  if (isDashboardRoute(pathname)) return "Loading dashboard";
  if (pathname === "/login") return "Loading login";
  return "Loading page";
}

export function PageLoadingIndicator({ label = "Loading page" }) {
  return (
    <div className="page-refresh-overlay" role="status" aria-live="polite" aria-atomic="true">
      <div className="page-refresh-glass-card">
        <span className="page-refresh-spinner" aria-hidden="true" />
        <small>{label}</small>
      </div>
    </div>
  );
}

export default function PageRefreshOverlay() {
  const pathname = usePathname() || "";
  const dashboardRoute = isDashboardRoute(pathname);
  const [visible, setVisible] = useState(true);
  const [label, setLabel] = useState("Loading page");

  useEffect(() => {
    const currentPathname = window.location.pathname;
    setLabel(getPageLoadingLabel(currentPathname));

    if (isDashboardRoute(currentPathname)) {
      setVisible(false);
      return;
    }

    let hideTimer;
    const fallbackTimer = window.setTimeout(() => setVisible(false), 4000);
    const hideAfterLoad = () => {
      hideTimer = window.setTimeout(() => setVisible(false), 450);
    };

    if (document.readyState === "complete") {
      hideAfterLoad();
    } else {
      window.addEventListener("load", hideAfterLoad, { once: true });
    }

    return () => {
      window.clearTimeout(hideTimer);
      window.clearTimeout(fallbackTimer);
      window.removeEventListener("load", hideAfterLoad);
    };
  }, []);

  return visible && !dashboardRoute ? <PageLoadingIndicator label={label} /> : null;
}
