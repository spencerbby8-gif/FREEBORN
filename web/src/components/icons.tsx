/**
 * Freeborn Icons
 * A cohesive 1.5px-stroke icon set — rounded, warm, softly drawn.
 * All icons accept `size` and `className`; they inherit `currentColor`.
 */

type IconProps = {
  size?: number;
  className?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

function Base({
  size = 22,
  className = "",
  children,
  strokeWidth = 1.6,
  style,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* Ember / spark — the primary brand mark */
export function SparkIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3c1.8 3.5 4.5 5 4.5 8.2a4.5 4.5 0 1 1-9 0C7.5 8 10.2 6.5 12 3z" />
      <path d="M10 16c0-1.5 1-2 2-3" />
    </Base>
  );
}

/* Heart with ember flick */
export function HeartIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M20.5 7.5a5 5 0 0 0-8.5-3 5 5 0 0 0-8.5 3c0 5.5 8.5 11 8.5 11s8.5-5.5 8.5-11z" />
      <path d="M12 7.5c-.4 1-.9 1.4-1.6 1.8" />
    </Base>
  );
}

/* Chat bubble */
export function ChatIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H9l-4 3v-3H6.5A2.5 2.5 0 0 1 4 14.5z" />
      <path d="M8 10h8M8 13h5" />
    </Base>
  );
}

/* User / profile */
export function UserIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M4.5 20c1.2-3.5 4-5.5 7.5-5.5s6.3 2 7.5 5.5" />
    </Base>
  );
}

/* Shield / trust */
export function ShieldIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 3l7.5 2.8v5.4c0 4.6-3.2 8.3-7.5 9.8-4.3-1.5-7.5-5.2-7.5-9.8V5.8L12 3z" />
      <path d="m9 12.2 2.2 2.2L16 10" />
    </Base>
  );
}

/* Lock / privacy */
export function LockIcon(p: IconProps) {
  return (
    <Base {...p}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      <circle cx="12" cy="15.5" r="1" />
    </Base>
  );
}

/* Sparkle / magic */
export function SparkleIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 4v4M12 16v4M4 12h4M16 12h4" />
      <path d="M7 7l2 2M15 15l2 2M17 7l-2 2M9 15l-2 2" />
    </Base>
  );
}

/* Arrow */
export function ArrowIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  );
}

/* Check */
export function CheckIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Base>
  );
}

/* Quote mark */
export function QuoteIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M7 8c-2 0-3 1.5-3 3.5S5 15 7 15c0-2 1-3 3-3V8z" />
      <path d="M14 8c-2 0-3 1.5-3 3.5S12 15 14 15c0-2 1-3 3-3V8z" />
    </Base>
  );
}

/* Compass / discover */
export function CompassIcon(p: IconProps) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-4 2-2 4 4-2z" />
    </Base>
  );
}

/* Star */
export function StarIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m12 4 2.4 5 5.6.8-4 4 1 5.7L12 17l-5 2.5 1-5.7-4-4 5.6-.8z" />
    </Base>
  );
}

/* Close */
export function CloseIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  );
}

/* Map pin */
export function PinIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </Base>
  );
}

/* Verified badge */
export function BadgeIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="m12 3 2.2 1.5 2.6-.3.8 2.5 2.2 1.5-1 2.4 1 2.4-2.2 1.5-.8 2.5-2.6-.3L12 21l-2.2-1.5-2.6.3-.8-2.5L4.2 15.8l1-2.4-1-2.4 2.2-1.5.8-2.5 2.6.3z" />
      <path d="m9 12.2 2 2 4-4.2" />
    </Base>
  );
}

/* Camera / photos */
export function CameraIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.4-2h4.2l1.4 2h2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </Base>
  );
}

/* Eye — profile views */
export function EyeIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </Base>
  );
}

/* Menu */
export function MenuIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Base>
  );
}

/* X / dismiss (small) */
export function XIcon(p: IconProps) {
  return (
    <Base {...p} strokeWidth={2}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Base>
  );
}

/* Play — testimonial */
export function PlayIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M7 5v14l12-7z" />
    </Base>
  );
}

/* Apple-style download-ish */
export function DownloadIcon(p: IconProps) {
  return (
    <Base {...p}>
      <path d="M12 4v11M7 10l5 5 5-5" />
      <path d="M5 19h14" />
    </Base>
  );
}

/* Google — for social button */
export function GoogleGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

/* Apple logo */
export function AppleLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.94-3.08.47-1.08-.48-2.07-.49-3.23 0-1.4.61-2.15.44-3.03-.47C4.6 17.32 5.15 11.3 8.7 11c1.01.08 1.8.56 2.51.61.93-.17 1.83-.68 2.91-.64 1.22.05 2.18.5 2.84 1.29-2.54 1.52-1.95 4.65.42 5.42-.35 1-0.82 1.98-1.33 2.6zM14.93 3.5c.5-.61.84-1.48.75-2.34-.78.04-1.72.53-2.27 1.15-.49.55-.91 1.45-.78 2.29.87.06 1.75-.44 2.3-1.1z"/>
    </svg>
  );
}
