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
    <div className="luminous-card rounded-[28px] border border-white/10 bg-white/[0.035] p-6 sm:p-7">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-[var(--color-stone)]">Photos</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-pearl)]">{photos.length} / 6 intentional photos</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-[var(--color-mist)]">
            Use recent images that make you recognizable. Your primary photo becomes your discovery cover.
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--color-mist)]">
          Public profile media
        </span>
      </div>

      {photos.length === 0 ? (
        <div className="empty-glow mt-6 rounded-[24px] border border-dashed border-white/14 bg-white/[0.025] p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[rgba(217,167,82,0.14)] text-2xl text-[var(--color-gold-300)]">＋</div>
          <h3 className="mt-4 text-xl font-semibold text-[var(--color-pearl)]">Add your first photo</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--color-mist)]">
            Clear, recent photos make your profile easier to trust. The first upload becomes your primary cover automatically.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {photos.map((photo, index) => {
            const url = publicPhotoUrl(photo.storage_path);
            return (
              <div key={photo.id} className="group overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.03]">
                <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[rgba(239,94,94,0.12)] to-[rgba(138,110,242,0.12)]">
                  {url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={photo.is_primary ? "Your primary profile photo" : `Your profile photo ${index + 1}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]" />
                  ) : (
                    <span className="px-4 text-center text-xs leading-5 text-[var(--color-mist)]">Preview unavailable. Your image remains saved.</span>
                  )}
                  <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                    {photo.is_primary ? (
                      <span className="rounded-full bg-gradient-to-r from-[var(--color-gold-500)] to-[var(--color-gold-300)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-ink)] shadow-lg">Primary</span>
                    ) : null}
                    {photo.is_verified ? (
                      <span className="rounded-full border border-[rgba(166,230,220,0.35)] bg-[rgba(79,184,167,0.22)] px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-[var(--color-teal-300)]">Verified</span>
                    ) : null}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 p-2">
                  <form action={async (formData: FormData) => { await setPrimaryPhoto(formData); }}>
                    <input type="hidden" name="id" value={photo.id} />
                    <SubmitButton label={photo.is_primary ? "Primary" : "Make primary"} pendingLabel="Saving…" variant="secondary" />
                  </form>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(photo)}
                    className="rounded-2xl border border-red-300/25 bg-red-400/8 px-3 py-3 text-sm font-bold text-red-100 transition hover:bg-red-400/14"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
          {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, index) => (
            <div key={index} className="flex aspect-[4/5] items-center justify-center rounded-[22px] border border-dashed border-white/12 bg-white/[0.02] text-center text-xs text-[var(--color-mist)]">
              <div>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-55"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
                Open slot
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="mt-6 rounded-[24px] border border-dashed border-white/15 bg-white/[0.025] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl} alt="Selected photo preview" className="h-24 w-20 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-2xl text-[var(--color-gold-300)]" aria-hidden="true">＋</div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-[var(--color-pearl)]">{file?.name ?? "Choose a photo that feels like you"}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-mist)]">JPG, PNG, or WebP · up to 8MB · maximum six photos.</p>
          </div>
          <label className="cursor-pointer rounded-2xl border border-white/12 bg-white/[0.06] px-4 py-3 text-center text-sm font-bold text-[var(--color-pearl)] transition hover:bg-white/[0.10]">
            {file ? "Change photo" : "Choose photo"}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                setFile(next);
                if (previewUrl) URL.revokeObjectURL(previewUrl);
                setPreviewUrl(next ? URL.createObjectURL(next) : null);
              }}
            />
          </label>
          {file ? <SubmitButton label="Upload photo" pendingLabel="Uploading…" /> : null}
        </div>
      </form>

      {state && !state.ok ? (
        <div className="mt-4 rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 px-4 py-3 text-sm text-red-100" role="alert">
          <p className="font-semibold">Photo did not upload.</p>
          <p className="mt-1 text-red-100/80">{state.error}</p>
        </div>
      ) : null}
      {state && state.ok ? (
        <div className="mt-4 rounded-2xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3 text-sm text-emerald-100" role="status">
          Photo added. Your first photo is used as the cover automatically.
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-md sm:items-center" role="dialog" aria-modal="true" aria-labelledby="delete-photo-title">
          <div className="animate-scale-in w-full max-w-[420px] rounded-[30px] border border-white/10 bg-[rgba(9,16,28,0.96)] p-6 shadow-[0_44px_120px_rgba(0,0,0,0.72)]">
            <p className="text-[11px] font-bold uppercase tracking-[0.20em] text-red-200">Delete photo</p>
            <h3 id="delete-photo-title" className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[var(--color-pearl)]">Remove this profile photo?</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--color-mist)]">This removes the photo from your profile. If it is your primary photo, choose another cover afterward.</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => setDeleteTarget(null)} className="rounded-2xl border border-white/12 bg-white/[0.05] px-4 py-3 text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.08]">
                Keep photo
              </button>
              <form action={async (formData: FormData) => { await deleteProfilePhoto(formData); }}>
                <input type="hidden" name="id" value={deleteTarget.id} />
                <SubmitButton label="Delete photo" pendingLabel="Deleting…" variant="danger" />
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
