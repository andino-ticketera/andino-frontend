"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import AdminEventForm, {
  type AdminEventFormOrganizerOption,
  type AdminEventFormSubmitOptions,
} from "@/components/admin/AdminEventForm";
import { useAdmin } from "@/context/AdminContext";
import type { Event } from "@/data/events";
import { createEventFromAdmin } from "@/lib/events-api";
import { fetchAdminUsers } from "@/lib/admin-users-api";

export default function AdminNewEventPage() {
  const router = useRouter();
  const { addEvent, showToast } = useAdmin();

  // Cargamos usuarios solo al montar el form: lo usa el selector
  // "Asignar a organizador" para que el admin pueda dar de alta eventos
  // en nombre de un organizador existente.
  const { data: allUsers = [], isLoading: isUsersLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  const organizers = useMemo<AdminEventFormOrganizerOption[]>(
    () =>
      allUsers
        .filter((user) => user.rol === "ORGANIZADOR")
        .map((user) => ({
          id: user.id,
          nombreCompleto: user.nombreCompleto,
          email: user.email,
        })),
    [allUsers],
  );

  const organizerPanelUrl = useMemo(() => {
    if (typeof window === "undefined") return "/organizador/dashboard";
    return `${window.location.origin}/organizador/dashboard`;
  }, []);

  const handleSubmit = async (
    event: Omit<Event, "id">,
    options?: AdminEventFormSubmitOptions,
  ) => {
    try {
      const createdEvent = await createEventFromAdmin(event, {
        organizadorId: options?.organizadorId,
      });
      addEvent(createdEvent);
      showToast(
        options?.organizadorId
          ? "Evento creado y asignado al organizador"
          : "Evento creado correctamente",
        "success",
      );
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
          organizers={organizers}
          organizersLoading={isUsersLoading}
          organizerPanelUrl={organizerPanelUrl}
        />
      </div>
    </section>
  );
}
