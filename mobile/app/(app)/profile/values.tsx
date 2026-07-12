import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { colors, type UserProfileRow } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";
import { SaveActionBar } from "@/components/ui/save-action-bar";
import { ChipSelect } from "@/components/onboarding/chip-select";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

const valueOptions = [
  "Medical freedom",
  "Health autonomy",
  "Informed consent",
  "Natural health",
  "Holistic wellness",
  "Herbal remedies",
  "Traditional food",
  "Low-tox living",
  "Family values",
  "Faith",
  "Personal sovereignty",
  "Self-reliance",
  "Community",
  "Environmental stewardship",
  "Regenerative agriculture",
  "Homeschooling",
  "Home birth",
  "Breastfeeding advocacy",
  "Nutritional freedom",
  "Body autonomy",
] as const;

export default function ValuesScreen() {
  const { user } = useAuth();
  const [values, setValues] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    setValues(data?.values ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    setNotice(null);
    setSaving(true);
    const { error } = await supabase.from("user_profiles").update({
      values,
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);
    if (error) { setNotice({ tone: "error", message: "Could not save. Please try again." }); }
    else { setNotice({ tone: "success", message: "Values saved." }); await load(); }
    setSaving(false);
  };

  return (
    <DetailScreenShell title="Values" subtitle="What you stand for">
      {loading ? null : (
        <>
          <SurfaceCard>
            <SectionHeader eyebrow="Core values" title="What matters most to you" body="Choose the values that shape your life and relationships. These help people find alignment before the first message." />
            <ChipSelect
              label="Your values"
              options={valueOptions as unknown as readonly string[]}
              value={values}
              onChange={setValues}
              max={12}
              hint="These appear on your public profile as compatibility signals."
            />
          </SurfaceCard>
          <SaveActionBar onSave={save} saving={saving} notice={notice} />
        </>
      )}
    </DetailScreenShell>
  );
}
