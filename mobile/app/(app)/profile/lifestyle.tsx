import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors, lifestyleOptions, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { ChipSelect } from "@/components/onboarding/chip-select";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function LifestyleScreen() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setPrefs(data?.lifestyle_preferences ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      lifestyle_preferences: prefs,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: "Lifestyle saved." }); await load(); }
    setSaving(false);
  };

  if (loading) {
    return (
      <DetailScreenShell title="Lifestyle" subtitle="Daily rhythms and choices">
        <DetailSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Lifestyle" subtitle="Daily rhythms and choices">
      <SurfaceCard>
        <SectionHeader eyebrow="Lifestyle" title="How you live" body="These details spark conversation, including wellness and daily rhythm. Choose up to 12." />
        <ChipSelect
          label="Lifestyle preferences"
          options={lifestyleOptions as unknown as readonly string[]}
          value={prefs}
          onChange={setPrefs}
          max={12}
        />
      </SurfaceCard>
      <SaveActionBar onSave={save} saving={saving} notice={notice} />
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 32 },
  loadingText: { color: colors.mist, fontSize: 13, fontWeight: "700" },
});
