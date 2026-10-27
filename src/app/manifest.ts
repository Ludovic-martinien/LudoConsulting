import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ludo_Consulting — Innover · Développer · Réussir",
    short_name: "Ludo_Consulting",
    description: "Développement informatique, intelligence artificielle, formation, cybersécurité, création graphique et accompagnement digital au Gabon.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0c302d",
    theme_color: "#0b483e",
    lang: "fr",
    categories: ["business", "education", "utilities"],
    icons: [
      { src: "/brand/Ludo_Consulting-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/Ludo_Consulting-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/Ludo_Consulting-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
