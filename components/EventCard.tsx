import Image from "next/image";
import type { Event } from "@/data/events";
import EvaIcon from "./EvaIcon";

interface EventCardProps {
  event: Event;
  onReserve: (event: Event) => void;
}

export default function EventCard({ event, onReserve }: EventCardProps) {
  return (
    <div
      className="event-card"
      style={{
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--bg-surface-1)",
        border: "1px solid var(--border-color-50)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Image */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          background: "#12091f",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Image
          src={event.flyer}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          className="event-card-img"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            zIndex: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(51,26,82,0.55), transparent)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          padding: "1.25rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3
          style={{
            fontSize: "var(--font-lg)",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.75rem",
            lineHeight: "var(--leading-snug)",
            minHeight: "2.6em",
          }}
        >
          {event.title}
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.375rem",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>
              <EvaIcon name="calendar" size={16} />
            </span>
            <span
              style={{
                fontSize: "var(--font-sm)",
                color: "var(--text-secondary)",
              }}
            >
              {event.date}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>
              <EvaIcon name="clock" size={16} />
            </span>
            <span
              style={{
                fontSize: "var(--font-sm)",
                color: "var(--text-secondary)",
              }}
            >
              {event.time}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ color: "var(--color-primary)", flexShrink: 0 }}>
              <EvaIcon name="pin" size={16} />
            </span>
            <span
              style={{
                fontSize: "var(--font-sm)",
                color: "var(--text-secondary)",
              }}
            >
              {event.venue}
            </span>
          </div>
        </div>

        {/* Reservar button */}
        <div style={{ marginTop: "auto" }}>
          <button
            className="btn-primary"
            onClick={() => onReserve(event)}
            style={{
              width: "100%",
              background: "var(--color-accent)",
              color: "var(--text-primary)",
              fontSize: "var(--font-sm)",
              fontWeight: 700,
              padding: "0.75rem 1.25rem",
              borderRadius: "var(--radius-md)",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            Reservar Entrada
            <EvaIcon name="arrow-right" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
