import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminos y condiciones",
  description:
    "Terminos y condiciones de uso de Andino Tickets. Lee las reglas y politicas que aplican al usar nuestra plataforma.",
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
