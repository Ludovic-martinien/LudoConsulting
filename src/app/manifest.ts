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
      { src: "/brand/Ludo_Consulting.jpeg", sizes: "192x192", type: "images/jpeg" },
      { src: "/brand/Ludo_Consulting.jpeg", sizes: "512x512", type: "images/jpeg" },
      { src: "/brand/Ludo_Consulting.jpeg", sizes: "512x512", type: "images/jpeg", purpose: "maskable" },
    ],
  };
}
