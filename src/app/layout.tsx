import type { Metadata } from "next";
import "./globals.css";
import { Nav, BottomNav } from "@/components/Nav";

export const metadata: Metadata = {
  title: "CashFromChaos — Hermes sells your stuff",
  description:
    "Point your camera at things you don't want. Hermes sells them. Autonomous, policy-bound recommerce over real-world inventory.",
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
