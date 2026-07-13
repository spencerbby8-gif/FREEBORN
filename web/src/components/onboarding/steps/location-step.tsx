"use client";

import React, { useState } from "react";
import { onboardingLocationSchema, onboardingFieldHints } from "@freeborn/shared";
import { PinIcon } from "@/components/icons";
import { OnboardingTextInput } from "../onboarding-field";
import { StepShell } from "../step-shell";

export type LocationData = {
  city: string;
  region: string;
  country_code: string;
  location_source: "manual" | "gps";
  latitude: number | null;
  longitude: number | null;
  accuracy_m: number | null;
};

type LocationStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialData: LocationData;
  onBack: () => void;
  onSave: (data: LocationData) => void;
  pending?: boolean;
  saveStatus?: string;
};

export function LocationStep({
  stepIndex,
  totalSteps,
  initialData,
  onBack,
  onSave,
  pending,
  saveStatus,
}: LocationStepProps) {
  const [city, setCity] = useState(initialData.city);
  const [region, setRegion] = useState(initialData.region);
  const [countryCode, setCountryCode] = useState(initialData.country_code);
  const [locationSource, setLocationSource] = useState<"manual" | "gps">(initialData.location_source);
  const [latitude, setLatitude] = useState<number | null>(initialData.latitude);
  const [longitude, setLongitude] = useState<number | null>(initialData.longitude);
  const [accuracyM, setAccuracyM] = useState<number | null>(initialData.accuracy_m);
  const [geoState, setGeoState] = useState<"idle" | "locating" | "granted" | "denied">("idle");
  const [errors, setErrors] = useState<Partial<Record<keyof LocationData, string>>>({});

  const handleRequestLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoState("denied");
      setErrors((prev) => ({ ...prev, location_source: "Location is not available in your browser. Enter city manually." }));
      return;
    }
    setGeoState("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationSource("gps");
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setAccuracyM(pos.coords.accuracy ?? null);
        setGeoState("granted");
        setErrors((prev) => ({ ...prev, location_source: undefined }));
      },
      () => {
        setLocationSource("manual");
        setGeoState("denied");
        setErrors((prev) => ({ ...prev, location_source: "Location permission denied. Enter city manually." }));
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 12000 }
    );
  };

  const handleContinue = (e?: React.FormEvent) => {
    e?.preventDefault();
    const payload: LocationData = {
      city: city.trim(),
      region: region.trim(),
      country_code: countryCode.trim().toUpperCase(),
      location_source: locationSource,
      latitude: locationSource === "gps" ? latitude : null,
      longitude: locationSource === "gps" ? longitude : null,
      accuracy_m: locationSource === "gps" ? accuracyM : null,
    };
    const parsed = onboardingLocationSchema.safeParse(payload);
    if (!parsed.success) {
      const nextErrors: Partial<Record<keyof LocationData, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LocationData;
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    onSave({
      city: parsed.data.city,
      region: parsed.data.region ?? "",
      country_code: parsed.data.country_code ?? "",
      location_source: parsed.data.location_source,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      accuracy_m: parsed.data.accuracy_m ?? null,
    });
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Choose how location should work."
      subtitle="Enter your city manually or allow GPS for better distance matching. Exact coordinates stay private."
      onBack={onBack}
      onContinue={handleContinue}
      pending={pending}
      saveStatus={saveStatus}
      footerTip="Public profiles show city and optional region only. GPS coordinates are stored privately."
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            setLocationSource("manual");
            if (errors.location_source) setErrors((prev) => ({ ...prev, location_source: undefined }));
          }}
          className={`rounded-2xl border p-4 text-left transition ${
            locationSource === "manual"
              ? "border-[var(--color-gold-500)] bg-[var(--color-gold-500)]/10 text-[var(--color-pearl)]"
              : "border-white/10 bg-white/[0.03] text-[var(--color-mist)] hover:bg-white/[0.06]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-black text-sm">Manual city entry</span>
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-sand)]">
              Public only
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 opacity-80">
            Type the city you want shown on your profile. No exact coordinates are saved.
          </p>
        </button>

        <button
          type="button"
          onClick={handleRequestLocation}
          className={`rounded-2xl border p-4 text-left transition ${
            locationSource === "gps"
              ? "border-[var(--color-teal-500)] bg-[var(--color-teal-500)]/10 text-[var(--color-pearl)]"
              : "border-white/10 bg-white/[0.03] text-[var(--color-mist)] hover:bg-white/[0.06]"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-black text-sm">Use current location</span>
            <span className="rounded-full bg-[var(--color-teal-500)]/15 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[var(--color-teal-300)]">
              Private GPS
            </span>
          </div>
          <p className="mt-2 text-xs leading-5 opacity-80">
            We use coordinates only for distance sorting. Your profile shows the public city below.
          </p>
          <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-[var(--color-teal-300)]">
            {geoState === "locating"
              ? "Requesting permission…"
              : geoState === "granted" || locationSource === "gps"
                ? "Private coordinates ready"
                : "Allow GPS permission"}
          </p>
        </button>
      </div>

      {errors.location_source ? (
        <p className="text-xs font-bold text-red-400">{errors.location_source}</p>
      ) : null}

      {locationSource === "gps" && latitude !== null && longitude !== null ? (
        <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-teal-500)]/20 bg-[var(--color-teal-500)]/[0.06] p-3.5 text-xs text-[var(--color-mist)]">
          <PinIcon size={16} className="text-[var(--color-teal-300)] shrink-0" />
          <span>
            <strong className="text-[var(--color-pearl)]">GPS active.</strong> Public display remains your city below.
          </span>
        </div>
      ) : null}

      <OnboardingTextInput
        label="Public city"
        name="city"
        placeholder="e.g. Austin"
        value={city}
        error={errors.city}
        hint="Only this city is shown publicly on discovery cards."
        autoComplete="address-level2"
        onChange={(e) => {
          setCity(e.target.value);
          if (errors.city) setErrors((prev) => ({ ...prev, city: undefined }));
        }}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <OnboardingTextInput
          label="Region / State"
          name="region"
          placeholder="e.g. Texas"
          value={region}
          error={errors.region}
          hint={onboardingFieldHints.region}
          optional
          autoComplete="address-level1"
          onChange={(e) => {
            setRegion(e.target.value);
            if (errors.region) setErrors((prev) => ({ ...prev, region: undefined }));
          }}
        />

        <OnboardingTextInput
          label="Country code"
          name="country_code"
          placeholder="e.g. US"
          value={countryCode}
          error={errors.country_code}
          hint={onboardingFieldHints.country_code}
          optional
          autoComplete="country"
          maxLength={2}
          onChange={(e) => {
            setCountryCode(e.target.value.toUpperCase());
            if (errors.country_code) setErrors((prev) => ({ ...prev, country_code: undefined }));
          }}
        />
      </div>
    </StepShell>
  );
}
