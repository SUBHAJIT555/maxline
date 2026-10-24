"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { GameTitle } from "@/components/branding/GameTitle";
import { ScreenBackground } from "@/components/branding/ScreenBackground";
import { FormField } from "@/components/ui/FormField";
import { GlowButton } from "@/components/ui/GlowButton";
import { KioskFrame } from "@/components/ui/KioskFrame";
import { KioskKeyboard } from "@/components/ui/KioskKeyboard";
import { unlockSfx } from "@/lib/sfx";
import { useGameStore } from "@/store/game-store";

type Field = "name" | "email" | "phone";

const LIMITS: Record<Field, number> = {
  name: 32,
  email: 48,
  phone: 18,
};

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 7 9-7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L16 12l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const setParticipant = useGameStore((s) => s.setParticipant);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [active, setActive] = useState<Field | null>(null);

  const values: Record<Field, string> = { name, email, phone };
  const setters = {
    name: setName,
    email: setEmail,
    phone: setPhone,
  } as const;

  function startGame() {
    if (!name.trim() || !phone.trim()) return;
    unlockSfx();
    setParticipant({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
    });
    router.push("/play");
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    startGame();
  }

  function typeChar(char: string) {
    if (!active) return;
    const field = active;
    if (field === "phone" && !/^[0-9+]$/.test(char)) return;
    setters[field]((prev) => (prev + char).slice(0, LIMITS[field]));
  }

  function backspace() {
    if (!active) return;
    const field = active;
    setters[field]((prev) => prev.slice(0, -1));
  }

  function typeSpace() {
    if (!active) return;
    const field = active;
    setters[field]((prev) => {
      if (!prev || prev.endsWith(" ")) return prev;
      return (prev + " ").slice(0, LIMITS[field]);
    });
  }

  function focusNext() {
    if (active === "name") setActive("email");
    else if (active === "email") setActive("phone");
    else setActive(null);
  }

  const ready = Boolean(name.trim() && phone.trim());
  const keyboardOpen = active !== null;

  return (
    <KioskFrame>
      <ScreenBackground>
        <div className="relative flex h-full min-h-0 flex-col items-center overflow-hidden px-[7%] pt-[3.5%]">
          <GameTitle size="hero" subtitle="Ready for the Logistics Challenge?" />

          <form
            onSubmit={onSubmit}
            className="mt-10 flex w-full shrink-0 flex-col items-center gap-9"
          >
            <FormField
              icon={<PersonIcon />}
              label="Name"
              value={name}
              active={active === "name"}
              readOnly
              inputMode="none"
              autoComplete="off"
              required
              onFocus={() => setActive("name")}
              onClick={() => setActive("name")}
            />
            <FormField
              icon={<MailIcon />}
              label="Email (optional)"
              value={email}
              active={active === "email"}
              readOnly
              inputMode="none"
              autoComplete="off"
              onFocus={() => setActive("email")}
              onClick={() => setActive("email")}
            />
            <FormField
              icon={<PhoneIcon />}
              label="Phone No."
              value={phone}
              active={active === "phone"}
              readOnly
              inputMode="none"
              autoComplete="off"
              required
              onFocus={() => setActive("phone")}
              onClick={() => setActive("phone")}
            />

            <GlowButton
              type="submit"
              disabled={!ready}
              className={`relative z-30 mt-2 ${keyboardOpen ? "-translate-y-1" : ""}`}
              onClick={startGame}
            >
              Start Challenge
            </GlowButton>

            {!keyboardOpen ? (
              <button
                type="button"
                onClick={() => router.push("/leaderboard")}
                className="inline-flex min-h-12 w-full max-w-md items-center justify-center rounded-2xl border border-[var(--color-max-cyan)]/70 bg-white/5 text-base font-bold tracking-wide text-[var(--color-max-cyan)]"
              >
                View Leaderboard
              </button>
            ) : null}
          </form>

          {keyboardOpen ? (
            <div className="absolute inset-x-[4%] bottom-[2.5%] z-20">
              <KioskKeyboard
                key={active}
                mode={
                  active === "phone"
                    ? "phone"
                    : active === "email"
                      ? "email"
                      : "text"
                }
                value={active ? values[active] : ""}
                onType={typeChar}
                onBackspace={backspace}
                onSpace={typeSpace}
                onDone={focusNext}
              />
            </div>
          ) : null}
        </div>
      </ScreenBackground>
    </KioskFrame>
  );
}
