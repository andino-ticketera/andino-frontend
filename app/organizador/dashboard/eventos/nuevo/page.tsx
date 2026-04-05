"use client";

import { useRouter } from "next/navigation";
import OrganizerEventForm from "@/components/organizador/OrganizerEventForm";
import { useOrganizer } from "@/context/OrganizerContext";
import type { Event } from "@/data/events";

export default function OrganizerNewEventPage() {
  const router = useRouter();
  const { addEvent, showToast } = useOrganizer();

  const handleSubmit = async (event: Omit<Event, "id">) => {
    try {
      await addEvent(event);
      showToast("Evento publicado correctamente", "success");
      router.push("/organizador/dashboard/eventos");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo publicar el evento",
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
        Publicar Evento
      </h1>
      <p
        className="section-mobile-description"
        style={{ color: "var(--text-disabled)", marginBottom: "18px" }}
      >
        Completa la informacion de tu evento para publicarlo.
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
          mode="create"
          onSubmit={handleSubmit}
          submitLabel="Publicar evento"
        />
      </div>
    </section>
  );
}
