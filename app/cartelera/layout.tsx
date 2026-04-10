import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cartelera de eventos",
  description:
    "Mira la cartelera completa de eventos en vivo. Música, teatro, deportes y más en toda Argentina.",
  openGraph: {
    title: "Cartelera de eventos",
    description:
      "Mira la cartelera completa de eventos en vivo. Música, teatro, deportes y más en toda Argentina.",
    url: "https://andinotickets.com/cartelera",
  },
  alternates: {
    canonical: "/cartelera",
  },
};

export default function CarteleraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
