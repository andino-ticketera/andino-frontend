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

export default function TerminosPage() {
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
            Términos y Condiciones
          </h1>
          <p style={{ ...paragraph, color: "var(--text-disabled)" }}>
            Última actualización: abril 2026
          </p>

          <h2 style={sectionTitle}>1. Aceptación de los términos</h2>
          <p style={paragraph}>
            Al acceder y utilizar la plataforma Andino Tickets (en adelante, &quot;la Plataforma&quot;), el usuario acepta cumplir con los presentes Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le solicitamos que se abstenga de utilizar la Plataforma.
          </p>

          <h2 style={sectionTitle}>2. Descripción del servicio</h2>
          <p style={paragraph}>
            Andino Tickets es una plataforma de intermediación que conecta organizadores de eventos con compradores de entradas. La Plataforma facilita la publicación, difusión y venta de entradas para eventos. Andino Tickets no es el organizador de los eventos publicados, salvo que se indique expresamente lo contrario.
          </p>

          <h2 style={sectionTitle}>3. Registro y cuenta de usuario</h2>
          <p style={paragraph}>
            Para realizar compras o publicar eventos, el usuario deberá registrarse proporcionando información veraz, completa y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que se realicen bajo su cuenta.
          </p>

          <h2 style={sectionTitle}>4. Compra de entradas</h2>
          <p style={paragraph}>
            La compra de entradas se realiza exclusivamente a través de los medios de pago habilitados en la Plataforma. Una vez confirmado el pago, las entradas serán enviadas al correo electrónico proporcionado por el comprador. El comprador es responsable de verificar la exactitud de sus datos antes de completar la compra.
          </p>

          <h2 style={sectionTitle}>5. Política de reembolsos</h2>
          <p style={paragraph}>
            Los reembolsos están sujetos a las políticas del organizador de cada evento. Andino Tickets no garantiza la devolución del importe en caso de cancelación o modificación del evento por parte del organizador. Ante cualquier reclamo relacionado con el evento, el comprador deberá dirigirse directamente al organizador.
          </p>

          <h2 style={sectionTitle}>6. Responsabilidad del organizador</h2>
          <p style={paragraph}>
            El organizador es el único responsable de la realización del evento, incluyendo su contenido, logística, seguridad y cumplimiento de la normativa vigente. Andino Tickets no se hace responsable por la suspensión, cancelación, modificación o calidad de los eventos publicados.
          </p>

          <h2 style={sectionTitle}>7. Propiedad intelectual</h2>
          <p style={paragraph}>
            Todo el contenido de la Plataforma, incluyendo textos, gráficos, logotipos, íconos, imágenes y software, es propiedad de Andino Tickets o de sus respectivos titulares y está protegido por las leyes de propiedad intelectual aplicables. Queda prohibida su reproducción total o parcial sin autorización previa por escrito.
          </p>

          <h2 style={sectionTitle}>8. Limitación de responsabilidad</h2>
          <p style={paragraph}>
            Andino Tickets proporciona la Plataforma &quot;tal cual&quot; y no otorga garantías de ningún tipo, expresas o implícitas, sobre su funcionamiento, disponibilidad o idoneidad para un fin particular. En la máxima medida permitida por la ley, Andino Tickets no será responsable por daños directos, indirectos, incidentales, consecuentes o especiales derivados del uso de la Plataforma.
          </p>

          <h2 style={sectionTitle}>9. Modificaciones</h2>
          <p style={paragraph}>
            Andino Tickets se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento. Las modificaciones serán efectivas desde su publicación en la Plataforma. El uso continuado del servicio tras la publicación de cambios implica la aceptación de los mismos.
          </p>

          <h2 style={sectionTitle}>10. Legislación aplicable</h2>
          <p style={paragraph}>
            Estos Términos y Condiciones se rigen por las leyes de la República Argentina. Cualquier controversia derivada del uso de la Plataforma será sometida a la jurisdicción de los tribunales ordinarios competentes de la Ciudad Autónoma de Buenos Aires.
          </p>

          <h2 style={sectionTitle}>11. Contacto</h2>
          <p style={paragraph}>
            Para consultas relacionadas con estos Términos y Condiciones, el usuario puede comunicarse a través del formulario de contacto disponible en la Plataforma.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
