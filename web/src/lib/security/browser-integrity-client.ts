"use client";

/**
 * The ONLY place the app reads device properties for verification, and it reads seven coarse
 * values. It writes nothing: no cookie, no localStorage / AsyncStorage entry, no identifier —
 * which is the specific thing a competitor's public bundle does that this deliberately does not.
 *
 * Kept in its own module so `browser-integrity.test.mjs` can assert "this file touches no
 * device fingerprinting API" against the whole file. That assertion would be unsatisfiable if
 * these reads lived inside the verification flow, because the flow legitimately opens a camera
 * stream and reads a canvas to snapshot a frame.
 */
import type { BrowserObservations } from "./browser-integrity";

/** Coarse observations for the server's consistency checks. Never throws: a privacy-mode or
 *  non-browser environment simply reports nothing, and an empty report yields no opinion. */
export function browserObservations(): BrowserObservations {
  if (typeof navigator === "undefined") return {};
  try {
    const nav = navigator as Navigator & {
      userAgentData?: { platform?: string };
      permissions?: unknown;
    };
    return {
      timezoneOffsetMinutes: new Date().getTimezoneOffset(),
      language: nav.language,
      maxTouchPoints: nav.maxTouchPoints,
      claimedPlatform: nav.userAgentData?.platform,
      hasCameraApi: Boolean(nav.mediaDevices?.getUserMedia),
      hasPermissionsApi: typeof nav.permissions?.query === "function",
      secureContext: typeof window !== "undefined" ? window.isSecureContext === true : false,
    };
  } catch {
    return {};
  }
}
