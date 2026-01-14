"use client";

import * as React from "react";

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older/locked-down contexts
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "true");
      el.style.position = "fixed";
      el.style.left = "-9999px";
      el.style.top = "0";
      document.body.appendChild(el);
      el.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(el);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyOnClickText({
  text,
  className,
  copiedLabel = "Copied",
}: {
  text: string;
  className?: string;
  copiedLabel?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  return (
    <span
      role="button"
      tabIndex={0}
      title="Click to copy"
      className={className}
      onClick={() => {
        void (async () => {
          const ok = await copyToClipboard(text);
          if (!ok) return;
          setCopied(true);
          window.setTimeout(() => setCopied(false), 900);
        })();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          void (async () => {
            const ok = await copyToClipboard(text);
            if (!ok) return;
            setCopied(true);
            window.setTimeout(() => setCopied(false), 900);
          })();
        }
      }}
    >
      {copied ? copiedLabel : text}
    </span>
  );
}


