import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta al equipo de Andino Tickets. Estamos para ayudarte con consultas sobre eventos, entradas o tu cuenta.",
  openGraph: {
    title: "Contacto",
    description:
      "Contacta al equipo de Andino Tickets. Estamos para ayudarte con consultas sobre eventos, entradas o tu cuenta.",
    url: "https://andinotickets.com/contacto",
  },
  alternates: {
    canonical: "/contacto",
  },
};

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
