"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Same portrait stage as Talabat Run: 9:16, centered on the kiosk screen.
 * `container-type: size` so child sizing can use cqw / cqh of this stage.
 */
export function KioskFrame({ children, className = "" }: Props) {
  return (
    <main className="flex h-dvh w-full items-center justify-center overflow-hidden bg-black">
      <section
        className={`relative overflow-hidden ${className}`}
        style={{
          containerType: "size",
          width: "min(100vw, calc(100dvh * 9 / 16))",
          height: "min(100dvh, calc(100vw * 16 / 9))",
        }}
      >
        {children}
      </section>
    </main>
  );
}
