import { useCallback, useEffect, useState } from "react";
import { type ProfilePhoto, type UserProfileRow } from "@freeborn/shared";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export function publicPhotoUrl(path?: string | null) {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.EXPO_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/profile-photos/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function initials(name?: string | null) {
  return (name ?? "FB").split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();
}

export function ageFromBirthDate(value?: string | null) {
  if (!value) return null;
  const birth = new Date(value);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const md = today.getMonth() - birth.getMonth();
  if (md < 0 || (md === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age >= 18 ? age : null;
}

export function humanize(value?: string | null) {
  return (value ?? "").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

export function profileStrength(profile: UserProfileRow | null) {
  if (!profile) return 0;
  return Math.min(
    35 + (profile.photo_count ?? 0) * 12 + (profile.bio ? 18 : 0) +
    ((profile.interests?.length ?? 0) ? 12 : 0) + ((profile.relationship_goals?.length ?? 0) ? 10 : 0) +
    (profile.is_verified ? 8 : 0), 98,
  );
}

export type ProfileData = {
  profile: UserProfileRow | null;
  photos: ProfilePhoto[];
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useProfileData(): ProfileData {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [photos, setPhotos] = useState<ProfilePhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    const { data: ph } = await supabase.from("profile_photos").select("*").eq("user_id", user.id).order("position");
    setProfile(data ?? null);
    setPhotos((ph as ProfilePhoto[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  return { profile, photos, loading, refresh };
}
