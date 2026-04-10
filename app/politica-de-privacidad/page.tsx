import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const sectionTitle: React.CSSProperties = {
  fontSize: "var(--font-lg)",
  fontWeight: 700,
  color: "var(--text-primary)",
  margin: "2rem 0 0.75rem",
};

const paragraph: React.CSSProperties = {
  fontSize: "var(--font-sm)",
  color: "var(--text-secondary)",
  lineHeight: 1.7,
  marginBottom: "0.75rem",
};

export default function PoliticaPrivacidadPage() {
  return (
    <div>
      <Navbar />
      <main
        style={{
          minHeight: "calc(100vh - 16rem)",
          padding: "8rem 1rem 4rem",
          background:
            "radial-gradient(circle at top, rgba(92,255,157,0.10), transparent 32%), var(--bg-base)",
        }}
      >
        <article
          style={{
            width: "min(100%, 48rem)",
            margin: "0 auto",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-xs)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--color-primary)",
              fontWeight: 800,
            }}
          >
            Legal
          </p>
          <h1
            style={{
              margin: "0.75rem 0 0.5rem",
              fontSize: "var(--font-2xl)",
              lineHeight: 1.1,
            }}
          >
            Política de Privacidad
          </h1>
          <p style={{ ...paragraph, color: "var(--text-disabled)" }}>
            Última actualización: abril 2026
          </p>

          <h2 style={sectionTitle}>1. Responsable del tratamiento</h2>
          <p style={paragraph}>
            Andino Tickets (en adelante, &quot;el Responsable&quot;) es el responsable del tratamiento de los datos personales recopilados a través de la Plataforma, en cumplimiento con la Ley 25.326 de Protección de Datos Personales de la República Argentina y su normativa complementaria.
          </p>

          <h2 style={sectionTitle}>2. Datos que recopilamos</h2>
          <p style={paragraph}>
            Recopilamos los datos personales que el usuario proporciona voluntariamente al registrarse, comprar entradas o contactarnos, incluyendo: nombre y apellido, dirección de correo electrónico, número de documento de identidad, y datos de facturación. También podemos recopilar datos de uso y navegación de forma automática mediante cookies y tecnologías similares.
          </p>

          <h2 style={sectionTitle}>3. Finalidad del tratamiento</h2>
          <p style={paragraph}>
            Los datos personales se utilizan para: gestionar el registro y la cuenta del usuario; procesar la compra y entrega de entradas; enviar comunicaciones relacionadas con las transacciones realizadas; mejorar la experiencia del usuario en la Plataforma; cumplir con obligaciones legales y regulatorias; y prevenir fraudes o usos no autorizados.
          </p>

          <h2 style={sectionTitle}>4. Comparticion de datos</h2>
          <p style={paragraph}>
            Los datos personales podrán ser compartidos con: organizadores de eventos, exclusivamente en relación con las entradas adquiridas; procesadores de pagos (como Mercado Pago) para completar las transacciones; y autoridades competentes cuando sea requerido por ley. No vendemos, alquilamos ni cedemos datos personales a terceros con fines comerciales.
          </p>

          <h2 style={sectionTitle}>5. Seguridad de los datos</h2>
          <p style={paragraph}>
            Implementamos medidas de seguridad técnicas y organizativas razonables para proteger los datos personales contra el acceso no autorizado, la alteración, divulgación o destrucción. Sin embargo, ningún método de transmisión por Internet o almacenamiento electrónico es completamente seguro, por lo que no podemos garantizar su seguridad absoluta.
          </p>

          <h2 style={sectionTitle}>6. Derechos del usuario</h2>
          <p style={paragraph}>
            El usuario tiene derecho a acceder, rectificar, actualizar y solicitar la supresión de sus datos personales, así como a oponerse a su tratamiento, conforme a la legislación vigente. Para ejercer estos derechos, el usuario puede comunicarse a través del formulario de contacto disponible en la Plataforma.
          </p>

          <h2 style={sectionTitle}>7. Cookies</h2>
          <p style={paragraph}>
            La Plataforma utiliza cookies y tecnologías similares para mejorar la experiencia del usuario, analizar el tráfico y personalizar el contenido. El usuario puede configurar su navegador para rechazar cookies, aunque esto podría afectar el funcionamiento de ciertas funcionalidades de la Plataforma.
          </p>

          <h2 style={sectionTitle}>8. Retencion de datos</h2>
          <p style={paragraph}>
            Los datos personales se conservarán durante el tiempo necesario para cumplir con las finalidades para las que fueron recopilados, así como para cumplir con obligaciones legales, resolver disputas y hacer cumplir los acuerdos vigentes.
          </p>

          <h2 style={sectionTitle}>9. Modificaciones</h2>
          <p style={paragraph}>
            El Responsable se reserva el derecho de modificar esta Política de Privacidad en cualquier momento. Las modificaciones serán publicadas en la Plataforma y entrarán en vigencia desde su publicación. Se recomienda al usuario revisar periódicamente esta política.
          </p>

          <h2 style={sectionTitle}>10. Contacto</h2>
          <p style={paragraph}>
            Para consultas o solicitudes relacionadas con el tratamiento de datos personales, el usuario puede comunicarse a través del formulario de contacto disponible en la Plataforma.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
