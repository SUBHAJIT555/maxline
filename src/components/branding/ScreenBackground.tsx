"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { ASSETS } from "@/lib/assets";

type Props = {
  children: ReactNode;
  /** Extra overlay darkness (0–1) */
  dim?: number;
};

export function ScreenBackground({ children, dim = 0.45 }: Props) {
  return (
    <div className="relative h-full w-full text-white">
      <Image
        src={ASSETS.bgPort}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="1080px"
      />
      <div
        className="absolute inset-0 bg-[#001B3D]"
        style={{ opacity: dim }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,10,30,0.55)_100%)]"
        aria-hidden
      />
      <div className="relative z-10 flex h-full w-full flex-col">{children}</div>
    </div>
  );
}
