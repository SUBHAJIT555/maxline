"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ASSETS } from "@/lib/assets";

type Props = {
  subtitle?: string;
  className?: string;
  /** compact = play / tight screens so the board fits */
  size?: "default" | "compact";
};

export function GameTitle({
  subtitle,
  className = "",
  size = "default",
}: Props) {
  const compact = size === "compact";

  return (
    <div className={`shrink-0 text-center ${className}`}>
      <div
        className={`mx-auto ${
          compact ? "mb-0.5 w-[min(38%,220px)]" : "mb-1.5 w-[min(42%,280px)]"
        }`}
      >
        <Image
          src={ASSETS.brandLogo}
          alt="Maxline Global"
          width={1920}
          height={600}
          priority
          unoptimized
          className="h-auto w-full"
        />
      </div>
      <motion.div
        className={`mx-auto ${
          compact ? "w-[min(68%,420px)]" : "w-[min(78%,520px)]"
        }`}
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
      >
        <Image
          src={ASSETS.logoCargoRush}
          alt="Cargo Rush"
          width={1200}
          height={420}
          priority
          className="h-auto w-full mix-blend-screen drop-shadow-[0_0_18px_rgba(80,170,255,0.35)]"
        />
      </motion.div>
      {subtitle ? (
        <p
          className={`font-semibold text-white ${
            compact
              ? "mt-1 text-[clamp(0.8rem,2.2vw,1rem)]"
              : "mt-1.5 text-[clamp(0.9rem,2.6vw,1.15rem)]"
          }`}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
