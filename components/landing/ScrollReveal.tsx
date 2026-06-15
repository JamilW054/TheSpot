"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScrollReveal({ children, className = "", delay = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Hide synchronously — same JS tick, no visible flash
    gsap.set(el, { opacity: 0, y: 28 });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.unobserve(el);
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay: delay / 1000,
          ease: "power3.out",
          clearProps: "transform,opacity",
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -32px 0px" },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      // Ensure element is always visible if unmounted mid-animation
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "all" });
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
