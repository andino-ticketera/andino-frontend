import Link from "next/link";
import Logo from "./Logo";

const linkStyle: React.CSSProperties = {
  fontSize: "var(--font-sm)",
  color: "var(--text-disabled)",
  textDecoration: "none",
};

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-footer)",
        borderTop: "1px solid var(--border-color-40)",
        marginTop: "5rem",
      }}
    >
      <div
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "3rem 1.5rem" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "2rem",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link
              href="/"
              style={{
                textDecoration: "none",
                display: "inline-block",
                marginBottom: "1rem",
              }}
            >
              <Logo size="md" />
            </Link>
            <p
              style={{
                fontSize: "var(--font-sm)",
                color: "var(--text-disabled)",
                lineHeight: "var(--leading-relaxed)",
              }}
            >
              Tu plataforma de confianza para descubrir y reservar los mejores
              eventos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4
              style={{
                fontSize: "var(--font-sm)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Navegacion
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <Link href="/" style={linkStyle}>
                Cartelera
              </Link>
              <Link href="/explorar" style={linkStyle}>
                Explorar
              </Link>
              <Link href="/contacto" style={linkStyle}>
                Contacto
              </Link>
            </div>
          </div>

          <div>
            <h4
              style={{
                fontSize: "var(--font-sm)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Soporte
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <Link href="/contacto" style={linkStyle}>
                Centro de Ayuda
              </Link>
              <Link href="/contacto" style={linkStyle}>
                Contacto
              </Link>
              <Link href="/contacto" style={linkStyle}>
                FAQ
              </Link>
            </div>
          </div>

          <div>
            <h4
              style={{
                fontSize: "var(--font-sm)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1rem",
              }}
            >
              Legal
            </h4>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <Link href="/terminos-y-condiciones" style={linkStyle}>
                Terminos y Condiciones
              </Link>
              <Link href="/terminos-y-condiciones" style={linkStyle}>
                Politica de Privacidad
              </Link>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border-color-40)",
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "var(--font-xs)",
              color: "var(--text-disabled)",
            }}
          >
            &copy; 2026 Andino Tickets. Todos los derechos reservados.
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
