"use client";

import { useEffect } from "react";
import EvaIcon from "@/components/EvaIcon";

interface AdminConfirmDialogProps {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  iconName?: "trash" | "minus" | "close";
  onConfirm: () => void;
  onClose: () => void;
}

export default function AdminConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  iconName = "trash",
  onConfirm,
  onClose,
}: AdminConfirmDialogProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="admin-confirm-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="admin-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="admin-confirm-icon-wrap">
          <EvaIcon name={iconName} size={18} />
        </div>

        <div className="admin-confirm-copy">
          <h2 id="admin-confirm-title">{title}</h2>
          <div>{description}</div>
        </div>

        <div className="admin-confirm-actions">
          <button
            type="button"
            className="admin-confirm-btn admin-confirm-btn-secondary"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="admin-confirm-btn admin-confirm-btn-danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        .admin-confirm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: rgba(7, 10, 18, 0.7);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .admin-confirm-dialog {
          width: min(100%, 26rem);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1rem;
          background:
            linear-gradient(180deg, rgba(20, 26, 40, 0.98), rgba(11, 15, 24, 0.98));
          box-shadow: 0 24px 64px rgba(0, 0, 0, 0.35);
          padding: 1rem;
          display: grid;
          gap: 0.9rem;
        }

        .admin-confirm-icon-wrap {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffd0d0;
          background: rgba(255, 80, 80, 0.14);
          border: 1px solid rgba(255, 80, 80, 0.24);
        }

        .admin-confirm-copy {
          display: grid;
          gap: 0.45rem;
        }

        .admin-confirm-copy h2 {
          margin: 0;
          font-size: clamp(1rem, 0.92rem + 0.45vw, 1.2rem);
          font-weight: 800;
          color: var(--text-primary);
        }

        .admin-confirm-copy div {
          display: grid;
          gap: 0.45rem;
        }

        .admin-confirm-copy p {
          margin: 0;
          font-size: var(--font-sm);
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .admin-confirm-copy strong {
          color: var(--text-primary);
        }

        .admin-confirm-actions {
          display: grid;
          gap: 0.5rem;
        }

        .admin-confirm-btn {
          width: 100%;
          min-height: 2.75rem;
          border-radius: var(--radius-sm);
          border: 1px solid transparent;
          font-size: var(--font-xs);
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.625rem 0.875rem;
        }

        .admin-confirm-btn-secondary {
          border-color: var(--border-color);
          background: transparent;
          color: var(--text-secondary);
        }

        .admin-confirm-btn-danger {
          border-color: rgba(255, 80, 80, 0.35);
          background: rgba(255, 80, 80, 0.12);
          color: #ffd0d0;
        }

        @media (min-width: 48rem) {
          .admin-confirm-dialog {
            padding: 1.15rem;
          }

          .admin-confirm-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
