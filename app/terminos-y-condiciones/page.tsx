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
            Terminos y Condiciones
          </h1>
          <p style={{ ...paragraph, color: "var(--text-disabled)" }}>
            Ultima actualizacion: abril 2026
          </p>

          <h2 style={sectionTitle}>1. Aceptacion de los terminos</h2>
          <p style={paragraph}>
            Al acceder y utilizar la plataforma Andino Tickets (en adelante, &quot;la Plataforma&quot;), el usuario acepta cumplir con los presentes Terminos y Condiciones. Si no esta de acuerdo con alguno de estos terminos, le solicitamos que se abstenga de utilizar la Plataforma.
          </p>

          <h2 style={sectionTitle}>2. Descripcion del servicio</h2>
          <p style={paragraph}>
            Andino Tickets es una plataforma de intermediacion que conecta organizadores de eventos con compradores de entradas. La Plataforma facilita la publicacion, difusion y venta de entradas para eventos. Andino Tickets no es el organizador de los eventos publicados, salvo que se indique expresamente lo contrario.
          </p>

          <h2 style={sectionTitle}>3. Registro y cuenta de usuario</h2>
          <p style={paragraph}>
            Para realizar compras o publicar eventos, el usuario debera registrarse proporcionando informacion veraz, completa y actualizada. El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que se realicen bajo su cuenta.
          </p>

          <h2 style={sectionTitle}>4. Compra de entradas</h2>
          <p style={paragraph}>
            La compra de entradas se realiza exclusivamente a traves de los medios de pago habilitados en la Plataforma. Una vez confirmado el pago, las entradas seran enviadas al correo electronico proporcionado por el comprador. El comprador es responsable de verificar la exactitud de sus datos antes de completar la compra.
          </p>

          <h2 style={sectionTitle}>5. Politica de reembolsos</h2>
          <p style={paragraph}>
            Los reembolsos estan sujetos a las politicas del organizador de cada evento. Andino Tickets no garantiza la devolucion del importe en caso de cancelacion o modificacion del evento por parte del organizador. Ante cualquier reclamo relacionado con el evento, el comprador debera dirigirse directamente al organizador.
          </p>

          <h2 style={sectionTitle}>6. Responsabilidad del organizador</h2>
          <p style={paragraph}>
            El organizador es el unico responsable de la realizacion del evento, incluyendo su contenido, logistica, seguridad y cumplimiento de la normativa vigente. Andino Tickets no se hace responsable por la suspension, cancelacion, modificacion o calidad de los eventos publicados.
          </p>

          <h2 style={sectionTitle}>7. Propiedad intelectual</h2>
          <p style={paragraph}>
            Todo el contenido de la Plataforma, incluyendo textos, graficos, logotipos, iconos, imagenes y software, es propiedad de Andino Tickets o de sus respectivos titulares y esta protegido por las leyes de propiedad intelectual aplicables. Queda prohibida su reproduccion total o parcial sin autorizacion previa por escrito.
          </p>

          <h2 style={sectionTitle}>8. Limitacion de responsabilidad</h2>
          <p style={paragraph}>
            Andino Tickets proporciona la Plataforma &quot;tal cual&quot; y no otorga garantias de ningun tipo, expresas o implicitas, sobre su funcionamiento, disponibilidad o idoneidad para un fin particular. En la maxima medida permitida por la ley, Andino Tickets no sera responsable por danos directos, indirectos, incidentales, consecuentes o especiales derivados del uso de la Plataforma.
          </p>

          <h2 style={sectionTitle}>9. Modificaciones</h2>
          <p style={paragraph}>
            Andino Tickets se reserva el derecho de modificar estos Terminos y Condiciones en cualquier momento. Las modificaciones seran efectivas desde su publicacion en la Plataforma. El uso continuado del servicio tras la publicacion de cambios implica la aceptacion de los mismos.
          </p>

          <h2 style={sectionTitle}>10. Legislacion aplicable</h2>
          <p style={paragraph}>
            Estos Terminos y Condiciones se rigen por las leyes de la Republica Argentina. Cualquier controversia derivada del uso de la Plataforma sera sometida a la jurisdiccion de los tribunales ordinarios competentes de la Ciudad Autonoma de Buenos Aires.
          </p>

          <h2 style={sectionTitle}>11. Contacto</h2>
          <p style={paragraph}>
            Para consultas relacionadas con estos Terminos y Condiciones, el usuario puede comunicarse a traves del formulario de contacto disponible en la Plataforma.
          </p>
        </article>
      </main>
      <Footer />
    </div>
  );
}
