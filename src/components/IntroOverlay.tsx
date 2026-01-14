"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export function IntroOverlay() {
  const pathname = usePathname();

  // Start visible so blur + logo are present immediately on first paint.
  const [visible, setVisible] = React.useState(true);
  const [logoIn, setLogoIn] = React.useState(false);
  const [buttonIn, setButtonIn] = React.useState(false);
  const [exiting, setExiting] = React.useState(false);
  const didInit = React.useRef(false);

  const onEnter = React.useCallback(() => {
    // Trigger slide-up animation.
    setExiting(true);

    // Release scroll after the slide animation ends.
    window.setTimeout(() => {
      setVisible(false);
      document.body.style.overflow = "";
    }, 750);
  }, []);

  // Show on every full page load/refresh, but never on /parked.
  React.useEffect(() => {
    if (pathname?.startsWith("/parked")) {
      setVisible(false);
      document.body.style.overflow = "";
      return;
    }

    // Don't re-show on client-side navigation; only on refresh (component remount).
    if (didInit.current) {
      return;
    }
    didInit.current = true;

    setVisible(true);
    setExiting(false);
    setLogoIn(false);
    setButtonIn(false);

    // Lock scroll while visible.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Animate logo in first, then show the button.
    const t0 = window.setTimeout(() => setLogoIn(true), 90);
    const t1 = window.setTimeout(() => setButtonIn(true), 650);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        onEnter();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.clearTimeout(t0);
      window.clearTimeout(t1);
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
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-full max-w-[420px] sm:max-w-[900px]">
            <div
              aria-hidden="true"
              className={[
                "pointer-events-none absolute inset-0 -z-10",
                "scale-110 rounded-[56px] blur-3xl",
                "bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.22),rgba(99,102,241,0.12),transparent_70%)]",
                "transition-opacity duration-700 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
                logoIn ? "opacity-100" : "opacity-0",
              ].join(" ")}
            />

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="FUNSTRATEGY"
              className={[
                "w-full object-contain",
                "transform-gpu will-change-transform",
                "transition-all duration-700 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
                "drop-shadow-[0_0_18px_rgba(34,211,238,0.18)]",
                logoIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
              ].join(" ")}
            />
          </div>

          <button
            type="button"
            onClick={onEnter}
            className={[
              "mt-8 rounded-full px-7 py-4 text-base font-extrabold tracking-wide sm:mt-10 sm:px-10 sm:py-5 sm:text-lg",
              "bg-transparent text-white hover:bg-white/5",
              "transition-all duration-500",
              buttonIn
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-2 pointer-events-none",
            ].join(" ")}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
