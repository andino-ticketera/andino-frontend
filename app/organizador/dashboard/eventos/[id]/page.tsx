"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import OrganizerEventForm from "@/components/organizador/OrganizerEventForm";
import { useOrganizer } from "@/context/OrganizerContext";
import type { Event } from "@/data/events";

export default function OrganizerEditEventPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { events, updateEvent, showToast } = useOrganizer();

  const event = events.find((item) => item.id === params.id);

  if (!event) {
    return (
      <section>
        <h1
          className="section-mobile-title"
          style={{
            fontSize: "var(--font-2xl)",
            fontWeight: 900,
            marginBottom: "8px",
          }}
        >
          Evento no encontrado
        </h1>
        <Link
          href="/organizador/dashboard/eventos"
          style={{ color: "var(--color-primary)" }}
        >
          Volver a mis eventos
        </Link>
      </section>
    );
  }

  const handleSubmit = async (updatedEvent: Omit<Event, "id">) => {
    try {
      await updateEvent(event.id, updatedEvent);
      showToast("Evento actualizado correctamente", "success");
      router.push("/organizador/dashboard/eventos");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el evento",
        "danger",
      );
    }
  };

  return (
    <section>
      <h1
        className="section-mobile-title"
        style={{
          fontSize: "var(--font-2xl)",
          fontWeight: 900,
          marginBottom: "6px",
        }}
      >
        Editar Evento
      </h1>
      <p
        className="section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "18px" }}
      >
        Modifica los datos del evento y guarda los cambios.
      </p>

      <div
        style={{
          background: "var(--bg-surface-1)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          padding: "18px",
        }}
      >
        <OrganizerEventForm
          mode="edit"
          initialEvent={event}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
      </div>
    </section>
  );
}
