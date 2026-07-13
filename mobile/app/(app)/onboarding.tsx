import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  emptyOnboardingDraft,
  premiumOnboardingStepOrder,
  type OnboardingStep,
  type UserProfileRow,
} from "@freeborn/shared";
import {
  onboardingBioSchema,
  onboardingInterestsSchema,
  onboardingLifestyleSchema,
  onboardingLocationSchema,
  onboardingPremiumIdentitySchema,
  onboardingRelationshipGoalsSchema,
  onboardingValuesSchema,
  colors,
} from "@freeborn/shared";
import { ScreenShell } from "@/components/ui/screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { Wordmark } from "@/components/wordmark";
import { DateOfBirthPicker } from "@/components/onboarding/date-of-birth-picker";
import { StepLayout } from "@/components/onboarding/step-layout";
import { StepRouter } from "@/components/onboarding/step-router";
import { toNullable, mapFieldErrors } from "@/components/onboarding/shared";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";

/* -------------------------------------------------------------------------- */
/*  Constants                                                                  */
/* -------------------------------------------------------------------------- */

const STEPS = [...premiumOnboardingStepOrder] as OnboardingStep[];
const TOTAL = STEPS.length;

/* -------------------------------------------------------------------------- */
/*  Progress dots                                                              */
/* -------------------------------------------------------------------------- */

function StepProgress({ current, total }: { current: number; total: number }) {
  return (
    <View style={styles.progressRow}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            i <= current
              ? { backgroundColor: colors.gold300 }
              : { backgroundColor: "rgba(255,255,255,0.12)" },
          ]}
        />
      ))}
      <Text style={styles.progressLabel}>
        {current + 1} of {total}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/*  Date-of-birth label helper                                                 */
/* -------------------------------------------------------------------------- */

