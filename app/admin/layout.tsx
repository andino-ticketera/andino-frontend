import type { ReactNode } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminToastHost from "../../components/admin/AdminToastHost";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <AdminSidebar />
      <AdminToastHost />

      <main
        className="admin-main"
        style={{ marginLeft: "260px", padding: "2rem 1.5rem" }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
          }}
        >
          {children}
        </div>
      </main>

      <style>{`
        @media (max-width: 768px) {
          .admin-main {
            margin-left: 0 !important;
            padding: 1rem 1rem !important;
            padding-top: 5rem !important;
          }
        }

        @media (max-width: 480px) {
          .admin-main {
            padding: 0.75rem !important;
            padding-top: 4.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
