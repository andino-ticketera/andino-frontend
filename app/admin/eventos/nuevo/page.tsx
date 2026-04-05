"use client";

import { useRouter } from "next/navigation";
import AdminEventForm from "@/components/admin/AdminEventForm";
import { useAdmin } from "@/context/AdminContext";
import type { Event } from "@/data/events";
import { createEventFromAdmin } from "@/lib/events-api";

export default function AdminNewEventPage() {
  const router = useRouter();
  const { addEvent, showToast } = useAdmin();

  const handleSubmit = async (event: Omit<Event, "id">) => {
    try {
      const createdEvent = await createEventFromAdmin(event);
      addEvent(createdEvent);
      showToast("Evento creado correctamente", "success");
      router.push("/admin/eventos");
    } catch {
      showToast("No se pudo crear el evento", "danger");
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
        Crear Evento
      </h1>
      <p
        className="section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "1.125rem" }}
      >
        Completa la informacion para publicar un nuevo evento.
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
          mode="create"
          onSubmit={handleSubmit}
          submitLabel="Crear evento"
        />
      </div>
    </section>
  );
}
