"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function IntroOverlay() {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const [logoIn, setLogoIn] = React.useState(false);
  const [buttonIn, setButtonIn] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Show once per session, but never on /parked.
  React.useEffect(() => {
    if (!mounted) return;
    if (pathname?.startsWith("/parked")) {
      setVisible(false);
      return;
    }

    const key = "funstr_intro_done";
    const done = sessionStorage.getItem(key) === "1";
    if (done) {
      setVisible(false);
      return;
    }

    setVisible(true);
    setExiting(false);
    setLogoIn(false);
    setButtonIn(false);

    const reduce = prefersReducedMotion();

    // Lock scroll while visible.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t1 = window.setTimeout(() => setLogoIn(true), reduce ? 0 : 120);
    const t2 = window.setTimeout(() => setButtonIn(true), reduce ? 0 : 950);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      document.body.style.overflow = prevOverflow;
    };
  }, [mounted, pathname]);

  function onEnter() {
    const key = "funstr_intro_done";
    sessionStorage.setItem(key, "1");
    setExiting(true);
    // Release scroll after the slide animation ends.
    window.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, prefersReducedMotion() ? 0 : 750);
  }

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-[#020313]/35 backdrop-blur-sm",
        "transition-transform duration-700 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
        exiting ? "-translate-y-full" : "translate-y-0",
      ].join(" ")}
      aria-label="Intro"
    >
      <div className="mx-auto w-full max-w-[1400px] px-6">
        <div className="flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="FUNSTRATEGY"
            className={[
              "w-[900px] max-w-[92vw] object-contain",
              "transition-all duration-700",
              logoIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
            ].join(" ")}
          />

          <button
            type="button"
            onClick={onEnter}
            className={[
              "mt-10 rounded-full px-8 py-4 text-base font-extrabold tracking-wide",
              "bg-white text-black hover:bg-white/90",
              "transition-all duration-500",
              buttonIn
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none",
            ].join(" ")}
          >
            Enter
          </button>

          <div
            className={[
              "mt-5 text-xs font-semibold tracking-wide text-white/55",
              "transition-opacity duration-500",
              buttonIn ? "opacity-100" : "opacity-0",
            ].join(" ")}
          >
            Press Enter to continue
          </div>
        </div>
      </div>
    </div>
  );
}


