"use client";

import { useEffect } from "react";
import EvaIcon from "@/components/EvaIcon";

interface AppConfirmDialogProps {
  title: string;
  description: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  iconName?: "trash" | "minus" | "close";
  onConfirm: () => void;
  onClose: () => void;
}

export default function AppConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  iconName = "trash",
  onConfirm,
  onClose,
}: AppConfirmDialogProps) {
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
    <div className="app-confirm-overlay" onClick={onClose} role="presentation">
      <div
        className="app-confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="app-confirm-halo" aria-hidden="true" />

        <div className="app-confirm-icon-wrap">
          <EvaIcon name={iconName} size={18} />
        </div>

        <div className="app-confirm-copy">
          <h2 id="app-confirm-title">{title}</h2>
          <div>{description}</div>
        </div>

        <div className="app-confirm-actions">
          <button
            type="button"
            className="app-confirm-btn app-confirm-btn-secondary"
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="app-confirm-btn app-confirm-btn-danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        .app-confirm-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 0.875rem;
          background: rgba(6, 9, 18, 0.76);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .app-confirm-dialog {
          position: relative;
          overflow: hidden;
          width: min(100%, 28rem);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 1.25rem;
          background:
            radial-gradient(circle at top, rgba(92, 255, 157, 0.12), transparent 38%),
            linear-gradient(180deg, rgba(18, 24, 38, 0.98), rgba(11, 15, 24, 0.98));
          box-shadow: 0 22px 54px rgba(0, 0, 0, 0.38);
          padding: 1rem;
          display: grid;
          gap: 0.9rem;
          animation: app-confirm-enter 180ms ease-out;
        }

        .app-confirm-halo {
          position: absolute;
          inset: auto -18% 72% auto;
          width: 9rem;
          height: 9rem;
          border-radius: 999px;
          background: radial-gradient(circle, rgba(92, 255, 157, 0.18), transparent 70%);
          pointer-events: none;
        }

        .app-confirm-icon-wrap {
          width: 2.75rem;
          height: 2.75rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffd0d0;
          background: rgba(255, 80, 80, 0.14);
          border: 1px solid rgba(255, 80, 80, 0.24);
        }

        .app-confirm-copy {
          display: grid;
          gap: 0.45rem;
        }

        .app-confirm-copy h2 {
          margin: 0;
          font-size: clamp(1rem, 0.92rem + 0.45vw, 1.2rem);
          font-weight: 800;
          color: var(--text-primary);
        }

        .app-confirm-copy div {
          display: grid;
          gap: 0.45rem;
        }

        .app-confirm-copy p {
          margin: 0;
          font-size: var(--font-sm);
          line-height: 1.5;
          color: var(--text-secondary);
        }

        .app-confirm-copy strong {
          color: var(--text-primary);
        }

        .app-confirm-actions {
          display: grid;
          gap: 0.55rem;
        }

        .app-confirm-btn {
          width: 100%;
          min-height: 2.9rem;
          border-radius: 0.95rem;
          border: 1px solid transparent;
          font-size: var(--font-xs);
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 0.95rem;
          transition: transform 0.18s ease, border-color 0.18s ease, background 0.18s ease;
        }

        .app-confirm-btn:active {
          transform: translateY(1px);
        }

        .app-confirm-btn-secondary {
          border-color: rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-secondary);
        }

        .app-confirm-btn-danger {
          border-color: rgba(255, 80, 80, 0.32);
          background: linear-gradient(180deg, rgba(255, 80, 80, 0.2), rgba(255, 80, 80, 0.12));
          color: #ffe3e3;
        }

        @keyframes app-confirm-enter {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (min-width: 48rem) {
          .app-confirm-overlay {
            align-items: center;
            padding: 1rem;
          }

          .app-confirm-dialog {
            padding: 1.15rem;
          }

          .app-confirm-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
