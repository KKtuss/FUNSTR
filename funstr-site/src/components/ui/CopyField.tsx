"use client";

import * as React from "react";

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function compactMiddle(value: string) {
  const v = value ?? "";
  if (v.length <= 18) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

export function CopyField({
  label,
  value,
  monospace = true,
}: {
  label: string;
  value: string;
  monospace?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);
  const compact = React.useMemo(() => compactMiddle(value), [value]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  }

  return (
    <div className="w-full">
      <div className="mb-2 text-xs font-semibold tracking-wide text-white/60 sm:text-sm">
        {label}
      </div>
      <div className="flex min-w-0 items-center gap-2 overflow-hidden rounded-2xl bg-white/5 p-2 ring-1 ring-white/10 sm:gap-3 sm:p-3">
        <div
          className={cn(
            "min-w-0 flex-1 truncate px-3 py-2 text-sm text-white/90 sm:px-4 sm:py-3 sm:text-base",
            monospace && "font-mono text-[13px] sm:text-[14px]"
          )}
          title={value}
        >
          <span className="block sm:hidden">{compact}</span>
          <span className="hidden sm:block">{value}</span>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 ring-1 ring-white/10 sm:px-4 sm:py-3 sm:text-sm"
          aria-label="Copy to clipboard"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}


