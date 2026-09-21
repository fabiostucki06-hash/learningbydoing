import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "learningbydoing",
    short_name: "learningbydoing",
    description:
      "Die All-in-One-Lernplattform: Karteikarten, Quiz, Prüfungsplaner und Altprüfungen.",
    lang: "de",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    // Entspricht --background (hell); das Manifest kennt keinen Dark-Mode.
    background_color: "#f8fafc",
    theme_color: "#f8fafc",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
