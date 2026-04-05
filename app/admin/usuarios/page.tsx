"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAdmin } from "@/context/AdminContext";
import { readAuthSession } from "@/lib/auth-client";
import {
  fetchAdminUsers,
  updateAdminUserRole,
  type AdminManagedUser,
} from "@/lib/admin-users-api";
import EvaIcon from "@/components/EvaIcon";

const queryKey = ["admin-users"] as const;

function formatDate(value: string | null): string {
  if (!value) return "Sin dato";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin dato";

  return date.toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (parts.length === 0) return "U";
  return parts.map((part) => part[0]?.toUpperCase() || "").join("");
}

function getRoleBadge(role: AdminManagedUser["rol"]): {
  label: string;
  color: string;
  background: string;
  border: string;
} {
  if (role === "ADMIN") {
    return {
      label: "Admin",
      color: "#ffd6ff",
      background: "rgba(255, 79, 220, 0.14)",
      border: "rgba(255, 79, 220, 0.32)",
    };
  }

  if (role === "ORGANIZADOR") {
    return {
      label: "Organizador",
      color: "var(--color-primary)",
      background: "var(--primary-10)",
      border: "var(--primary-25)",
    };
  }

  return {
    label: "Usuario",
    color: "var(--text-secondary)",
    background: "rgba(255, 255, 255, 0.05)",
    border: "var(--border-color)",
  };
}

