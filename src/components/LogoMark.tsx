"use client";

import * as React from "react";

/* eslint-disable @next/next/no-img-element */

export function LogoMark({
  src = "/logo.png",
  alt,
  size = 52,
}: {
  src?: string;
  alt: string;
  size?: number;
}) {
  // Always show a visible placeholder first, then swap to the real logo if available.
  const [resolvedSrc, setResolvedSrc] = React.useState<string>("/logo.png");
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setResolvedSrc("/logo.png");

    const img = new window.Image();
    img.onload = () => {
      if (!cancelled) setResolvedSrc(src);
    };
    img.onerror = () => {
      if (!cancelled) {
        // keep placeholder
        setResolvedSrc("/logo.png");
      }
    };
    img.src = src;

    return () => {
      cancelled = true;
    };
  }, [src]);

  return (
    <>
      {failed ? (
        <div
          className="grid place-items-center text-xs font-extrabold tracking-wide text-white/80"
          style={{ width: size, height: size }}
        >
          FS
        </div>
      ) : (
        <img
          src={resolvedSrc}
          alt={alt}
          style={{ width: size, height: size }}
          className="object-contain"
          onError={() => setFailed(true)}
        />
      )}
    </>
  );
}


