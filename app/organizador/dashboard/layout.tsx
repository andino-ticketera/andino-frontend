"use client";

import type { ReactNode } from "react";
import { OrganizerProvider } from "@/context/OrganizerContext";
import OrganizerSidebar from "@/components/organizador/OrganizerSidebar";
import OrganizerToastHost from "@/components/organizador/OrganizerToastHost";

export default function OrganizerDashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <OrganizerProvider>
      <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
        <OrganizerSidebar />
        <OrganizerToastHost />

        <main
          className="org-main"
          style={{ marginLeft: "260px", padding: "2rem 1.5rem" }}
        >
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>{children}</div>
        </main>

        <style>{`
          @media (max-width: 768px) {
            .org-main {
              margin-left: 0 !important;
              padding: 1rem !important;
              padding-top: 5rem !important;
            }
          }

          @media (max-width: 480px) {
            .org-main {
              padding: 0.75rem !important;
              padding-top: 4.5rem !important;
            }
          }
        `}</style>
      </div>
    </OrganizerProvider>
  );
}
