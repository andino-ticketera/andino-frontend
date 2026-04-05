import { useState, useEffect } from "react";

export function useMenuToggle() {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar menú cuando se hace click en un link
  useEffect(() => {
    const handleLinkClick = () => {
      setIsOpen(false);
    };

    const links = document.querySelectorAll(".menu-link");
    links.forEach((link) => {
      link.addEventListener("click", handleLinkClick as EventListener);
    });

    return () => {
      links.forEach((link) => {
        link.removeEventListener("click", handleLinkClick as EventListener);
      });
    };
  }, []);

  // Cerrar menú cuando se clickea fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const sidebar = document.querySelector(".dashboard-sidebar");
      const toggleBtn = document.querySelector(".menu-toggle-btn");

      if (
        isOpen &&
        sidebar &&
        toggleBtn &&
        !sidebar.contains(e.target as Node) &&
        !toggleBtn.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return { isOpen, setIsOpen };
}
