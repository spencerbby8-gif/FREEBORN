/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ProfilePhoto } from "@freeborn/shared";
import { uploadProfilePhoto, deleteProfilePhoto, reorderPhotos, setPrimaryPhoto } from "@/lib/photos/actions";
import { StepShell } from "../step-shell";

type Notice = { tone: "success" | "error"; title: string; body: string };
type QualityTone = "pass" | "warn" | "fail" | "pending";
type PhotoQualityCheck = { id: string; label: string; tone: QualityTone; body: string };
type PhotoQualityReport = { score: number; blocked: boolean; hash: string | null; checks: PhotoQualityCheck[] };

function publicPhotoUrl(path: string) {
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

async function cropImageToFile(file: File, crop: { x: number; y: number; zoom: number }): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const targetW = 1080;
    const targetH = 1350;
    const targetAspect = targetW / targetH;
    let sourceW = img.naturalWidth / crop.zoom;
    let sourceH = sourceW / targetAspect;
    if (sourceH > img.naturalHeight / crop.zoom) {
      sourceH = img.naturalHeight / crop.zoom;
      sourceW = sourceH * targetAspect;
    }
    const maxX = Math.max(0, img.naturalWidth - sourceW);
    const maxY = Math.max(0, img.naturalHeight - sourceH);
    const sx = maxX * (crop.x / 100);
    const sy = maxY * (crop.y / 100);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is unavailable.");
    ctx.drawImage(img, sx, sy, sourceW, sourceH, 0, 0, targetW, targetH);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((next) => (next ? resolve(next) : reject(new Error("Could not prepare crop."))), "image/jpeg", 0.9);
    });
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "-freeborn.jpg", { type: "image/jpeg" });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function hammingDistance(a: string, b: string) {
  let distance = 0;
  const length = Math.min(a.length, b.length);
  for (let i = 0; i < length; i += 1) if (a[i] !== b[i]) distance += 1;
  return distance + Math.abs(a.length - b.length);
}

async function analyzeImageFile(file: File, existingHashes: string[]): Promise<PhotoQualityReport> {
  const url = URL.createObjectURL(file);
  const checks: PhotoQualityCheck[] = [];
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = url;
    });

    const width = img.naturalWidth;
    const height = img.naturalHeight;
    const shortSide = Math.min(width, height);
    const longSide = Math.max(width, height);
    checks.push(
      shortSide < 640 || longSide < 900
        ? { id: "resolution", label: "Resolution", tone: "fail", body: "This image is too small for a premium profile card. Choose a larger photo." }
        : shortSide < 900 || longSide < 1200
          ? { id: "resolution", label: "Resolution", tone: "warn", body: "Usable, but a larger photo will look sharper." }
          : { id: "resolution", label: "Resolution", tone: "pass", body: `${width} × ${height}px looks crisp and clear.` },
    );

    const sample = document.createElement("canvas");
    sample.width = 64;
    sample.height = 64;
    const ctx = sample.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("Canvas unavailable.");
    ctx.drawImage(img, 0, 0, sample.width, sample.height);
    const data = ctx.getImageData(0, 0, sample.width, sample.height).data;
    const lumas: number[] = [];
    for (let i = 0; i < data.length; i += 4) {
      lumas.push(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    }
    const avg = lumas.reduce((sum, val) => sum + val, 0) / lumas.length;
    checks.push(
      avg < 45
        ? { id: "brightness", label: "Brightness", tone: "fail", body: "This photo is very dark. Pick one with more light." }
        : avg < 70
          ? { id: "brightness", label: "Brightness", tone: "warn", body: "A brighter photo feels warmer and clearer." }
          : { id: "brightness", label: "Brightness", tone: "pass", body: "Lighting looks clear enough for discovery." },
    );

    const sorted = [...lumas].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)] ?? avg;
    const hash = lumas.map((val) => (val >= median ? "1" : "0")).join("");
    const duplicate = existingHashes.some((existing) => hammingDistance(existing, hash) <= 7);
    checks.push(
      duplicate
        ? { id: "duplicate", label: "Duplicate", tone: "fail", body: "This looks nearly identical to a photo already uploaded." }
        : { id: "duplicate", label: "Duplicate", tone: "pass", body: "Unique photo verified." },
    );

    const score = Math.max(20, Math.round((checks.filter((c) => c.tone === "pass").length / checks.length) * 100));
    return { checks, score, hash, blocked: checks.some((c) => c.tone === "fail") };
  } finally {
    URL.revokeObjectURL(url);
  }
}

