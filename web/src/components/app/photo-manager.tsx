"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ProfilePhoto } from "@freeborn/shared";
import { deleteProfilePhoto, setPrimaryPhoto, uploadProfilePhoto } from "@/lib/photos/actions";

function publicPhotoUrl(path: string) {
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

function SubmitButton({ label, pendingLabel, variant = "primary" }: { label: string; pendingLabel?: string; variant?: "primary" | "secondary" | "danger" }) {
  const { pending } = useFormStatus();
  const className =
    variant === "danger"
      ? "rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm font-bold text-red-100 transition hover:bg-red-400/16 disabled:cursor-wait disabled:opacity-60"
      : variant === "secondary"
        ? "rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.08] disabled:cursor-wait disabled:opacity-60"
        : "magic-button rounded-2xl bg-[var(--color-pearl)] px-4 py-3 text-sm font-extrabold text-[var(--color-ink)] transition hover:bg-white disabled:cursor-wait disabled:opacity-60";
  return <button disabled={pending} className={className}>{pending ? pendingLabel ?? "Working…" : label}</button>;
}

type UploadState = { ok: boolean; error?: string } | null;

export function PhotoManager({ photos }: { photos: ProfilePhoto[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProfilePhoto | null>(null);
  const [state, formAction] = useActionState(async (_prev: UploadState, formData: FormData) => {
    if (file) formData.set("file", file);
    const result = await uploadProfilePhoto(formData);
    if (result.ok) {
      setFile(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    return result;
  }, null);

  return (
    <div className="luminous-card rounded-[40px] border border-white/10 bg-white/[0.02] p-8 shadow-[var(--shadow-card-lg)] sm:p-12">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--color-sand)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-teal-500)] shadow-[0_0_10px_rgba(79,184,167,0.6)]" />
          Photo Gallery
        </div>
        <h2 
          className="mt-6 text-[clamp(2rem,6vw,2.75rem)] leading-[0.95] tracking-tight text-[var(--color-pearl)]"
          style={{ fontFamily: "var(--font-display)", fontVariationSettings: "'opsz' 144, 'wght' 450" }}
        >
          {photos.length} / 6 Photos
        </h2>
        <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-[var(--color-mist)]">
          Use recent images that show the real you. Your primary photo is your introduction to the community.
        </p>
      </header>

      {photos.length === 0 ? (
        <div className="empty-glow rounded-[32px] border-2 border-dashed border-white/10 bg-white/[0.01] p-12 text-center transition-all hover:bg-white/[0.02] hover:border-white/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-gold-500)]/10 text-3xl text-[var(--color-gold-300)] shadow-[0_0_20px_rgba(217,167,82,0.15)]">＋</div>
          <h3 className="mt-6 text-xl font-bold text-[var(--color-pearl)]">Upload your first image</h3>
          <p className="mx-auto mt-2 max-w-sm text-[15px] font-medium text-[var(--color-mist)] leading-relaxed">
            Confidence starts with clarity. The first photo you upload will be set as your primary automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => {
            const url = publicPhotoUrl(photo.storage_path);
            return (
              <div key={photo.id} className="group relative overflow-hidden rounded-[28px] border border-white/5 bg-white/[0.02] shadow-inner transition-all hover:border-white/20">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
                  {url ? (
                    <img src={url} alt={photo.is_primary ? "Primary photo" : `Photo ${index + 1}`} className="h-full w-full object-cover transition duration-1000 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center text-[11px] font-bold uppercase tracking-widest text-[var(--color-ash)]">Loading...</div>
                  )}
                  
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {photo.is_primary && (
                      <span className="rounded-full bg-[var(--color-gold-500)] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[var(--color-ink)] shadow-[0_4px_10px_rgba(0,0,0,0.5)]">Primary</span>
                    )}
                    {photo.is_verified && (
                      <span className="rounded-full bg-[var(--color-teal-500)] px-3 py-1 text-[9px] font-black uppercase tracking-widest text-white shadow-[0_4px_10px_rgba(0,0,0,0.5)]">Verified</span>
                    )}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex h-1/3 items-end bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="grid w-full grid-cols-2 gap-2">
                      <form action={async (formData: FormData) => { await setPrimaryPhoto(formData); }} className="w-full">
                        <input type="hidden" name="id" value={photo.id} />
                        <button disabled={photo.is_primary} className="flex h-10 w-full items-center justify-center rounded-xl bg-white/10 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md transition hover:bg-white/20 disabled:opacity-50">
                          Set Primary
                        </button>
                      </form>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(photo)}
                        className="flex h-10 w-full items-center justify-center rounded-xl bg-red-500/20 text-[10px] font-black uppercase tracking-widest text-red-200 backdrop-blur-md transition hover:bg-red-500/40"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, index) => (
            <div key={index} className="flex aspect-[4/5] items-center justify-center rounded-[28px] border-2 border-dashed border-white/5 bg-white/[0.01] transition-all hover:bg-white/[0.03] hover:border-white/10">
              <div className="text-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-3 text-[var(--color-ash)] opacity-40"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-ash)]">Slot Open</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="mt-10">
        <div className="rounded-[32px] border border-white/5 bg-white/[0.02] p-6 transition-all hover:bg-white/[0.03]">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[24px] border border-white/10 bg-white/5 shadow-inner">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-[var(--color-gold-500)]/30">＋</div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="truncate text-[15px] font-bold text-[var(--color-pearl)]">{file?.name ?? "Select a new perspective"}</p>
              <p className="mt-1 text-[13px] font-medium text-[var(--color-mist)] leading-relaxed">JPG or WebP · Up to 8MB · Maintain a respectful tone.</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/[0.05] px-6 text-[13px] font-black uppercase tracking-widest text-[var(--color-pearl)] transition-all hover:bg-white/[0.1] active:scale-95">
                {file ? "Change" : "Choose"}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => {
                  const next = e.target.files?.[0] ?? null;
                  setFile(next);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(next ? URL.createObjectURL(next) : null);
                }} />
              </label>
              {file && <SubmitButton label="Upload" pendingLabel="Sending..." />}
            </div>
          </div>
        </div>
      </form>

      {state && !state.ok && (
        <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-[14px] font-bold text-red-200 animate-scale-in">
          {state.error ?? "Failed to upload photo."}
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="animate-scale-in w-full max-w-[440px] rounded-[40px] border border-white/10 bg-[rgba(9,16,28,0.96)] p-10 text-center shadow-[var(--shadow-card-lg)]">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-[var(--color-pearl)]">Remove photo?</h3>
            <p className="mt-4 text-[16px] font-medium leading-relaxed text-[var(--color-mist)]">This will permanently remove the image from your public profile.</p>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="h-14 rounded-2xl border border-white/10 bg-white/5 text-[15px] font-black uppercase tracking-widest text-[var(--color-pearl)] transition-all hover:bg-white/10">Cancel</button>
              <form action={async (fd) => { await deleteProfilePhoto(fd); setDeleteTarget(null); }} className="w-full">
                <input type="hidden" name="id" value={deleteTarget.id} />
                <SubmitButton label="Delete" pendingLabel="Removing..." variant="danger" />
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
