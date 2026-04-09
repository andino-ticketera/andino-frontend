import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politica de privacidad",
  description:
    "Politica de privacidad de Andino Tickets. Conoce como protegemos tus datos personales y tu informacion.",
  alternates: {
    canonical: "/politica-de-privacidad",
  },
};

export default function PrivacidadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
