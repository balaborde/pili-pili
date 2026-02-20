import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PiliPili - Jeu de Cartes en Ligne",
    short_name: "Pili Pili",
    description:
      "Jeu de plis avec paris et missions. Jouez en ligne avec vos amis ou contre l'IA !",
    start_url: "/",
    display: "standalone",
    background_color: "#1a0a0a",
    theme_color: "#e63946",
    orientation: "portrait",
    icons: [
      {
        src: "/web-app-manifest-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/web-app-manifest-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
