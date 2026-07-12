"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function uploadProfilePhoto(formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) return { ok: false, error: "Choose a photo to continue." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "That photo is larger than 8MB." };
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return { ok: false, error: "Choose a JPG, PNG, or WebP image." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: upErr } = await supabase.storage.from("profile-photos").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (upErr) return { ok: false, error: upErr.message };

  // position = next
  const { data: existing } = await supabase
    .from("profile_photos")
    .select("position,is_primary")
    .eq("user_id", user.id)
    .order("position", { ascending: true });

  const nextPos = existing?.length ?? 0;
  if (nextPos >= 6) {
    await supabase.storage.from("profile-photos").remove([path]);
    return { ok: false, error: "You can add up to six photos." };
  }
  const isPrimary = !existing || existing.length === 0;

  const { data: photo, error: dbErr } = await supabase.from("profile_photos").insert({
    user_id: user.id,
    storage_path: path,
    position: nextPos,
    is_primary: isPrimary,
  }).select("*").single();
  if (dbErr) {
    await supabase.storage.from("profile-photos").remove([path]);
    return { ok: false, error: "We couldn't save that photo. Please try again." };
  }

  revalidatePath("/app/profile");
  revalidatePath("/app/onboarding");
  revalidatePath("/app");
  return { ok: true, photo };
}

export async function deleteProfilePhoto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing photo." };
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  const { data: photo } = await supabase.from("profile_photos").select("*").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!photo) return { ok: false, error: "Not found." };

  await supabase.storage.from("profile-photos").remove([photo.storage_path]);
  const { error } = await supabase.from("profile_photos").delete().eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/app/profile");
  revalidatePath("/app/onboarding");
  return { ok: true };
}

export async function setPrimaryPhoto(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !id) return { ok: false, error: "Invalid." };

  // unset others
  await supabase.from("profile_photos").update({ is_primary: false }).eq("user_id", user.id);
  const { error } = await supabase.from("profile_photos").update({ is_primary: true }).eq("id", id).eq("user_id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/profile");
  revalidatePath("/app/onboarding");
  return { ok: true };
}

export async function reorderPhotos(formData: FormData) {
  const orderRaw = String(formData.get("order") ?? "");
  let order: string[];
  try { order = JSON.parse(orderRaw); } catch { return { ok: false, error: "Invalid order." }; }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in required." };

  for (let i = 0; i < order.length; i++) {
    await supabase.from("profile_photos").update({ position: i }).eq("id", order[i]).eq("user_id", user.id);
  }
  revalidatePath("/app/profile");
  revalidatePath("/app/onboarding");
  return { ok: true };
}
