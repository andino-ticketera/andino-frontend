"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import AdminEventForm from "@/components/admin/AdminEventForm";
import { useAdmin } from "@/context/AdminContext";
import type { Event } from "@/data/events";
import { updateEventFromAdmin } from "@/lib/events-api";

export default function AdminEditEventPage() {
  const params = useParams<{ id: string }>();
  const { events, updateEvent, showToast, isEventsLoading } = useAdmin();

  const event = events.find((item) => item.id === params.id);

  if (isEventsLoading) {
    return (
      <section>
        <p style={{ color: "var(--text-disabled)" }}>Cargando evento...</p>
      </section>
    );
  }

  if (!event) {
    return (
      <section>
        <h1
          className="section-mobile-title"
          style={{
            fontSize: "var(--font-2xl)",
            fontWeight: 900,
            marginBottom: "0.5rem",
          }}
        >
          Evento no encontrado
        </h1>
        <Link href="/admin/eventos" style={{ color: "var(--color-primary)" }}>
          Volver al listado de eventos
        </Link>
      </section>
    );
  }

  const handleSubmit = async (updatedEvent: Omit<Event, "id">) => {
    try {
      const exists = events.some((item) => item.id === event.id);
      if (!exists) {
        throw new Error("El evento ya no existe en el estado actual");
      }

      const persistedEvent = await updateEventFromAdmin(
        event.id,
        updatedEvent,
        event,
      );
      updateEvent(event.id, persistedEvent);
      showToast("Cambios guardados correctamente", "success");
    } catch {
      showToast("No se pudieron guardar los cambios", "danger");
    }
  };

  return (
    <section>
      <h1
        className="section-mobile-title"
        style={{
          fontSize: "var(--font-2xl)",
          fontWeight: 900,
          marginBottom: "0.375rem",
        }}
      >
        Editar Evento
      </h1>
      <p
        className="section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "1.125rem" }}
      >
        Modifica los datos del evento y guarda los cambios.
      </p>

      <div
        style={{
          background: "var(--bg-surface-1)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "1.125rem",
        }}
      >
        <AdminEventForm
          mode="edit"
          initialEvent={event}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </div>
    </section>
  );
}
