"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Fade from "embla-carousel-fade";
import Image from "next/image";
import type { Event } from "@/data/events";
import EvaIcon from "./EvaIcon";

interface HeroCarouselProps {
  events: Event[];
  onReserve: (event: Event) => void;
  onDetails: (event: Event) => void;
}

export default function HeroCarousel({ events, onReserve }: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Fade()]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const isPaused = useRef(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => {
      if (!isPaused.current) emblaApi.scrollNext();
    }, 6000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (events.length === 0) {
    return (
      <section
        data-nav-section="hero"
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-color)",
          minHeight: "clamp(14rem, 30vw, 20rem)",
          display: "grid",
          placeItems: "center",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
        }}
      >
        <p style={{ color: "var(--text-disabled)", fontWeight: 600 }}>
          No hay eventos configurados en el carrusel.
        </p>
      </section>
    );
  }

  return (
    <section
      data-nav-section="hero"
      style={{ position: "relative", width: "100%" }}
      onMouseEnter={() => {
        isPaused.current = true;
      }}
      onMouseLeave={() => {
        isPaused.current = false;
      }}
    >
      <div className="embla" ref={emblaRef}>
        <div className="embla__container">
          {events.map((event) => (
            <div key={event.id} className="embla__slide">
              <div className="hero-slide" style={{ position: "relative" }}>
                {/* Blurred background fill — prevents empty bars on portrait images */}
                <Image
                  src={event.image}
                  alt=""
                  fill
                  sizes="100vw"
                  aria-hidden="true"
                  style={{
                    objectFit: "cover",
                    filter: "blur(24px) brightness(0.4)",
                    transform: "scale(1.15)",
                  }}
                />
                {/* Main image — contain ensures no cropping */}
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  priority
                  sizes="100vw"
                  style={{ objectFit: "contain", objectPosition: "center" }}
                />

                {/* Gradient overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, var(--bg-base) 0%, rgba(42,19,66,0.7) 40%, rgba(42,19,66,0.35) 100%)",
                    zIndex: 1,
                  }}
                />

                {/* Content — LEFT aligned */}
                <div
                  className="hero-content"
                  style={{
                    position: "relative",
                    zIndex: 2,
                    maxWidth: "1280px",
                    margin: "0 auto",
                    width: "100%",
                    padding: "0 3rem 4.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    textAlign: "left",
                  }}
                >
                  {/* Tags */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: "var(--font-xs)",
                          fontWeight: 700,
                          padding: "0.375rem 0.875rem",
                          borderRadius: "var(--radius-full)",
                          letterSpacing: "0.05em",
                          ...(tag === "EVENTO DESTACADO"
                            ? {
                                background: "var(--color-accent)",
                                color: "var(--text-primary)",
                              }
                            : {
                                background: "var(--primary-15)",
                                color: "var(--color-primary)",
                                border: "1px solid var(--primary-35)",
                              }),
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h1
                    style={{
                      fontSize: "var(--font-3xl)",
                      fontWeight: 900,
                      color: "var(--text-primary)",
                      lineHeight: "var(--leading-tight)",
                      marginBottom: "0.75rem",
                      textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                      letterSpacing: "-0.02em",
                      maxWidth: "700px",
                    }}
                  >
                    {event.title}
                  </h1>

                  {/* Description */}
                  <p
                    className="hero-description"
                    style={{
                      fontSize: "var(--font-base)",
                      color: "var(--text-secondary)",
                      lineHeight: "var(--leading-relaxed)",
                      marginBottom: "1.25rem",
                      maxWidth: "560px",
                    }}
                  >
                    {event.description}
                  </p>

                  {/* Date / Time / Venue inline */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "1.25rem",
                      marginBottom: "1.75rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <span style={{ color: "var(--color-primary)" }}>
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
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <span style={{ color: "var(--color-primary)" }}>
                        <EvaIcon name="clock" size={16} />
                      </span>
                      <span
                        style={{
                          fontSize: "var(--font-sm)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {event.time} hs
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.375rem",
                      }}
                    >
                      <span style={{ color: "var(--color-primary)" }}>
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

                  {/* Buttons */}
                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      className="btn-primary"
                      onClick={() => onReserve(event)}
                      style={{
                        background: "var(--color-accent)",
                        color: "var(--text-primary)",
                        fontSize: "var(--font-sm)",
                        fontWeight: 700,
                        padding: "0.875rem 1.75rem",
                        borderRadius: "var(--radius-full)",
                        border: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      Reservar Entrada
                      <EvaIcon name="arrow-right" size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nav arrows */}
      <button
        className="hero-arrow hero-arrow-prev"
        onClick={scrollPrev}
        aria-label="Anterior"
      >
        <EvaIcon name="chevron-left" size={24} />
      </button>
      <button
        className="hero-arrow hero-arrow-next"
        onClick={scrollNext}
        aria-label="Siguiente"
      >
        <EvaIcon name="chevron-right" size={24} />
      </button>

      {/* Thumbnail strip at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: "1.25rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "0.5rem",
          zIndex: 3,
        }}
      >
        {events.map((event, i) => (
          <button
            key={event.id}
            onClick={() => emblaApi?.scrollTo(i)}
            style={{
              width: i === selectedIndex ? "80px" : "56px",
              height: "40px",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
              border:
                i === selectedIndex
                  ? "2px solid var(--color-primary)"
                  : "2px solid transparent",
              opacity: i === selectedIndex ? 1 : 0.6,
              cursor: "pointer",
              transition: "all 0.3s ease",
              position: "relative",
              padding: 0,
              background: "none",
            }}
            aria-label={`Ir a ${event.title}`}
          >
            <Image
              src={event.image}
              alt={event.title}
              fill
              sizes="80px"
              style={{ objectFit: "cover", objectPosition: "center 20%" }}
            />
          </button>
        ))}
      </div>

      <style>{`
        .hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.15);
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 3;
          transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
        }
        .hero-arrow:hover {
          background: rgba(0,0,0,0.5);
          border-color: rgba(255,255,255,0.3);
        }
        .hero-arrow-prev { left: 16px; }
        .hero-arrow-next { right: 16px; }

        @media (max-width: 640px) {
          .hero-content { padding: 0 24px 80px !important; }
          .hero-arrow {
            width: 36px;
            height: 36px;
            background: rgba(0,0,0,0.2);
            border-color: rgba(255,255,255,0.1);
            opacity: 0.6;
            top: auto;
            bottom: 24px;
            transform: none;
          }
          .hero-arrow:hover { opacity: 1; }
          .hero-arrow-prev { left: 12px; }
          .hero-arrow-next { right: 12px; }
          .hero-content { padding: 0 20px 80px !important; }
        }
      `}</style>
    </section>
  );
}
