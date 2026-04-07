import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AdminProvider } from "@/context/AdminContext";
import QueryProvider from "@/components/QueryProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://andinotickets.com"),
  title: "Andino Tickets — Descubri los mejores eventos",
  description:
    "Tu plataforma de confianza para descubrir y reservar entradas a los mejores eventos en vivo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AdminProvider>{children}</AdminProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
