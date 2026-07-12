import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { colors, dealBreakerOptions, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { ChipSelect } from "@/components/onboarding/chip-select";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

export default function DealbreakersScreen() {
  const { user } = useAuth();
  const [dealBreakers, setDealBreakers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setDealBreakers(data?.deal_breakers ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      deal_breakers: dealBreakers,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: "Dealbreakers saved." }); await load(); }
    setSaving(false);
  };

  if (loading) {
    return (
      <DetailScreenShell title="Dealbreakers" subtitle="Your non-negotiables">
        <DetailSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Dealbreakers" subtitle="Your non-negotiables">
      <SurfaceCard>
        <SectionHeader eyebrow="Dealbreakers" title="What you won't compromise on" body="Deal breakers keep discovery honest, including pressure around values or health choices. Choose up to 12." />
        <ChipSelect
          label="Dealbreakers"
          options={dealBreakerOptions as unknown as readonly string[]}
          value={dealBreakers}
          onChange={setDealBreakers}
          max={12}
          optional
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
