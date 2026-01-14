"use client";

import Link from "next/link";
import * as React from "react";

type CommonProps = {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: React.ReactNode;
};

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition " +
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 disabled:opacity-60 disabled:pointer-events-none";

const variants: Record<NonNullable<CommonProps["variant"]>, string> = {
  primary:
    "bg-[#0b2a4a] text-white ring-1 ring-cyan-300/20 hover:bg-[#0e355f] shadow-[0_10px_40px_rgba(2,132,199,0.12)]",
  secondary:
    "bg-white/6 text-white ring-1 ring-white/12 hover:bg-white/10 hover:ring-white/18",
  ghost: "bg-transparent text-white/85 hover:bg-white/10",
};

export function Button(
  props:
    | (CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>)
    | (CommonProps & { href: string; target?: string; rel?: string })
) {
  if ("href" in props) {
    const { href, className, children, variant = "secondary", ...rest } = props;
    return (
      <Link
        href={href}
        className={cn(base, variants[variant], className)}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const { className, children, variant = "secondary", ...rest } = props;
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}


