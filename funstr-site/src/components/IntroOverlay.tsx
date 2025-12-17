"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function IntroOverlay() {
  const pathname = usePathname();

  // Start visible so blur + logo are present immediately on first paint.
  const [visible, setVisible] = React.useState(true);
  const [buttonIn, setButtonIn] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);

  const onEnter = React.useCallback(() => {
    const key = "funstr_intro_done";
    sessionStorage.setItem(key, "1");

    // Trigger slide-up animation.
    setExiting(true);

    // Release scroll after the slide animation ends.
    window.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 750);
  }, []);

  // Show once per session, but never on /parked.
  React.useEffect(() => {
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
    setButtonIn(false);

    // Lock scroll while visible.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = window.setTimeout(() => setButtonIn(true), 650);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnter();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onEnter, pathname]);

  if (!visible) return null;

  return (
    <div
      className={[
        "fixed inset-0 z-[100] flex items-center justify-center",
        "bg-[#020313]/35 backdrop-blur-sm",
        "transform-gpu will-change-transform",
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
            className="w-[900px] max-w-[92vw] object-contain"
          />

          <button
            type="button"
            onClick={onEnter}
            className={[
              "mt-10 rounded-full px-10 py-5 text-lg font-extrabold tracking-wide",
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
