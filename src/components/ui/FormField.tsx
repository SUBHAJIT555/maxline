"use client";

import type {
  InputHTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
  label: string;
  active?: boolean;
};

export function FormField({
  icon,
  label,
  active = false,
  className = "",
  value,
  onFocus,
  onClick,
  ...rest
}: Props) {
  const text = typeof value === "string" ? value : "";
  const empty = text.length === 0;

  return (
    <label className="block w-full max-w-md cursor-pointer">
      <span className="sr-only">{label}</span>
      <div
        className={`flex items-center gap-3 border-b pb-2 transition ${
          active
            ? "border-[var(--color-max-orange)] shadow-[0_4px_0_-2px_rgba(255,107,0,0.45)]"
            : "border-[var(--color-max-cyan)]/70"
        }`}
        onClick={onClick as MouseEventHandler<HTMLDivElement> | undefined}
      >
        <span
          className={
            active ? "text-[var(--color-max-orange)]" : "text-[var(--color-max-cyan)]"
          }
          aria-hidden
        >
          {icon}
        </span>
        <div className="relative flex min-h-[1.75rem] min-w-0 flex-1 items-center">
          <span
            className={`truncate text-base ${
              empty ? "text-white/70" : "text-white"
            } ${className}`}
          >
            {empty ? label : text}
          </span>
          {active ? (
            <span
              className="ml-0.5 inline-block h-[1.15em] w-[2px] shrink-0 self-center bg-[var(--color-max-orange)] animate-[caret-blink_1s_steps(1,end)_infinite]"
              aria-hidden
            />
          ) : null}
          <input
            className="pointer-events-none absolute inset-0 opacity-0"
            value={value}
            onFocus={onFocus}
            tabIndex={-1}
            readOnly
            {...rest}
          />
        </div>
      </div>
    </label>
  );
}
