"use client";

import { useMemo, useState } from "react";
import AdminConfirmDialog from "@/components/admin/AdminConfirmDialog";
import EvaIcon from "@/components/EvaIcon";
import { useAdmin } from "@/context/AdminContext";
import { assignEventToCategory } from "@/lib/events-api";

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

interface RemoveEventDialogState {
  eventId: string;
  eventTitle: string;
  currentCategory: string;
  targetCategory: string;
}

interface DeleteCategoryDialogState {
  category: string;
}

interface CategoryVisibilityDialogState {
  category: string;
  nextVisibleInApp: boolean;
}

export default function AdminCategoriesPage() {
  const {
    allCategories,
    events,
    addCategory,
    renameCategory,
    removeCategory,
    setCategoryVisibility,
    updateEvent,
    showToast,
  } = useAdmin();

  const [newCategory, setNewCategory] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [deleteCategoryDialog, setDeleteCategoryDialog] =
    useState<DeleteCategoryDialogState | null>(null);
  const [categoryVisibilityDialog, setCategoryVisibilityDialog] =
    useState<CategoryVisibilityDialogState | null>(null);
  const [removeEventDialog, setRemoveEventDialog] =
    useState<RemoveEventDialogState | null>(null);
  const [searchByCategory, setSearchByCategory] = useState<
    Record<string, string>
  >({});

  const categoryEventCount = useMemo(() => {
    return allCategories.reduce<Record<string, number>>((acc, category) => {
      acc[category.nombre] = events.filter(
        (event) => normalize(event.category) === normalize(category.nombre),
      ).length;
      return acc;
    }, {});
  }, [allCategories, events]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      showToast("Escribi un nombre de categoria", "danger");
      return;
    }

    const wasAdded = await addCategory(newCategory);
    if (!wasAdded) {
      showToast("No pudimos agregar la categoria", "danger");
      return;
    }

    setNewCategory("");
    showToast("Categoria agregada correctamente", "success");
  };

  const handleStartEdit = (category: string) => {
    setEditingCategory(category);
    setEditingValue(category);
    setDeleteCategoryDialog(null);
    setCategoryVisibilityDialog(null);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingValue("");
  };

  const handleSaveEdit = async () => {
    if (!editingCategory) return;

    if (!editingValue.trim()) {
      showToast("El nombre no puede quedar vacio", "danger");
      return;
    }

    const wasRenamed = await renameCategory(editingCategory, editingValue);
    if (!wasRenamed) {
      showToast("No pudimos guardar los cambios", "danger");
      return;
    }

    setEditingCategory(null);
    setEditingValue("");
    setDeleteCategoryDialog(null);
    setCategoryVisibilityDialog(null);
    showToast("Categoria actualizada correctamente", "success");
  };

  const handleDeleteCategoryRequest = (category: string) => {
    const linkedEvents = categoryEventCount[category] ?? 0;

    if (linkedEvents > 0) {
      showToast("Primero quita sus eventos", "danger");
      return;
    }

    setDeleteCategoryDialog({ category });
  };

  const handleCategoryVisibilityRequest = (
    category: string,
    nextVisibleInApp: boolean,
  ) => {
    setDeleteCategoryDialog(null);
    setCategoryVisibilityDialog({ category, nextVisibleInApp });
  };

  const handleConfirmDeleteCategory = async () => {
    if (!deleteCategoryDialog) return;

    const { category } = deleteCategoryDialog;
    setDeleteCategoryDialog(null);

    const wasRemoved = await removeCategory(category);
    if (!wasRemoved) {
      showToast("No pudimos eliminar la categoria", "danger");
      return;
    }

    if (
      expandedCategory &&
      normalize(expandedCategory) === normalize(category)
    ) {
      setExpandedCategory(null);
    }

    showToast("Categoria eliminada correctamente", "success");
  };

  const handleConfirmCategoryVisibility = async () => {
    if (!categoryVisibilityDialog) return;

    const { category, nextVisibleInApp } = categoryVisibilityDialog;
    setCategoryVisibilityDialog(null);

    const wasUpdated = await setCategoryVisibility(category, nextVisibleInApp);
    if (!wasUpdated) {
      showToast("No pudimos actualizar la visibilidad", "danger");
      return;
    }

    showToast(
      nextVisibleInApp
        ? "Categoria visible nuevamente en la app"
        : "Categoria oculta correctamente",
      "success",
    );
  };

  const reassignEvent = async (
    eventId: string,
    targetCategory: string,
    successMessage: string,
  ) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) {
      showToast("No encontramos ese evento", "danger");
      return;
    }

    if (normalize(event.category) === normalize(targetCategory)) {
      showToast("Ese evento ya esta en esta categoria", "danger");
      return;
    }

    try {
      await assignEventToCategory(event.id, targetCategory);
      updateEvent(event.id, { category: targetCategory });
      showToast(successMessage, "success");
    } catch {
      showToast("No pudimos actualizar la categoria del evento", "danger");
    }
  };

  const handleAddEventToCategory = async (
    eventId: string,
    category: string,
  ) => {
    await reassignEvent(eventId, category, "Evento agregado correctamente");
  };

  const handleRemoveEventFromCategory = async (
    eventId: string,
    currentCategory: string,
  ) => {
    const alternatives = allCategories.map((item) => item.nombre).filter(
      (category) => normalize(category) !== normalize(currentCategory),
    );

    if (alternatives.length === 0) {
      showToast("Crea otra categoria para poder quitar este evento", "danger");
      return;
    }

    const event = events.find((item) => item.id === eventId);
    if (!event) {
      showToast("No encontramos ese evento", "danger");
      return;
    }

    setRemoveEventDialog({
      eventId,
      eventTitle: event.title,
      currentCategory,
      targetCategory: alternatives[0],
    });
  };

  const handleConfirmRemoveEvent = async () => {
    if (!removeEventDialog) return;

    const { eventId, targetCategory } = removeEventDialog;
    setRemoveEventDialog(null);

    await reassignEvent(
      eventId,
      targetCategory,
      "Evento quitado de esta categoria",
    );
  };

  return (
    <section>
      <h1
        className="section-mobile-title"
        style={{
          fontSize: "clamp(1.35rem, 1.2rem + 0.75vw, 1.85rem)",
          fontWeight: 900,
          marginBottom: "0.35rem",
        }}
      >
        Categorias
      </h1>
      <p
        className="section-mobile-description"
        style={{
          color: "var(--text-disabled)",
          marginBottom: "1rem",
          fontSize: "clamp(0.82rem, 0.8rem + 0.2vw, 0.95rem)",
        }}
      >
        Gestiona categorias y organiza eventos desde un solo lugar.
      </p>

      <div className="surface-card" style={{ marginBottom: "1rem" }}>
        <label className="field-label" htmlFor="new-category">
          Nueva categoria
        </label>

        <div className="add-grid">
          <input
            id="new-category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Ej: Gastronomia"
            className="field-input"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleAddCategory();
              }
            }}
          />

          <button
            type="button"
            onClick={() => {
              void handleAddCategory();
            }}
            className="primary-btn"
          >
            <EvaIcon name="plus" size={16} />
            Agregar
          </button>
        </div>
      </div>

      {allCategories.length === 0 ? (
        <div className="surface-card empty-card">
          No hay categorias configuradas.
        </div>
      ) : (
        <div className="cards-stack">
          {allCategories.map((categoryRecord) => {
            const category = categoryRecord.nombre;
            const isExpanded =
              expandedCategory !== null &&
              normalize(expandedCategory) === normalize(category);
            const isEditing =
              editingCategory !== null &&
              normalize(editingCategory) === normalize(category);

            const assignedEvents = events.filter(
              (event) => normalize(event.category) === normalize(category),
            );
            const isVisibleInApp = categoryRecord.visible_en_app !== false;

            const search = searchByCategory[category] || "";
            const normalizedSearch = normalize(search);

            const allEvents = events.filter((event) => {
              if (!normalizedSearch) return true;

              return (
                normalize(event.title).includes(normalizedSearch) ||
                normalize(event.venue).includes(normalizedSearch) ||
                normalize(event.category).includes(normalizedSearch)
              );
            });

            return (
              <article className="surface-card category-card" key={category}>
                <button
                  type="button"
                  className="category-header"
                  onClick={() => {
                    setExpandedCategory(isExpanded ? null : category);
                  }}
                >
                  <div className="category-left">
                    <span
                      className="chevron"
                      style={{
                        transform: isExpanded
                          ? "rotate(90deg)"
                          : "rotate(0deg)",
                      }}
                    >
                      <EvaIcon name="chevron-right" size={16} />
                    </span>

                    <div className="category-title-wrap">
                      {isEditing ? (
                        <input
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="field-input compact"
                        />
                      ) : (
                        <h2 className="category-title">{category}</h2>
                      )}

                      <p className="category-meta">
                        {assignedEvents.length} evento
                        {assignedEvents.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>

                  <span className="state-pill">
                    {isVisibleInApp ? "Visible" : "Oculta"}
                  </span>
                </button>

                <div className="actions-row">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="soft-btn"
                        onClick={() => {
                          void handleSaveEdit();
                        }}
                      >
                        <EvaIcon name="checkmark" size={14} /> Guardar
                      </button>
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={handleCancelEdit}
                      >
                        <EvaIcon name="close" size={14} /> Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="soft-btn"
                        onClick={() => handleStartEdit(category)}
                      >
                        <EvaIcon name="edit" size={14} /> Editar
                      </button>
                      <button
                        type="button"
                        className={isVisibleInApp ? "ghost-btn" : "soft-btn"}
                        onClick={() => {
                          handleCategoryVisibilityRequest(
                            category,
                            !isVisibleInApp,
                          );
                        }}
                      >
                        <EvaIcon
                          name={isVisibleInApp ? "eye-off" : "eye"}
                          size={14}
                        />{" "}
                        {isVisibleInApp ? "Ocultar" : "Mostrar"}
                      </button>
                      {assignedEvents.length === 0 && (
                        <button
                          type="button"
                          className="danger-btn"
                          onClick={() => {
                            handleDeleteCategoryRequest(category);
                          }}
                        >
                          <EvaIcon name="trash" size={14} /> Eliminar
                        </button>
                      )}
                    </>
                  )}
                </div>

                {isExpanded && (
                  <div className="category-body">
                    <div>
                      <p className="section-label">Agregados a {category}</p>

                      <div className="events-grid">
                        {assignedEvents.length === 0 ? (
                          <div className="empty-inline">
                            Todavia no hay eventos en esta categoria.
                          </div>
                        ) : (
                          assignedEvents.map((event) => (
                            <div className="event-item" key={event.id}>
                              <div className="event-info">
                                <strong>{event.title}</strong>
                                <span>{event.venue}</span>
                              </div>

                              <button
                                type="button"
                                className="danger-btn"
                                onClick={() => {
                                  void handleRemoveEventFromCategory(
                                    event.id,
                                    category,
                                  );
                                }}
                              >
                                <EvaIcon name="minus" size={14} /> Quitar
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <details className="all-events-block">
                      <summary>
                        Ver todos los eventos ({allEvents.length})
                      </summary>

                      <div className="all-events-content">
                        <input
                          value={search}
                          onChange={(e) => {
                            const value = e.target.value;
                            setSearchByCategory((prev) => ({
                              ...prev,
                              [category]: value,
                            }));
                          }}
                          placeholder="Buscar eventos"
                          className="field-input compact"
                        />

                        <div className="events-grid">
                          {allEvents.map((event) => {
                            const alreadyInCategory =
                              normalize(event.category) === normalize(category);

                            return (
                              <div className="event-item" key={event.id}>
                                <div className="event-info">
                                  <strong>{event.title}</strong>
                                  <span>Actual: {event.category}</span>
                                </div>

                                {alreadyInCategory ? (
                                  <span className="added-pill">Agregado</span>
                                ) : (
                                  <button
                                    type="button"
                                    className="soft-btn"
                                    onClick={() => {
                                      void handleAddEventToCategory(
                                        event.id,
                                        category,
                                      );
                                    }}
                                  >
                                    <EvaIcon name="plus" size={14} /> Agregar
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {categoryVisibilityDialog && (
        <AdminConfirmDialog
          title={
            categoryVisibilityDialog.nextVisibleInApp
              ? "Mostrar categoria"
              : "Ocultar categoria"
          }
          description={
            <p>
              {categoryVisibilityDialog.nextVisibleInApp
                ? "La categoria volvera a mostrarse en la app publica."
                : "La categoria dejara de mostrarse en la app publica, pero seguira disponible en admin para editarla o volver a mostrarla."}{" "}
              <strong>{categoryVisibilityDialog.category}</strong>.
            </p>
          }
          confirmLabel={
            categoryVisibilityDialog.nextVisibleInApp
              ? "Si, mostrar"
              : "Si, ocultar"
          }
          onClose={() => setCategoryVisibilityDialog(null)}
          onConfirm={() => {
            void handleConfirmCategoryVisibility();
          }}
        />
      )}

      {removeEventDialog && (
        <AdminConfirmDialog
          title="Quitar evento de categoria"
          description={
            <>
              <p>
                Estas por quitar <strong>{removeEventDialog.eventTitle}</strong>{" "}
                de <strong>{removeEventDialog.currentCategory}</strong>.
              </p>
              <p>
                Si confirmas, el sistema lo movera a{" "}
                <strong>{removeEventDialog.targetCategory}</strong>.
              </p>
            </>
          }
          confirmLabel="Si, quitar"
          onClose={() => setRemoveEventDialog(null)}
          onConfirm={() => {
            void handleConfirmRemoveEvent();
          }}
        />
      )}

      {deleteCategoryDialog && (
        <AdminConfirmDialog
          title="Eliminar categoria"
          description={
            <>
              <p>
                Estas por eliminar{" "}
                <strong>{deleteCategoryDialog.category}</strong>.
              </p>
              <p>Esta accion no se puede deshacer.</p>
            </>
          }
          confirmLabel="Si, eliminar"
          onClose={() => setDeleteCategoryDialog(null)}
          onConfirm={() => {
            void handleConfirmDeleteCategory();
          }}
        />
      )}

      <style>{`
        .surface-card {
          background: var(--bg-surface-1);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 1rem;
        }

        .empty-card {
          text-align: center;
          color: var(--text-disabled);
          font-size: var(--font-sm);
          padding: 1.25rem 1rem;
        }

        .cards-stack {
          display: grid;
          gap: 0.75rem;
        }

        .field-label {
          display: block;
          margin-bottom: 0.5rem;
          font-size: var(--font-xs);
          font-weight: 700;
          color: var(--text-secondary);
        }

        .add-grid {
          display: grid;
          gap: 0.625rem;
          grid-template-columns: 1fr;
        }

        .field-input {
          width: 100%;
          border: 1px solid var(--border-color);
          background: #ffffff;
          color: #1f1f1f;
          border-radius: var(--radius-md);
          padding: 0.625rem 0.75rem;
          font-size: var(--font-sm);
        }

        .field-input.compact {
          padding: 0.5rem 0.625rem;
          font-size: var(--font-xs);
        }

        .primary-btn,
        .soft-btn,
        .ghost-btn,
        .danger-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          border-radius: var(--radius-sm);
          padding: 0.5rem 0.7rem;
          font-size: var(--font-xs);
          font-weight: 700;
          cursor: pointer;
          border: 1px solid transparent;
        }

        .primary-btn {
          border: none;
          border-radius: var(--radius-md);
          background: var(--color-accent);
          color: var(--text-primary);
          padding: 0.625rem 0.875rem;
        }

        .soft-btn {
          border-color: var(--primary-25);
          background: var(--primary-10);
          color: var(--text-primary);
        }

        .ghost-btn {
          border-color: var(--border-color);
          background: transparent;
          color: var(--text-secondary);
        }

        .danger-btn {
          border-color: rgba(255, 80, 80, 0.35);
          background: rgba(255, 80, 80, 0.12);
          color: #ffd0d0;
        }

        .danger-btn:disabled {
          border-color: var(--border-color);
          background: transparent;
          color: var(--text-disabled);
          cursor: not-allowed;
        }

        .category-card {
          padding: 0.875rem;
        }

        .category-header {
          width: 100%;
          border: none;
          background: transparent;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.625rem;
          text-align: left;
          padding: 0;
        }

        .category-left {
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          min-width: 0;
          flex: 1;
        }

        .chevron {
          display: inline-flex;
          color: var(--color-primary);
          transition: transform 0.2s ease;
          margin-top: 0.1rem;
        }

        .category-title-wrap {
          min-width: 0;
          flex: 1;
        }

        .category-title {
          margin: 0;
          font-size: clamp(1rem, 0.95rem + 0.25vw, 1.15rem);
          font-weight: 800;
          color: var(--text-primary);
          overflow-wrap: anywhere;
        }

        .category-meta {
          margin: 0.2rem 0 0;
          font-size: var(--font-xs);
          color: var(--text-disabled);
        }

        .state-pill {
          font-size: var(--font-xs);
          font-weight: 700;
          color: var(--color-primary);
          border: 1px solid var(--primary-25);
          border-radius: var(--radius-full);
          padding: 0.25rem 0.5rem;
          white-space: nowrap;
        }

        .actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.375rem;
          margin-top: 0.75rem;
        }

        .category-body {
          margin-top: 0.75rem;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
          display: grid;
          gap: 0.875rem;
        }

        .section-label {
          margin: 0 0 0.4rem;
          font-size: var(--font-xs);
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .events-grid {
          display: grid;
          gap: 0.5rem;
        }

        .empty-inline {
          border: 1px dashed var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.625rem 0.75rem;
          font-size: var(--font-xs);
          color: var(--text-disabled);
        }

        .event-item {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 0.625rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.625rem;
          flex-wrap: wrap;
        }

        .event-info {
          min-width: 0;
          flex: 1;
          display: grid;
          gap: 0.2rem;
        }

        .event-info strong {
          font-size: var(--font-sm);
          color: var(--text-primary);
          overflow-wrap: anywhere;
        }

        .event-info span {
          font-size: var(--font-xs);
          color: var(--text-disabled);
          overflow-wrap: anywhere;
        }

        .all-events-block {
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-surface-1);
          padding: 0.625rem;
        }

        .all-events-block summary {
          cursor: pointer;
          font-size: var(--font-sm);
          font-weight: 700;
          color: var(--text-primary);
        }

        .all-events-content {
          margin-top: 0.625rem;
          display: grid;
          gap: 0.5rem;
        }

        .added-pill {
          font-size: var(--font-xs);
          font-weight: 700;
          color: var(--color-primary);
          border: 1px solid var(--primary-25);
          border-radius: var(--radius-full);
          padding: 0.35rem 0.55rem;
          white-space: nowrap;
        }

        @media (min-width: 48rem) {
          .add-grid {
            grid-template-columns: 1fr auto;
            align-items: center;
          }

          .category-card {
            padding: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
