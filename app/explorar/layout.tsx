import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explorar eventos",
  description:
    "Explora todos los eventos disponibles en Argentina. Filtra por ciudad, fecha y categoría para encontrar tu próximo plan.",
  openGraph: {
    title: "Explorar eventos",
    description:
      "Explora todos los eventos disponibles en Argentina. Filtra por ciudad, fecha y categoría.",
    url: "https://andinotickets.com/explorar",
  },
  alternates: {
    canonical: "/explorar",
  },
};

export default function ExplorarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
