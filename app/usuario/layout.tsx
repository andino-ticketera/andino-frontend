import type { ReactNode } from "react";
import UserSidebar from "@/components/usuario/UserSidebar";

export default function UsuarioLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-base)" }}>
      <UserSidebar />

      <main
        className="usuario-main"
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
          .usuario-main {
            margin-left: 0 !important;
            padding: 1rem 1rem !important;
            padding-top: 5rem !important;
          }
        }

        @media (max-width: 480px) {
          .usuario-main {
            padding: 0.75rem !important;
            padding-top: 4.5rem !important;
          }
        }
      `}</style>
    </div>
  );
}
