"use client";

import { useEffect, useRef } from "react";

export function useScrollReveal<T extends HTMLElement>(staggerDelay = 80) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const children = container.querySelectorAll(".card-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const index = Array.from(children).indexOf(el);
            const delay = Math.min(index * staggerDelay, 300);
            setTimeout(() => {
              el.classList.add("visible");
            }, delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -10px 0px" },
    );

    children.forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [staggerDelay]);

  return ref;
}
