import type { ReactNode } from "react";

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  /** Adds top/bottom vertical padding */
  padY?: boolean;
};

/**
 * A centered, max-width section container used across marketing pages.
 */
export function Section({
  id,
  children,
  className = "",
  containerClassName = "",
  padY = true,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`relative w-full ${padY ? "py-24 sm:py-28 lg:py-32" : ""} ${className}`}
    >
      <div
        className={`mx-auto w-full max-w-[1200px] px-6 sm:px-8 lg:px-10 ${containerClassName}`}
      >
        {children}
      </div>
    </section>
  );
}
