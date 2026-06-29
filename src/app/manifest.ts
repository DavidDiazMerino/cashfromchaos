import type { MetadataRoute } from "next";

// Web app manifest — makes "Add to Home Screen" open CashFromChaos as a
// standalone, full-screen app (no browser address bar) on the demo phone.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "CashFromChaos",
    short_name: "CashFromChaos",
    description: "Point your camera at things you don't want. Hermes sells them.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0b0b0b",
    theme_color: "#0b0b0b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