type PhotosStepProps = {
  stepIndex: number;
  totalSteps: number;
  initialPhotos: ProfilePhoto[];
  onBack: () => void;
  onContinue: (photos: ProfilePhoto[]) => void;
  pending?: boolean;
  saveStatus?: string;
};

export function PhotosStep({
  stepIndex,
  totalSteps,
  initialPhotos,
  onBack,
  onContinue,
  pending,
  saveStatus,
}: PhotosStepProps) {
  const router = useRouter();
  const [photos, setPhotos] = useState<ProfilePhoto[]>(initialPhotos);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 50, y: 50, zoom: 1 });
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [photoNotice, setPhotoNotice] = useState<Notice | null>(null);
  const [qualityReport, setQualityReport] = useState<PhotoQualityReport | null>(null);
  const [sessionHashes, setSessionHashes] = useState<string[]>([]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const chooseFile = async (next: File | null) => {
    setFile(next);
    setProgress(0);
    setPhotoNotice(null);
    setQualityReport(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(next ? URL.createObjectURL(next) : null);
    if (!next) return;
    setAnalyzing(true);
    try {
      const report = await analyzeImageFile(next, sessionHashes);
      setQualityReport(report);
      if (report.blocked) {
        setPhotoNotice({
          tone: "error",
          title: "Choose a clearer photo",
          body: "We found a quality check issue. Review the notes and choose a crisp, recognizable photo.",
        });
      }
    } catch {
      setPhotoNotice({ tone: "error", title: "Review error", body: "Try a different JPG, PNG, or WebP image." });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    if (qualityReport?.blocked) {
      setPhotoNotice({ tone: "error", title: "Fix needed", body: "Please choose a photo that passes basic quality checks." });
      return;
    }
    setUploading(true);
    setPhotoNotice(null);
    try {
      setProgress(20);
      const cropped = await cropImageToFile(file, crop);
      setProgress(50);
      const fd = new FormData();
      fd.set("file", cropped);
      setProgress(75);
      const result = await uploadProfilePhoto(fd);
      if (!result.ok) {
        setPhotoNotice({ tone: "error", title: "Upload failed", body: result.error ?? "Please try a different image." });
        setProgress(0);
        return;
      }
      setProgress(100);
      const nextPhotos = [...photos, result.photo as ProfilePhoto];
      setPhotos(nextPhotos);
      if (qualityReport?.hash) setSessionHashes((prev) => [...prev, qualityReport.hash as string]);
      setPhotoNotice({ tone: "success", title: "Photo added", body: "Your photo was saved and added to your profile card." });
      setFile(null);
      setQualityReport(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      router.refresh();
    } catch {
      setPhotoNotice({ tone: "error", title: "Upload failed", body: "Could not prepare the crop. Try another photo." });
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const movePhoto = async (index: number, direction: -1 | 1) => {
    const next = [...photos];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setPhotos(next.map((photo, position) => ({ ...photo, position })));
    const fd = new FormData();
    fd.set("order", JSON.stringify(next.map((photo) => photo.id)));
    await reorderPhotos(fd);
    router.refresh();
  };

  const makeCover = async (photo: ProfilePhoto) => {
    setPhotos(photos.map((item) => ({ ...item, is_primary: item.id === photo.id })));
    const fd = new FormData();
    fd.set("id", photo.id);
    await setPrimaryPhoto(fd);
    router.refresh();
  };

  const removePhoto = async (photo: ProfilePhoto) => {
    const nextPhotos = photos.filter((item) => item.id !== photo.id);
    setPhotos(nextPhotos);
    const fd = new FormData();
    fd.set("id", photo.id);
    await deleteProfilePhoto(fd);
    router.refresh();
  };

  const handleNext = (e?: React.FormEvent) => {
    e?.preventDefault();
    onContinue(photos);
  };

  return (
    <StepShell
      stepIndex={stepIndex}
      totalSteps={totalSteps}
      title="Add photos that feel recognizable and real."
      subtitle="Upload a recent photo, crop it for your profile card, and select the cover photo."
      onBack={onBack}
      onContinue={handleNext}
      continueLabel={photos.length === 0 ? "Skip for now" : "Continue"}
      pending={pending}
      saveStatus={saveStatus}
      notice={photoNotice}
      footerTip="Best quality: clear solo face on the cover, good lighting, no heavy filters or text overlays."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div className="rounded-[28px] border border-white/10 bg-black/15 p-4 flex flex-col items-center justify-center">
          <div className="relative w-full aspect-[4/5] max-h-[460px] overflow-hidden rounded-[22px] border border-white/10 bg-white/5 flex items-center justify-center">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Crop preview"
                className="h-full w-full object-cover"
                style={{ objectPosition: `${crop.x}% ${crop.y}%`, transform: `scale(${crop.zoom})` }}
              />
            ) : (
              <div className="p-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-gold-500)]/15 text-2xl text-[var(--color-gold-300)]">
                  ＋
                </div>
                <p className="mt-4 font-black text-[var(--color-pearl)]">Upload a photo</p>
                <p className="mt-1 max-w-xs text-xs text-[var(--color-mist)]">
                  Upload and crop right in your browser.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] border border-white/10 bg-white/[0.025] p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <label className="flex min-h-12 cursor-pointer items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-4 text-xs font-black uppercase tracking-widest text-[var(--color-pearl)] transition hover:bg-white/[0.08] active:scale-[0.98]">
              {file ? "Change file" : "Choose file"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => void chooseFile(e.target.files?.[0] ?? null)}
              />
            </label>

            {file ? (
              <div className="space-y-3 animate-scale-in">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Horizontal position</label>
                  <input type="range" min={0} max={100} value={crop.x} onChange={(e) => setCrop((c) => ({ ...c, x: Number(e.target.value) }))} className="w-full accent-[var(--color-gold-500)]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Vertical position</label>
                  <input type="range" min={0} max={100} value={crop.y} onChange={(e) => setCrop((c) => ({ ...c, y: Number(e.target.value) }))} className="w-full accent-[var(--color-gold-500)]" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--color-sand)]">Zoom</label>
                  <input type="range" min={1} max={2.4} step={0.05} value={crop.zoom} onChange={(e) => setCrop((c) => ({ ...c, zoom: Number(e.target.value) }))} className="w-full accent-[var(--color-gold-500)]" />
                </div>

                {uploading && progress > 0 ? (
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[var(--gradient-ember)] transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                ) : null}

                <button
                  type="button"
                  disabled={uploading || analyzing || Boolean(qualityReport?.blocked)}
                  onClick={handleUpload}
                  className="magic-button flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-pearl)] text-xs font-black text-[var(--color-ink)] transition hover:bg-white disabled:opacity-50"
                >
                  {uploading || analyzing ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
                  {analyzing ? "Checking quality…" : uploading ? "Uploading…" : qualityReport?.blocked ? "Quality issue detected" : "Save & add photo"}
                </button>
              </div>
            ) : null}

            {qualityReport ? (
              <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs">
                <div className="flex items-center justify-between font-bold">
                  <span>Quality Check</span>
                  <span className={qualityReport.blocked ? "text-red-300" : "text-emerald-300"}>{qualityReport.score}%</span>
                </div>
                {qualityReport.checks.map((c) => (
                  <div key={c.id} className="text-[11px] opacity-80 leading-4">
                    <strong>{c.label}:</strong> {c.body}
                  </div>
                ))}
              </div>
            ) : analyzing ? (
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center text-xs opacity-75">
                Reviewing resolution and lighting…
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => {
          const url = publicPhotoUrl(photo.storage_path);
          return (
            <div key={photo.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="relative aspect-[4/5] bg-black/30">
                {url ? <img src={url} alt={`Profile photo ${index + 1}`} className="h-full w-full object-cover" /> : null}
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  <span className="rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white backdrop-blur">
                    #{index + 1}
                  </span>
                  {photo.is_primary ? (
                    <span className="rounded-full bg-[var(--color-gold-500)] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[var(--color-ink)]">
                      Cover
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-2">
                <button type="button" onClick={() => makeCover(photo)} disabled={photo.is_primary} className="rounded-lg border border-white/10 bg-white/[0.04] py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-pearl)] disabled:opacity-30">Cover</button>
                <button type="button" onClick={() => removePhoto(photo)} className="rounded-lg border border-red-400/20 bg-red-400/10 py-1.5 text-[10px] font-bold uppercase tracking-wider text-red-200">Remove</button>
                <button type="button" onClick={() => movePhoto(index, -1)} disabled={index === 0} className="rounded-lg border border-white/10 bg-white/[0.04] py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mist)] disabled:opacity-25">Earlier</button>
                <button type="button" onClick={() => movePhoto(index, 1)} disabled={index === photos.length - 1} className="rounded-lg border border-white/10 bg-white/[0.04] py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-mist)] disabled:opacity-25">Later</button>
              </div>
            </div>
          );
        })}

        {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, i) => (
          <div key={i} className="flex aspect-[4/5] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.015] text-center text-[10px] font-bold uppercase tracking-wider text-[var(--color-ash)]">
            Open slot
          </div>
        ))}
      </div>
    </StepShell>
  );
}
