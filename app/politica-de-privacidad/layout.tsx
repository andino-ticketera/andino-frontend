import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Política de privacidad de Andino Tickets. Conocé cómo protegemos tus datos personales y tu información.",
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
