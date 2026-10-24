# MAXLINE GLOBAL – Cargo Rush

Portrait (1080×1920) touchscreen arcade game for Maxline Global kiosks.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS v4
- Motion (`motion`)
- Zustand (local persist until Supabase)

## Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/register`.

Kiosk production:

```bash
npm run kiosk
```

## Screens

| Route | Screen |
|-------|--------|
| `/register` | Name / email / phone + Start Challenge |
| `/play` | 30s grid cargo game |
| `/score` | Final score + celebration |
| `/leaderboard` | Top 5 + highlight current player |

## Assets

Source art lives in `MaxlineImages/`. Runtime copies (kebab-case) are in `public/assets/`.

## Data (current)

Participant + scores persist in `localStorage` via Zustand. Supabase + admin export come last.
