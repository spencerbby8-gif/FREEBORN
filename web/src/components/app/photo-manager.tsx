"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import type { ProfilePhoto } from "@freeborn/shared";
import { uploadProfilePhoto, deleteProfilePhoto, setPrimaryPhoto } from "@/lib/photos/actions";

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="rounded-xl bg-[var(--color-pearl)] px-4 py-2.5 text-sm font-bold text-[var(--color-ink)] transition hover:bg-white disabled:opacity-60">
      {pending ? pendingLabel ?? "…" : label}
    </button>
  );
}

type UploadState = { ok: boolean; error?: string } | null;

export function PhotoManager({ photos }: { photos: ProfilePhoto[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [state, formAction] = useActionState(async (_prev: UploadState, fd: FormData) => {
    if (file) fd.set("file", file);
    const res = await uploadProfilePhoto(fd);
    if (res.ok) setFile(null);
    return res;
  }, null);

  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6 sm:p-7">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-stone)]">Photos</p>
          <h3 className="mt-1 text-xl font-semibold text-[var(--color-pearl)]">{photos.length} / 6</h3>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {photos.map((p) => (
          <div key={p.id} className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="aspect-[4/5] w-full bg-gradient-to-br from-rose-400/10 to-sky-400/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://picsum.photos/seed/${p.id}/600/750`} alt="" className="h-full w-full object-cover" />
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
        ))}
        {Array.from({ length: Math.max(0, 6 - photos.length) }).map((_, i) => (
          <div key={i} className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02] text-center text-xs text-[var(--color-mist)]">
            <div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2 opacity-50"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21,15 16,10 5,21"/></svg>
              Add photo
            </div>
          </div>
        ))}
      </div>

      <form action={formAction} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-sm text-[var(--color-pearl)] file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:font-bold file:text-[var(--color-pearl)] hover:file:bg-white/20"
        />
        <SubmitButton label="Upload" pendingLabel="Uploading…" />
      </form>
      {state && !state.ok && <p className="mt-3 text-sm text-red-200">{state.error}</p>}
      <p className="mt-3 text-xs leading-5 text-[var(--color-mist)]">JPG or PNG up to 8MB. First photo becomes primary automatically.</p>
    </div>
  );
}
