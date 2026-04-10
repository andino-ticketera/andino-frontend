import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de uso de Andino Tickets. Leé las reglas y políticas que aplican al usar nuestra plataforma.",
  alternates: {
    canonical: "/terminos-y-condiciones",
  },
};

export default function TerminosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
