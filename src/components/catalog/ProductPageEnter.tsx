"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "gsap";

export function ProductPageEnter({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      // Hide synchronously in the same tick — no flash before animation
      gsap.set("[data-enter='nav']",     { opacity: 0, y: -10 });
      gsap.set("[data-enter='gallery']", { opacity: 0, x: -28 });
      gsap.set("[data-enter='info'] > *", { opacity: 0, y: 20 });

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to("[data-enter='nav']",      { opacity: 1, y: 0, duration: 0.4,  clearProps: "transform,opacity" }, 0);
      tl.to("[data-enter='gallery']",  { opacity: 1, x: 0, duration: 0.6,  clearProps: "transform,opacity" }, 0.06);
      tl.to("[data-enter='info'] > *", { opacity: 1, y: 0, duration: 0.45, clearProps: "transform,opacity", stagger: 0.07 }, 0.14);
    }, el);

    return () => ctx.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
