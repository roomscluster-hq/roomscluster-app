"use client";

import { useEffect, useState } from "react";

// Mirrors Tailwind's `md` breakpoint, which is what the room UI uses to
// switch between the desktop sidebar and the mobile bottom sheet.
const DESKTOP_QUERY = "(min-width: 768px)";

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsMobile(!mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
