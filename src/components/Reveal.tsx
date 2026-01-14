"use client";

import * as React from "react";

function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

export function Reveal({
  children,
  className,
  delayMs = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  once?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    if (prefersReducedMotion()) {
      setInView(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) obs.disconnect();
            break;
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { root: null, threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  return (
    <div
      ref={ref}
      className={[
        "transform-gpu will-change-transform",
        "transition-all duration-700 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        className ?? "",
      ].join(" ")}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}