function formatDobLabel(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[Number(match[2]) - 1]} ${Number(match[3])}, ${match[1]}`;
}

/* -------------------------------------------------------------------------- */
/*  Orchestrator                                                               */
/* -------------------------------------------------------------------------- */

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState(emptyOnboardingDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: "success" | "error"; title: string; body: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [dobVisible, setDobVisible] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const step = STEPS[stepIndex];
  const isFinish = step === "finish";
  const dobLabel = formatDobLabel(draft.birth_date);

  /* ---- Profile load ----------------------------------------------------- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) return;
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle<UserProfileRow>();
      if (cancelled || !profile) return;

      if (profile.onboarding_stage === "profile_setup" || profile.onboarding_stage === "ready") {
        router.replace("/(app)");
        return;
      }

      setDraft({
        display_name: profile.display_name ?? "",
        birth_date: profile.birth_date ?? "",
        gender: profile.gender ?? "",
        city: profile.city ?? "",
        region: profile.region ?? "",
        country_code: profile.country_code ?? "",
        bio: profile.bio ?? "",
        relationship_goals: profile.relationship_goals ?? [],
        values: profile.values ?? [],
        interests: profile.interests ?? [],
        lifestyle_preferences: profile.lifestyle_preferences ?? [],
        deal_breakers: profile.deal_breakers ?? [],
        occupation: profile.occupation ?? "",
        education: profile.education ?? "",
      });

      const saved = profile.onboarding_step;
      if (saved) {
        const idx = STEPS.indexOf(saved as OnboardingStep);
        if (idx >= 0) setStepIndex(idx);
      }
      setInitialized(true);
    })();
    return () => { cancelled = true; };
  }, [user]);

  /* ---- Helpers ---------------------------------------------------------- */
  const update = useCallback(<K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
  }, []);

  const animateIn = () => {
    fadeAnim.setValue(0.3);
    Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  };

  const goTo = (index: number) => {
    setStepIndex(Math.max(0, Math.min(index, TOTAL - 1)));
    setErrors({});
    setNotice(null);
    animateIn();
  };

  const persist = async (nextStep: OnboardingStep) => {
    if (!user) throw new Error("Not signed in");
    const { error } = await supabase
      .from("user_profiles")
      .update({
        display_name: toNullable(draft.display_name),
        birth_date: draft.birth_date || null,
        gender: draft.gender || null,
        city: toNullable(draft.city),
        region: toNullable(draft.region),
        country_code: toNullable(draft.country_code),
        bio: draft.bio || null,
        relationship_goals: draft.relationship_goals,
        values: draft.values,
        interests: draft.interests,
        lifestyle_preferences: draft.lifestyle_preferences,
        deal_breakers: draft.deal_breakers,
        occupation: toNullable(draft.occupation),
        education: toNullable(draft.education),
        onboarding_step: nextStep,
      })
      .eq("id", user.id);
    if (error) {
      setNotice({ tone: "error", title: "Could not save", body: error.message });
      throw error;
    }
  };

  /* ---- Continue handler ------------------------------------------------- */
  const handleContinue = async () => {
    setNotice(null);
    setErrors({});
    setPending(true);
    try {
      if (step === "welcome") { await persist("identity"); goTo(stepIndex + 1); return; }
      if (step === "identity") {
        const r = onboardingPremiumIdentitySchema.safeParse({ display_name: draft.display_name, birth_date: draft.birth_date, gender: draft.gender });
        if (!r.success) { setErrors(mapFieldErrors(r.error.issues)); return; }
        await persist("location"); goTo(stepIndex + 1); return;
      }
      if (step === "location") {
        const r = onboardingLocationSchema.safeParse({ city: draft.city, region: draft.region, country_code: draft.country_code, location_source: "manual" as const, latitude: null, longitude: null, accuracy_m: null });
        if (!r.success) { setErrors(mapFieldErrors(r.error.issues)); return; }
        await persist("relationship_intent"); goTo(stepIndex + 1); return;
      }
      if (step === "relationship_intent" || step === "intent") {
        const r = onboardingRelationshipGoalsSchema.safeParse(draft.relationship_goals);
        if (!r.success) { setErrors(mapFieldErrors(r.error.issues)); return; }
        await persist("lifestyle"); goTo(stepIndex + 1); return;
      }
      if (step === "lifestyle") {
        const r = onboardingLifestyleSchema.safeParse(draft.lifestyle_preferences);
        if (!r.success) { setErrors(mapFieldErrors(r.error.issues)); return; }
        await persist("values"); goTo(stepIndex + 1); return;
      }
      if (step === "values") {
        const r = onboardingValuesSchema.safeParse(draft.values);
        if (!r.success) { setErrors(mapFieldErrors(r.error.issues)); return; }
        await persist("interests"); goTo(stepIndex + 1); return;
      }
      if (step === "interests") {
        const r = onboardingInterestsSchema.safeParse(draft.interests);
        if (!r.success) { setErrors(mapFieldErrors(r.error.issues)); return; }
        await persist("bio"); goTo(stepIndex + 1); return;
      }
      if (step === "bio") {
        const r = onboardingBioSchema.safeParse(draft.bio);
        if (!r.success) { setErrors(mapFieldErrors(r.error.issues)); return; }
        await persist("photos"); goTo(stepIndex + 1); return;
      }
      if (step === "photos") { await persist("discovery_preferences"); goTo(stepIndex + 1); return; }
      if (step === "discovery_preferences") { await persist("verification"); goTo(stepIndex + 1); return; }
      if (step === "verification") { await persist("finish"); goTo(stepIndex + 1); return; }
      if (step === "finish") {
        const { error } = await supabase
          .from("user_profiles")
          .update({ onboarding_stage: "profile_setup", profile_status: "active", onboarding_step: "finish", onboarding_completed_at: new Date().toISOString() })
          .eq("id", user?.id ?? "");
        if (error) { setNotice({ tone: "error", title: "Could not finish", body: error.message }); return; }
        router.replace("/(app)");
      }
    } finally {
      setPending(false);
    }
  };

  /* ---- Render ----------------------------------------------------------- */
  if (!initialized) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color={colors.gold300} />
      </View>
    );
  }

  return (
    <ScreenShell>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.flex}>
        <View style={styles.header}><Wordmark /></View>
        <StepProgress current={stepIndex} total={TOTAL} />

        {notice ? (
          <View style={[styles.notice, notice.tone === "error" ? styles.noticeError : styles.noticeSuccess]}>
            <Text style={styles.noticeTitle}>{notice.title}</Text>
            <Text style={styles.noticeBody}>{notice.body}</Text>
          </View>
        ) : null}

        <SurfaceCard>
          <Animated.View style={{ opacity: fadeAnim }}>
            <StepLayout
              step={step}
              stepIndex={stepIndex}
              isFinish={isFinish}
              pending={pending}
              onBack={() => goTo(stepIndex - 1)}
              onContinue={handleContinue}
            >
              <StepRouter
                step={step}
                draft={draft}
                errors={errors}
                onUpdate={update}
                dobLabel={dobLabel}
                onShowDobPicker={() => setDobVisible(true)}
              />
            </StepLayout>
          </Animated.View>
        </SurfaceCard>
      </KeyboardAvoidingView>

      <DateOfBirthPicker
        visible={dobVisible}
        value={draft.birth_date}
        onChange={(value: string) => { update("birth_date", value); setDobVisible(false); }}
        onClose={() => setDobVisible(false)}
      />
    </ScreenShell>
  );
}

/* -------------------------------------------------------------------------- */
/*  Styles                                                                     */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loader: { flex: 1, backgroundColor: colors.night, alignItems: "center", justifyContent: "center" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 12, marginBottom: 4 },
  progressDot: { flex: 1, height: 4, borderRadius: 2 },
  progressLabel: { color: colors.ash, fontSize: 10, fontWeight: "800", letterSpacing: 1, marginLeft: 8, textTransform: "uppercase" },
  notice: { borderRadius: 16, padding: 14, marginTop: 12 },
  noticeError: { backgroundColor: "rgba(255,107,122,0.12)", borderWidth: 1, borderColor: "rgba(255,107,122,0.25)" },
  noticeSuccess: { backgroundColor: "rgba(109,211,176,0.10)", borderWidth: 1, borderColor: "rgba(109,211,176,0.20)" },
  noticeTitle: { color: colors.pearl, fontSize: 13, fontWeight: "800" },
  noticeBody: { color: colors.mist, fontSize: 12, lineHeight: 18, marginTop: 4 },
});
