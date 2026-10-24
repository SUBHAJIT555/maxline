"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type Variant = "orange" | "blue";

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

const styles: Record<Variant, string> = {
  orange:
    "bg-[linear-gradient(180deg,#FF8A2B_0%,#FF6B00_55%,#E85A00_100%)] shadow-[0_0_28px_rgba(255,107,0,0.55)]",
  blue: "bg-[linear-gradient(180deg,#3BA7FF_0%,#1E7FE0_55%,#0B5FBF_100%)] shadow-[0_0_28px_rgba(59,167,255,0.55)]",
};

export function GlowButton({
  children,
  variant = "orange",
  className = "",
  disabled,
  type = "button",
  onClick,
}: Props) {
  return (
    <motion.button
      type={type}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-14 w-full max-w-md items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold tracking-wide text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
      <span aria-hidden className="tracking-tighter opacity-90">
        ≫
      </span>
    </motion.button>
  );
}
