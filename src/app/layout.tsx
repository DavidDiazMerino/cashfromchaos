import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Nav, BottomNav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "CashFromChaos — Hermes sells your stuff",
  description:
    "Point your camera at things you don't want. Hermes sells them. Autonomous, policy-bound recommerce over real-world inventory.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CashFromChaos",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Nav />
        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:pb-24">{children}</main>
        <footer className="border-t border-edge/60 py-6 pb-24 text-center text-xs text-muted sm:pb-6">
          CashFromChaos · Hermes Agent Accelerated Business Hackathon · Nous Research × NVIDIA ×
          Stripe
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
