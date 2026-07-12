import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors, relationshipGoalOptions, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { OptionCardRow } from "@/components/onboarding/option-card-row";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function IntentScreen() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setGoals(data?.relationship_goals ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      relationship_goals: goals,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: "Intent saved." }); await load(); }
    setSaving(false);
  };

  if (loading) {
    return (
      <DetailScreenShell title="Intent" subtitle="Your relationship direction">
        <DetailSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Intent" subtitle="Your relationship direction">
      <SurfaceCard>
        <SectionHeader eyebrow="Relationship goals" title="What are you looking for?" body="Choose up to 3. This helps people understand your direction before deciding." />
        <OptionCardRow
          options={relationshipGoalOptions.map(o => ({ value: o.value, label: o.label, caption: o.caption }))}
          value={goals}
          onChange={setGoals}
          max={3}
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
