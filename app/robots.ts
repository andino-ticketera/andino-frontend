import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/organizador/",
          "/usuario/",
          "/checkout/",
          "/iniciar-sesion",
          "/restablecer-clave",
          "/api/",
        ],
      },
    ],
    sitemap: "https://andinotickets.com/sitemap.xml",
  };
}
