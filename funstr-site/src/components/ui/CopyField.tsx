"use client";

import * as React from "react";

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
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
      <div className="mb-2 text-xs font-semibold tracking-wide text-white/60">
        {label}
      </div>
      <div className="flex items-center gap-2 rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
        <div
          className={cn(
            "min-w-0 flex-1 truncate px-3 py-2 text-sm text-white/90",
            monospace && "font-mono text-[13px]"
          )}
          title={value}
        >
          {value}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 ring-1 ring-white/10"
          aria-label="Copy to clipboard"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
    </div>
  );
}


