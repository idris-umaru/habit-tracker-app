"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    }).catch(() => {
      // Ignore registration failures so the app remains usable without PWA support.
    });
  }, []);

  return null;
}
