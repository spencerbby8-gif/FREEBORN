import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { NavCard } from "@/components/ui/nav-card";
import { DetailSkeleton } from "@/components/ui/skeleton";
import { useProfileData, humanize } from "@/hooks/use-profile-data";

export default function EditProfileScreen() {
  const { profile, loading } = useProfileData();

  if (loading) {
    return (
      <DetailScreenShell title="Edit Profile" subtitle="Your story, well-told and easy to trust">
        <DetailSkeleton />
        <DetailSkeleton />
        <DetailSkeleton />
      </DetailScreenShell>
    );
  }

  return (
    <DetailScreenShell title="Edit Profile" subtitle="Your story, well-told and easy to trust">
      {/* Privacy note */}
      <SurfaceCard>
        <Text style={styles.privacyNote}>
          Your public profile excludes email, full birth date, and account provider details.
          Only what you choose to share appears in discovery.
        </Text>
      </SurfaceCard>

      {/* Public identity */}
      <SurfaceCard gap={6} noPadding style={styles.section}>
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionEyebrow}>Public identity</Text>
        </View>
        <NavCard icon="✎" title="Name & Bio" subtitle={profile?.display_name ?? "Not set"} accent="gold" onPress={() => router.push("/(app)/profile/about")} />
        <NavCard icon="◈" title="Intent" subtitle={humanize(profile?.relationship_goals?.[0]) || "Not set"} count={profile?.relationship_goals?.length ?? 0} accent="ember" onPress={() => router.push("/(app)/profile/intent")} />
      </SurfaceCard>

      {/* Your story */}
      <SurfaceCard gap={6} noPadding style={styles.section}>
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionEyebrow}>Your story</Text>
        </View>
        <NavCard icon="✦" title="Values" subtitle="What you stand for" count={profile?.values?.length ?? 0} accent="gold" onPress={() => router.push("/(app)/profile/values")} />
        <NavCard icon="◐" title="Lifestyle" subtitle="Daily rhythms and choices" count={profile?.lifestyle_preferences?.length ?? 0} accent="teal" onPress={() => router.push("/(app)/profile/lifestyle")} />
        <NavCard icon="☆" title="Interests" subtitle="What lights you up" count={profile?.interests?.length ?? 0} accent="violet" onPress={() => router.push("/(app)/profile/interests")} />
      </SurfaceCard>

      {/* Voice & boundaries */}
      <SurfaceCard gap={6} noPadding style={styles.section}>
        <View style={styles.sectionPadding}>
          <Text style={styles.sectionEyebrow}>Voice & boundaries</Text>
        </View>
        <NavCard icon="❝" title="Prompts" subtitle="Show your voice" count={profile?.prompt_answers?.length ?? 0} accent="teal" onPress={() => router.push("/(app)/profile/prompts")} />
        <NavCard icon="⊘" title="Dealbreakers" subtitle="Your non-negotiables" count={profile?.deal_breakers?.length ?? 0} accent="ember" onPress={() => router.push("/(app)/profile/dealbreakers")} />
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  privacyNote: { color: colors.mist, fontSize: 13, lineHeight: 20, fontWeight: "600" },
  section: { padding: 0 },
  sectionPadding: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 4 },
  sectionEyebrow: { color: colors.sand, fontSize: 10, fontWeight: "900", textTransform: "uppercase", letterSpacing: 2.4 },
});
