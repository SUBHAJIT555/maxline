"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const LETTER_ROWS = [
  "qwertyuiop".split(""),
  "asdfghjkl".split(""),
  "zxcvbnm".split(""),
];
const DIGIT_ROW = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const SYMBOL_ROW = ["-", "/", ":", ";", "(", ")", "₹", "&", "@", '"'];
const PUNCT_ROW = [".", ",", "?", "!", "'"];
const MORE_ROW = ["[", "]", "{", "}", "#", "%", "^", "*", "+", "="];
const MORE_ROW_NEXT = ["_", "\\", "|", "~", "<", ">", "$", "€", "£", "•"];
const PHONE_PAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["+", "0", "delete"],
];

type Board = "letters" | "numbers" | "symbols";
export type KeyboardMode = "text" | "email" | "phone";

type Props = {
  mode?: KeyboardMode;
  value?: string;
  onType: (char: string) => void;
  onBackspace: () => void;
  onSpace: () => void;
  onDone?: () => void;
  className?: string;
};

export function KioskKeyboard({
  mode = "text",
  value = "",
  onType,
  onBackspace,
  onSpace,
  onDone,
  className = "",
}: Props) {
  const [board, setBoard] = useState<Board>("letters");
  const [caps, setCaps] = useState(false);

  useEffect(() => {
    setBoard(mode === "phone" ? "numbers" : "letters");
    setCaps(false);
  }, [mode]);

  const sentenceCaps =
    mode === "text" && (value.length === 0 || value.endsWith(" "));
  const upper = caps || sentenceCaps;

  function typeLetter(letter: string) {
    onType(upper ? letter.toUpperCase() : letter);
    if (caps) setCaps(false);
  }

  const panel =
    "w-full rounded-[1.4rem] border border-[var(--color-max-cyan)]/45 bg-[#001B3D]/95 p-[2.2%] shadow-[0_0_28px_rgba(0,100,180,0.35)] backdrop-blur-md";

  if (mode === "phone") {
    return (
      <div className={`${panel} ${className}`}>
        <div className="mx-auto flex w-[78%] flex-col gap-[0.55rem]">
          {PHONE_PAD.map((row) => (
            <div key={row.join("-")} className="flex gap-[0.55rem]">
              {row.map((key) =>
                key === "delete" ? (
                  <Key
                    key={key}
                    label="delete"
                    grow={1}
                    tone="orange"
                    repeat
                    onClick={onBackspace}
                  />
                ) : (
                  <Key
                    key={key}
                    label={key}
                    grow={1}
                    onClick={() => onType(key)}
                  />
                ),
              )}
            </div>
          ))}
          <div className="flex gap-[0.55rem]">
            <Key
              label="done"
              grow={1}
              tone="orange"
              onClick={() => onDone?.()}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${panel} ${className}`}>
      <div className="flex flex-col gap-[0.55rem]">
        {board === "letters" ? (
          LETTER_ROWS.map((row, rowIndex) => (
            <div key={row.join("")} className="flex gap-[0.4rem]">
              {rowIndex === 1 ? (
                <span className="min-w-0" style={{ flex: 0.5 }} />
              ) : null}
              {rowIndex === 2 ? (
                <Key
                  label="caps"
                  grow={1.5}
                  pressed={caps}
                  tone={caps ? "orange" : "muted"}
                  onClick={() => setCaps((on) => !on)}
                />
              ) : null}
              {row.map((letter) => {
                const shown = upper ? letter.toUpperCase() : letter;
                return (
                  <Key
                    key={letter}
                    label={shown}
                    onClick={() => typeLetter(letter)}
                  />
                );
              })}
              {rowIndex === 2 ? (
                <Key
                  label="delete"
                  grow={1.5}
                  tone="orange"
                  repeat
                  onClick={onBackspace}
                />
              ) : null}
              {rowIndex === 1 ? (
                <span className="min-w-0" style={{ flex: 0.5 }} />
              ) : null}
            </div>
          ))
        ) : (
          <>
            <div className="flex gap-[0.4rem]">
              {(board === "numbers" ? DIGIT_ROW : MORE_ROW).map((symbol) => (
                <Key
                  key={symbol}
                  label={symbol}
                  onClick={() => onType(symbol)}
                />
              ))}
            </div>
            <div className="flex gap-[0.4rem]">
              {(board === "numbers" ? SYMBOL_ROW : MORE_ROW_NEXT).map(
                (symbol) => (
                  <Key
                    key={symbol}
                    label={symbol}
                    onClick={() => onType(symbol)}
                  />
                ),
              )}
            </div>
            <div className="flex gap-[0.4rem]">
              <Key
                label={board === "numbers" ? "#+=" : "123"}
                grow={1.6}
                tone="muted"
                onClick={() =>
                  setBoard(board === "numbers" ? "symbols" : "numbers")
                }
              />
              {PUNCT_ROW.map((symbol) => (
                <Key
                  key={symbol}
                  label={symbol}
                  grow={1.36}
                  onClick={() => onType(symbol)}
                />
              ))}
              <Key
                label="delete"
                grow={1.6}
                tone="orange"
                repeat
                onClick={onBackspace}
              />
            </div>
          </>
        )}

        <div className="flex gap-[0.4rem]">
          <Key
            label={board === "letters" ? "123" : "ABC"}
            grow={1.5}
            tone="muted"
            onClick={() =>
              setBoard(board === "letters" ? "numbers" : "letters")
            }
          />
          <Key label="space" grow={7} onClick={onSpace} />
          <Key
            label="return"
            grow={1.5}
            tone="orange"
            onClick={() => onDone?.()}
          />
        </div>
      </div>
    </div>
  );
}

function Key({
  label,
  onClick,
  tone = "default",
  pressed = false,
  grow = 1,
  repeat = false,
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "orange" | "muted";
  pressed?: boolean;
  grow?: number;
  repeat?: boolean;
}) {
  const actionRef = useRef(onClick);
  actionRef.current = onClick;

  const holdRef = useRef<{
    delay: ReturnType<typeof setTimeout> | null;
    interval: ReturnType<typeof setInterval> | null;
  }>({ delay: null, interval: null });

  function clearHold() {
    if (holdRef.current.delay !== null) {
      clearTimeout(holdRef.current.delay);
      holdRef.current.delay = null;
    }
    if (holdRef.current.interval !== null) {
      clearInterval(holdRef.current.interval);
      holdRef.current.interval = null;
    }
  }

  useEffect(() => () => clearHold(), []);

  function startHold(e: ReactPointerEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    clearHold();
    actionRef.current();
    e.currentTarget.setPointerCapture(e.pointerId);
    holdRef.current.delay = setTimeout(() => {
      holdRef.current.interval = setInterval(() => {
        actionRef.current();
      }, 45);
    }, 350);
  }

  const tones: Record<string, string> = {
    default:
      "bg-[linear-gradient(180deg,#1E4A72_0%,#123554_100%)] text-white border-[var(--color-max-cyan)]/40",
    orange:
      "bg-[linear-gradient(180deg,#FF8A2B_0%,#FF6B00_100%)] text-white border-orange-300/35",
    muted:
      "bg-[linear-gradient(180deg,#163A5C_0%,#0C243C_100%)] text-[var(--color-max-cyan)] border-white/15",
  };

  const aria =
    label === "delete"
      ? "Delete"
      : label === "caps"
        ? "Caps"
        : label === "space"
          ? "Space"
          : label === "return" || label === "done"
            ? "Done"
            : label === "123"
              ? "Numbers"
              : label === "ABC"
                ? "Letters"
                : label === "#+="
                  ? "More symbols"
                  : label;

  return (
    <button
      type="button"
      onClick={
        repeat
          ? undefined
          : (e) => {
              e.preventDefault();
              actionRef.current();
            }
      }
      onPointerDown={repeat ? startHold : undefined}
      onPointerUp={repeat ? () => clearHold() : undefined}
      onPointerCancel={repeat ? () => clearHold() : undefined}
      onLostPointerCapture={repeat ? () => clearHold() : undefined}
      aria-label={aria}
      aria-pressed={label === "caps" ? pressed : undefined}
      className={`flex h-[clamp(2.75rem,5cqh,3.35rem)] min-w-0 touch-none select-none items-center justify-center rounded-[0.85rem] border font-black shadow-[0_3px_0_rgba(0,0,0,0.35)] transition active:translate-y-[2px] active:shadow-none ${
        tones[tone]
      } ${
        label === "123" || label === "ABC" || label === "#+=" || label === "done"
          ? "text-[clamp(0.8rem,1.55cqh,1rem)] tracking-wide"
          : "text-[clamp(1.05rem,2cqh,1.35rem)]"
      }`}
      style={{ flex: grow }}
    >
      {label === "delete" ? (
        <DeleteIcon />
      ) : label === "caps" ? (
        <CapsIcon />
      ) : label === "return" ? (
        <ReturnIcon />
      ) : label === "space" ? (
        "space"
      ) : label === "done" ? (
        "done"
      ) : (
        label
      )}
    </button>
  );
}

function CapsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[1.35em] w-[1.35em]" fill="currentColor" aria-hidden>
      <path d="M12 4.2 4.2 12h4.1v6.2h7.4V12h4.1L12 4.2z" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[1.35em] w-[1.45em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M19 7v5a2 2 0 0 1-2 2H6" />
      <path d="M9 10.5 5.5 14 9 17.5" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[1.35em] w-[1.55em]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8.5 6.5h10a1.2 1.2 0 0 1 1.2 1.2v8.6a1.2 1.2 0 0 1-1.2 1.2h-10L3.2 12l5.3-5.5z" />
      <path d="M11 10l5 4.2M16 10l-5 4.2" />
    </svg>
  );
}
