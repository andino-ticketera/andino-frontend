interface EventGridSkeletonProps {
  count?: number;
}

interface FlyerGridSkeletonProps {
  count?: number;
}

function SkeletonLine({ width }: { width: string }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        height: "0.625rem",
        width,
        borderRadius: "999px",
      }}
    />
  );
}

export function EventGridSkeleton({ count = 6 }: EventGridSkeletonProps) {
  return (
    <div
      className="event-grid-skeleton"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "1rem",
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`event-skeleton-${index}`}
          style={{
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color-50)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="skeleton-shimmer"
            style={{
              height: "13.75rem",
              width: "100%",
            }}
          />

          <div
            style={{
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.875rem",
            }}
          >
            <div style={{ display: "grid", gap: "0.5rem" }}>
              <SkeletonLine width="82%" />
              <SkeletonLine width="64%" />
            </div>

            <div style={{ display: "grid", gap: "0.5rem" }}>
              <SkeletonLine width="60%" />
              <SkeletonLine width="54%" />
              <SkeletonLine width="68%" />
            </div>

            <div
              className="skeleton-shimmer"
              style={{
                height: "2.625rem",
                width: "100%",
                borderRadius: "var(--radius-md)",
                marginTop: "0.25rem",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FlyerGridSkeleton({ count = 8 }: FlyerGridSkeletonProps) {
  return (
    <div
      className="flyer-grid-skeleton"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: "1.25rem",
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`flyer-skeleton-${index}`}
          style={{
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            background: "var(--bg-surface-1)",
            border: "1px solid var(--border-color-50)",
          }}
        >
          <div
            className="skeleton-shimmer"
            style={{
              aspectRatio: "9 / 16",
              width: "100%",
            }}
          />
        </div>
      ))}
    </div>
  );
}
