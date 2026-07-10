"use client";

import { useEffect, useRef, type ReactNode, type ElementType } from "react";

type RevealProps<T extends ElementType = "div"> = {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3 | 4;
  as?: T;
  className?: string;
};

/**
 * Fade + rise children into view the first time they intersect the viewport.
 * Uses IntersectionObserver — no heavy animation libraries.
 */
export function Reveal<T extends ElementType = "div">({
  children,
  delay = 0,
  as,
  className = "",
}: RevealProps<T>) {
  const Tag = (as ?? "div") as ElementType;
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delayClass = delay > 0 ? `delay-${delay}` : "";
  const cls = `reveal ${delayClass} ${className}`.trim();

  return (
    <Tag ref={ref} className={cls}>
      {children}
    </Tag>
  );
}
