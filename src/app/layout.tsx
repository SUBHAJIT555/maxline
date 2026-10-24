import type { Metadata, Viewport } from "next";
import { Exo_2, Orbitron, Rajdhani } from "next/font/google";
import "./globals.css";

const body = Rajdhani({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const display = Exo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
});

const digital = Orbitron({
  variable: "--font-digital",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const metadata: Metadata = {
  title: "MAXLINE GLOBAL – Cargo Rush",
  description: "Interactive touchscreen logistics challenge for Maxline Global",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cargo Rush",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#001B3D",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${body.variable} ${display.variable} ${digital.variable} h-full antialiased`}
    >
      <body className="h-dvh overflow-hidden bg-black">{children}</body>
    </html>
  );
}
