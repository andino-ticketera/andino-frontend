import type { Metadata } from "next";
import Link from "next/link";
import Logo from "@/components/Logo";
import EvaIcon from "@/components/EvaIcon";

export const metadata: Metadata = {
  robots: "noindex, nofollow",
};

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(1200px 500px at 50% -120px, rgba(92, 255, 157, 0.16), transparent 55%), var(--bg-base)",
        color: "var(--text-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-color)",
          background:
            "linear-gradient(180deg, var(--bg-surface-1), var(--bg-surface-2))",
          boxShadow: "0 1.5rem 3.75rem rgba(11, 4, 18, 0.5)",
          padding: "1.75rem",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            width: "22.5rem",
            height: "22.5rem",
            right: "-7.5rem",
            top: "-8.75rem",
            borderRadius: "50%",
            background: "rgba(255, 106, 240, 0.09)",
            filter: "blur(2px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "inline-flex", marginBottom: "1rem" }}>
          <Logo size="md" />
        </div>

        <p
          style={{
            fontSize: "clamp(4.2rem, 10vw, 6.6rem)",
            lineHeight: 0.95,
            fontWeight: 900,
            letterSpacing: "-0.03em",
            color: "var(--color-primary)",
            textShadow: "0 2px 24px rgba(92, 255, 157, 0.18)",
            marginBottom: "0.375rem",
          }}
        >
          404
        </p>

        <h1
          style={{
            fontSize: "var(--font-2xl)",
            lineHeight: 1.1,
            fontWeight: 900,
            marginBottom: "0.625rem",
          }}
        >
          Pagina no encontrada
        </h1>

        <p
          style={{
            maxWidth: "540px",
            margin: "0 auto",
            color: "var(--text-secondary)",
            fontSize: "var(--font-base)",
          }}
        >
          La ruta que intentaste abrir no existe o fue movida. Podes volver al
          inicio o seguir navegando eventos desde cartelera.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            justifyContent: "center",
            gap: "0.625rem",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/"
            className="btn-primary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              textDecoration: "none",
              background: "var(--color-accent)",
              color: "var(--text-primary)",
              borderRadius: "var(--radius-md)",
              padding: "0.625rem 1rem",
              fontWeight: 700,
            }}
          >
            <EvaIcon name="arrow-back" size={16} />
            Volver al inicio
          </Link>
        </div>
      </section>
    </main>
  );
}
