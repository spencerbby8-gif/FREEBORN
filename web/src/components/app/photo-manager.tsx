"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ProfilePhoto } from "@freeborn/shared";
import { uploadProfilePhoto, deleteProfilePhoto, setPrimaryPhoto } from "@/lib/photos/actions";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="magic-button rounded-xl bg-[var(--color-pearl)] px-4 py-2.5 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white disabled:opacity-60">
      {pending ? pendingLabel ?? "…" : label}
    </button>
  );
}

type UploadState = { ok: boolean; error?: string } | null;

export function PhotoManager({ photos }: { photos: ProfilePhoto[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const publicPhotoUrl = (path: string) => {
    if (path.startsWith("http")) return path;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!base) return null;
    return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
  };
  const [state, formAction] = useActionState(async (_prev: UploadState, fd: FormData) => {
    if (file) fd.set("file", file);
    const res = await uploadProfilePhoto(fd);
    if (res.ok) setFile(null);
    return res;
  }, null);

  return (
    <div className="luminous-card rounded-2xl border border-white/8 bg-white/[0.035] p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">Photos</p>
          <h3 className="mt-1 text-xl font-semibold text-[var(--color-pearl)]">{photos.length} / 6 intentional photos</h3>
          <p className="mt-1 text-xs leading-5 text-[var(--color-mist)]">Use recent images that make you recognizable. The first photo becomes your discovery cover.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((p) => {
          const url = publicPhotoUrl(p.storage_path);
          return (
          <div key={p.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="flex aspect-[4/5] w-full items-center justify-center bg-gradient-to-br from-rose-400/10 to-sky-400/10">
              {url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url} alt={p.is_primary ? "Your primary profile photo" : "Your profile photo"} className="h-full w-full object-cover" />
              ) : (
                <span className="px-3 text-center text-xs leading-5 text-[var(--color-mist)]">Photo stored privately until your media URL is configured.</span>
              )}
            </div>
            <div className="absolute inset-x-0 top-2 flex justify-center gap-1">
              {p.is_primary && (
                <span className="rounded-full bg-gradient-to-r from-[var(--color-accent-gold)] to-amber-300 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-black shadow-lg">
                  Primary
                </span>
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 flex gap-1 p-2 opacity-0 transition-opacity group-hover:opacity-100">
              <form action={async (fd: FormData) => { await setPrimaryPhoto(fd); }} className="flex-1">
                <input type="hidden" name="id" value={p.id} />
                <SubmitButton label="★" pendingLabel="…" />
              </form>
              <form action={async (fd: FormData) => { await deleteProfilePhoto(fd); }}>
                <input type="hidden" name="id" value={p.id} />
                <button className="rounded-xl border border-red-300/30 bg-red-400/20 px-3 py-2.5 text-xs font-semibold text-red-200">
                  Delete
                </button>
              </form>
            </div>
          </div>
          );
        })}
        {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, i) => (
          <div key={i} className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center text-xs text-[var(--color-mist)]">
            <div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
              Add photo
            </div>
          </div>
        ))}
      </div>

      <form action={formAction} className="mt-5 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {previewUrl ? <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Selected photo preview" className="h-20 w-16 rounded-xl object-cover" />
          </> : <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/[0.05] text-xl" aria-hidden="true">＋</div>}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[var(--color-pearl)]">{file?.name ?? "Choose a photo that feels like you"}</p>
            <p className="mt-1 text-xs text-[var(--color-mist)]">JPG, PNG or WebP · up to 8MB</p>
          </div>
          <label className="cursor-pointer rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2.5 text-center text-sm font-bold text-[var(--color-pearl)] hover:bg-white/[0.1]">
            {file ? "Change" : "Choose photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const next = e.target.files?.[0] ?? null; setFile(next); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(next ? URL.createObjectURL(next) : null); }} />
          </label>
          {file ? <SubmitButton label="Upload photo" pendingLabel="Uploading…" /> : null}
        </div>
      </form>
      {state && !state.ok && <p className="mt-3 text-sm text-red-200">{state.error}</p>}
      <p className="mt-3 text-xs leading-5 text-[var(--color-mist)]">JPG or PNG up to 8MB. First photo becomes primary automatically.</p>
    </div>
  );
}