export default function AdminUsuariosPage() {
  const { showToast } = useAdmin();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const session = readAuthSession();

  const {
    data: users = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: fetchAdminUsers,
    staleTime: 0,
  });

  const roleMutation = useMutation({
    mutationFn: async (input: {
      userId: string;
      role: "USUARIO" | "ORGANIZADOR";
    }) => {
      const user = await updateAdminUserRole(input.userId, input.role);
      return user;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<AdminManagedUser[]>(queryKey, (current = []) =>
        current.map((user) =>
          user.id === updatedUser.id ? updatedUser : user,
        ),
      );

      showToast(
        updatedUser.rol === "ORGANIZADOR"
          ? "Permiso de organizador asignado"
          : "Permiso de organizador removido",
        "success",
      );
    },
    onError: (mutationError) => {
      showToast(
        mutationError instanceof Error
          ? mutationError.message
          : "No se pudo actualizar el rol",
        "danger",
      );
    },
  });

  const filteredUsers = useMemo(() => {
    const normalized = deferredSearch.trim().toLowerCase();
    if (!normalized) return users;

    return users.filter((user) => {
      const haystack =
        `${user.nombreCompleto} ${user.email} ${user.rol}`.toLowerCase();
      return haystack.includes(normalized);
    });
  }, [deferredSearch, users]);

  return (
    <section>
      <div
        style={{
          display: "grid",
          gap: "0.375rem",
          marginBottom: "1.125rem",
        }}
      >
        <h1
          className="section-mobile-title"
          style={{
            fontSize: "var(--font-2xl)",
            fontWeight: 900,
            margin: 0,
          }}
        >
          Usuarios
        </h1>
        <p
          className="section-mobile-description"
          style={{ color: "var(--text-disabled)", margin: 0 }}
        >
          Gestiona usuarios registrados y asigna o remueve permisos de
          organizador.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gap: "0.875rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: "0.75rem",
          }}
          className="admin-users-stats"
        >
          <article
            style={{
              background: "var(--bg-surface-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "0.875rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
                textTransform: "uppercase",
              }}
            >
              Registrados
            </p>
            <p
              style={{
                margin: "0.35rem 0 0",
                fontSize: "var(--font-xl)",
                fontWeight: 900,
              }}
            >
              {users.length}
            </p>
          </article>
          <article
            style={{
              background: "var(--bg-surface-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "0.875rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
                textTransform: "uppercase",
              }}
            >
              Organizadores
            </p>
            <p
              style={{
                margin: "0.35rem 0 0",
                fontSize: "var(--font-xl)",
                fontWeight: 900,
              }}
            >
              {users.filter((user) => user.rol === "ORGANIZADOR").length}
            </p>
          </article>
          <article
            style={{
              background: "var(--bg-surface-1)",
              border: "1px solid var(--border-color)",
              borderRadius: "var(--radius-lg)",
              padding: "0.875rem",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-xs)",
                color: "var(--text-disabled)",
                textTransform: "uppercase",
              }}
            >
              Admins
            </p>
            <p
              style={{
                margin: "0.35rem 0 0",
                fontSize: "var(--font-xl)",
                fontWeight: 900,
              }}
            >
              {users.filter((user) => user.rol === "ADMIN").length}
            </p>
          </article>
        </div>

        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre, email o rol..."
            style={{
              flex: "1 1 18rem",
              minWidth: 0,
              border: "1px solid var(--border-color)",
              background: "#ffffff",
              color: "#1f1f1f",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 0.875rem",
              fontSize: "var(--font-sm)",
            }}
          />

          <button
            type="button"
            onClick={() => void refetch()}
            style={{
              border: "1px solid var(--primary-25)",
              background: "var(--primary-10)",
              color: "var(--color-primary)",
              borderRadius: "var(--radius-md)",
              padding: "0.75rem 0.95rem",
              fontSize: "var(--font-sm)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Recargar
          </button>
        </div>
      </div>

      {isLoading ? (
        <div
          style={{
            display: "grid",
            gap: "0.875rem",
          }}
        >
          {[0, 1, 2].map((item) => (
            <div
              key={item}
              className="skeleton-shimmer"
              style={{
                height: "9rem",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-surface-1)",
              }}
            />
          ))}
        </div>
      ) : isError ? (
        <div
          style={{
            border: "1px solid rgba(255, 107, 107, 0.32)",
            background: "rgba(108, 28, 38, 0.22)",
            borderRadius: "var(--radius-lg)",
            padding: "1rem",
            color: "#ffd7de",
            display: "grid",
            gap: "0.75rem",
          }}
        >
          <div>
            <strong style={{ display: "block", marginBottom: "0.25rem" }}>
              No se pudo cargar la gestion de usuarios
            </strong>
            <span style={{ fontSize: "var(--font-sm)" }}>
              {error instanceof Error ? error.message : "Error inesperado"}
            </span>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            style={{
              justifySelf: "start",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              background: "transparent",
              color: "#ffffff",
              borderRadius: "var(--radius-md)",
              padding: "0.625rem 0.875rem",
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "2rem 1rem",
            color: "var(--text-disabled)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-lg)",
            background: "var(--bg-surface-1)",
          }}
        >
          No hay usuarios que coincidan con la busqueda.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.875rem" }}>
          {filteredUsers.map((user) => {
            const badge = getRoleBadge(user.rol);
            const isOwnUser = session?.user.id === user.id;
            const isBusy =
              roleMutation.isPending &&
              roleMutation.variables?.userId === user.id;
            const canPromote = user.rol === "USUARIO";
            const canRevoke = user.rol === "ORGANIZADOR";
            const isLocked = user.rol === "ADMIN" || isOwnUser;

            return (
              <article
                key={user.id}
                style={{
                  background: "var(--bg-surface-1)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "1rem",
                  display: "grid",
                  gap: "0.95rem",
                }}
              >
                <div
                  className="admin-user-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "auto 1fr",
                    gap: "0.875rem",
                    alignItems: "start",
                  }}
                >
                  <div
                    style={{
                      width: "3rem",
                      height: "3rem",
                      borderRadius: "999px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "1px solid var(--border-color)",
                      fontWeight: 900,
                    }}
                  >
                    {getInitials(user.nombreCompleto)}
                  </div>

                  <div style={{ display: "grid", gap: "0.625rem" }}>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.625rem",
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      <strong
                        style={{ fontSize: "var(--font-md)", fontWeight: 800 }}
                      >
                        {user.nombreCompleto}
                      </strong>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          borderRadius: "999px",
                          padding: "0.3rem 0.625rem",
                          fontSize: "var(--font-xs)",
                          fontWeight: 700,
                          color: badge.color,
                          background: badge.background,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {badge.label}
                      </span>
                      {user.emailConfirmado ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.3rem",
                            fontSize: "var(--font-xs)",
                            color: "var(--color-primary)",
                          }}
                        >
                          <EvaIcon name="activity" size={14} /> Email verificado
                        </span>
                      ) : null}
                    </div>

                    <div
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "var(--font-sm)",
                      }}
                    >
                      {user.email}
                    </div>

                    <div
                      className="admin-user-meta"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                        gap: "0.625rem",
                      }}
                    >
                      <div
                        style={{
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-md)",
                          padding: "0.75rem",
                          background: "rgba(255, 255, 255, 0.03)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "var(--font-xs)",
                            color: "var(--text-disabled)",
                            textTransform: "uppercase",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Alta
                        </div>
                        <div
                          style={{
                            fontSize: "var(--font-sm)",
                            fontWeight: 600,
                          }}
                        >
                          {formatDate(user.createdAt)}
                        </div>
                      </div>

                      <div
                        style={{
                          border: "1px solid var(--border-color)",
                          borderRadius: "var(--radius-md)",
                          padding: "0.75rem",
                          background: "rgba(255, 255, 255, 0.03)",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "var(--font-xs)",
                            color: "var(--text-disabled)",
                            textTransform: "uppercase",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Ultimo acceso
                        </div>
                        <div
                          style={{
                            fontSize: "var(--font-sm)",
                            fontWeight: 600,
                          }}
                        >
                          {formatDate(user.lastSignInAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.625rem",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--font-xs)",
                      color: "var(--text-disabled)",
                    }}
                  >
                    {isLocked
                      ? user.rol === "ADMIN"
                        ? "Los admins no se modifican desde esta pantalla."
                        : "No puedes cambiar tu propio rol desde esta pantalla."
                      : canPromote
                        ? "Puede acceder al panel organizador luego de sincronizar su sesion."
                        : "Perdera acceso al panel organizador en la siguiente sincronizacion de sesion."}
                  </span>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.625rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {canPromote ? (
                      <button
                        type="button"
                        disabled={isLocked || isBusy}
                        onClick={() =>
                          roleMutation.mutate({
                            userId: user.id,
                            role: "ORGANIZADOR",
                          })
                        }
                        style={{
                          border: "none",
                          background: "var(--color-accent)",
                          color: "var(--text-primary)",
                          borderRadius: "999px",
                          padding: "0.7rem 0.95rem",
                          fontSize: "var(--font-sm)",
                          fontWeight: 700,
                          cursor:
                            isLocked || isBusy ? "not-allowed" : "pointer",
                          opacity: isLocked || isBusy ? 0.6 : 1,
                        }}
                      >
                        {isBusy ? "Asignando..." : "Asignar organizador"}
                      </button>
                    ) : null}

                    {canRevoke ? (
                      <button
                        type="button"
                        disabled={isLocked || isBusy}
                        onClick={() =>
                          roleMutation.mutate({
                            userId: user.id,
                            role: "USUARIO",
                          })
                        }
                        style={{
                          border: "1px solid rgba(255, 255, 255, 0.14)",
                          background: "rgba(255, 255, 255, 0.04)",
                          color: "var(--text-primary)",
                          borderRadius: "999px",
                          padding: "0.7rem 0.95rem",
                          fontSize: "var(--font-sm)",
                          fontWeight: 700,
                          cursor:
                            isLocked || isBusy ? "not-allowed" : "pointer",
                          opacity: isLocked || isBusy ? 0.6 : 1,
                        }}
                      >
                        {isBusy ? "Quitando..." : "Quitar organizador"}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .admin-users-stats {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 640px) {
          .admin-user-row {
            grid-template-columns: 1fr !important;
          }

          .admin-user-meta {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
