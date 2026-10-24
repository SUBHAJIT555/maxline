"use client";

const COLORS = [
  "#FF5900",
  "#FFD56A",
  "#C6F54A",
  "#FFFFFF",
  "#FF8A3D",
  "#5EC8FF",
  "#FF5FA2",
  "#B8FE00",
];

export function CrackerBurst() {
  const pieces = Array.from({ length: 54 }, (_, index) => {
    const color = COLORS[index % COLORS.length]!;
    const left = ((index * 37) % 100) + ((index % 5) - 2) * 0.8;
    const size = 7 + (index % 6);
    return {
      index,
      color,
      left,
      size,
      delay: (index % 12) * 0.08,
      duration: 2.6 + (index % 7) * 0.28,
      drift: `${((index * 17) % 70) - 35}px`,
      spin: `${220 + (index % 8) * 80}deg`,
      round: index % 4 === 0,
    };
  });

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
      aria-hidden
    >
      {pieces.map((piece) => (
        <span
          key={piece.index}
          className="confetti-piece"
          style={{
            left: `${piece.left}%`,
            width: piece.size,
            height: piece.round ? piece.size : Math.max(4, piece.size * 0.42),
            background: piece.color,
            borderRadius: piece.round ? "999px" : "2px",
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            ["--drift" as string]: piece.drift,
            ["--spin" as string]: piece.spin,
          }}
        />
      ))}
    </div>
  );
}
