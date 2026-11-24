"use client";

import { useEffect, useState } from "react";

function getPageLoadingLabel(pathname) {
  if (["/inventory", "/admin", "/employee", "/dashboard", "/workspace"].some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return "Loading dashboard";
  }

  if (pathname === "/login") return "Loading login";
  return "Loading page";
}

export function PageLoadingIndicator({ label = "Loading page" }) {
  return (
    <div className="page-refresh-overlay" role="status" aria-live="polite" aria-atomic="true">
      <span className="page-refresh-spinner" aria-hidden="true" />
      <small>{label}</small>
    </div>
  );
}

export default function PageRefreshOverlay() {
  const [visible, setVisible] = useState(true);
  const [label, setLabel] = useState("Loading page");

  useEffect(() => {
    setLabel(getPageLoadingLabel(window.location.pathname));

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

  return visible ? <PageLoadingIndicator label={label} /> : null;
}
