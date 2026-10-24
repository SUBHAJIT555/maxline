"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ASSETS } from "@/lib/assets";

type Props = {
  subtitle?: string;
  className?: string;
  /** compact = play / tight screens; hero = register header impact */
  size?: "default" | "compact" | "hero";
};

const SIZE = {
  compact: {
    brand: "mb-0.5 w-[min(38%,220px)]",
    logo: "w-[min(68%,420px)]",
    subtitle: "mt-1 text-[clamp(0.8rem,2.2vw,1rem)] font-semibold text-white",
  },
  default: {
    brand: "mb-1.5 w-[min(42%,280px)]",
    logo: "w-[min(78%,520px)]",
    subtitle: "mt-1.5 text-[clamp(0.9rem,2.6vw,1.15rem)] font-semibold text-white",
  },
  hero: {
    brand: "mb-0 w-[min(44%,300px)]",
    logo: "w-[min(92%,640px)]",
    subtitle:
      "-mt-3 text-[clamp(1rem,2.8vw,1.35rem)] font-semibold tracking-[0.04em] text-white glow-cyan",
  },
} as const;

export function GameTitle({
  subtitle,
  className = "",
  size = "default",
}: Props) {
  const s = SIZE[size];
  const hero = size === "hero";

  return (
    <div className={`shrink-0 text-center ${className}`}>
      <motion.div
        className={`mx-auto ${s.brand}`}
        initial={hero ? { opacity: 0, y: -10 } : false}
        animate={hero ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.45 }}
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
      </motion.div>
      <motion.div
        className={`mx-auto ${s.logo}`}
        initial={{ opacity: 0, x: -24, scale: hero ? 0.92 : 1 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 20 }}
      >
        <Image
          src={ASSETS.logoCargoRush}
          alt="Cargo Rush"
          width={1200}
          height={420}
          priority
          className={`h-auto w-full mix-blend-screen ${
            hero
              ? "drop-shadow-[0_0_28px_rgba(59,167,255,0.55)]"
              : "drop-shadow-[0_0_18px_rgba(80,170,255,0.35)]"
          }`}
        />
      </motion.div>
      {subtitle ? (
        <motion.p
          className={s.subtitle}
          initial={hero ? { opacity: 0, y: 8 } : false}
          animate={hero ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.18, duration: 0.4 }}
        >
          {subtitle}
        </motion.p>
      ) : null}
    </div>
  );
}
