import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, LayoutAnimation, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  dealBreakerOptions,
  emptyOnboardingDraft,
  genderOptions,
  interestOptions,
  lifestyleOptions,
  onboardingFieldHints,
  onboardingIntro,
  onboardingStepMeta,
  onboardingStepOrder,
  relationshipGoalOptions,
  type OnboardingStep,
  type UserProfileRow,
} from "@freeborn/shared";
import {
  onboardingAboutYouSchema,
  onboardingBioGoalsSchema,
  onboardingIdentitySchema,
  onboardingInterestsLifestyleSchema,
  onboardingPreferencesExtrasSchema,
} from "@freeborn/shared";
import { colors, radii } from "@freeborn/shared";
import { ChipSelect } from "@/components/onboarding/chip-select";
import { NoticeCard } from "@/components/auth/notice-card";
import { OnboardingInput } from "@/components/onboarding/onboarding-input";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { OptionCardRow } from "@/components/onboarding/option-card-row";
import { MagicBackground, emberShadow, premiumShadow } from "@/components/magic-background";
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { DateOfBirthPicker } from "@/components/onboarding/date-of-birth-picker";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDob(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return "";
  const [, y, m, d] = match;
  return `${months[Number(m) - 1]} ${Number(d)}, ${y}`;
}

type DraftState = typeof emptyOnboardingDraft;
type FieldErrors = Partial<Record<keyof DraftState, string>>;

const stepKeys: OnboardingStep[] = [...onboardingStepOrder];

export default function OnboardingScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState<OnboardingStep>("identity");
  const [draft, setDraft] = useState<DraftState>(emptyOnboardingDraft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<{ tone: "success" | "error"; title: string; body: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [dobVisible, setDobVisible] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const currentIndex = stepKeys.findIndex((item) => item === step);

  const animateStep = () => {
    fadeAnim.setValue(0.4);
    Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  };

  const update = useCallback(<K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data: profile } = await supabase.from("user_profiles").select("*").eq("id", user.id).maybeSingle<UserProfileRow>();
    if (!profile) return;
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
      interests: profile.interests ?? [],
      lifestyle_preferences: profile.lifestyle_preferences ?? [],
      deal_breakers: profile.deal_breakers ?? [],
      occupation: profile.occupation ?? "",
      education: profile.education ?? "",
    });
    if (profile.onboarding_step && profile.onboarding_step !== "complete") {
      setStep(profile.onboarding_step as OnboardingStep);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const persist = useCallback(
    async (nextStep: OnboardingStep | "complete", override?: Partial<DraftState>) => {
      if (!user) return;
      const payload = { ...draft, ...override };
      const { error } = await supabase
        .from("user_profiles")
        .update({
          display_name: payload.display_name || null,
          birth_date: payload.birth_date || null,
          gender: payload.gender || null,
          city: payload.city || null,
          region: payload.region || null,
          country_code: payload.country_code || null,
          bio: payload.bio || null,
          relationship_goals: payload.relationship_goals,
          interests: payload.interests,
          lifestyle_preferences: payload.lifestyle_preferences,
          deal_breakers: payload.deal_breakers,
          occupation: payload.occupation || null,
          education: payload.education || null,
          onboarding_step: nextStep,
        })
        .eq("id", user.id);
      if (error) {
        setNotice({ tone: "error", title: "Could not save progress", body: error.message });
        throw error;
      }
    },
    [draft, user],
  );

  const validateAndContinue = async <T,>(
    schema: { safeParse: (data: T) => { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } } },
    data: T,
    nextStep: OnboardingStep | "complete",
  ) => {
    setNotice(null);
    setErrors({});
    setPending(true);
    try {
      const parsed = schema.safeParse(data);
      if (!parsed.success) {
        const next: FieldErrors = {};
        parsed.error?.issues.forEach((issue) => {
          const key = issue.path[0];
          if (typeof key === "string" && !(key in next)) next[key as keyof FieldErrors] = issue.message;
        });
        setErrors(next);
        return;
      }
      await persist(nextStep);
      if (nextStep === "complete") {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStep("complete");
        animateStep();
      } else {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setStep(nextStep as OnboardingStep);
        animateStep();
      }
    } catch {
      /* handled in persist */
    } finally {
      setPending(false);
    }
  };

  const handleFinish = async () => {
    setNotice(null);
    setPending(true);
    try {
      const { error } = await supabase
        .from("user_profiles")
        .update({
          onboarding_stage: "profile_setup",
          profile_status: "active",
          onboarding_step: "complete",
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq("id", user?.id ?? "");
      if (error) {
        setNotice({ tone: "error", title: "Could not finish onboarding", body: error.message });
        return;
      }
      router.replace("/(app)");
    } finally {
      setPending(false);
    }
  };

  const handleBack = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (currentIndex === 0) {
      router.replace("/(app)");
      return;
    }
    setStep(stepKeys[currentIndex - 1]);
    animateStep();
  };

  const meta = onboardingStepMeta[currentIndex];

  const dobValue = formatDob(draft.birth_date);

  return (
    <LinearGradient colors={["#03050b", colors.night, colors.midnight, colors.slate]} style={styles.container}>
      <MagicBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Wordmark />
          </View>

          <OnboardingProgress currentIndex={currentIndex} total={stepKeys.length} />

          {notice ? <NoticeCard {...notice} /> : null}

          <View style={styles.formCard}>
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.eyebrow}>
                <View style={styles.eyebrowDot} />
                <Text style={styles.eyebrowLabel}>
                  {step === "complete" ? "PROFILE READY" : (meta?.label ?? "ONBOARDING").toUpperCase()}
                </Text>
              </View>
              <Text style={styles.title}>
                {step === "identity" && "Let's start with the basics."}
                {step === "about_you" && "Where you are, how you identify."}
                {step === "bio_goals" && "Your voice, your intentions."}
                {step === "interests_lifestyle" && "What lights you up?"}
                {step === "preferences_extras" && "The finer details."}
                {step === "complete" && "Your profile is live."}
              </Text>
              <Text style={styles.description}>
                {step === "identity" && onboardingIntro.description}
                {step === "about_you" && "These details shape who discovers you."}
                {step === "bio_goals" && "A short bio and a few goals go a long way."}
                {step === "interests_lifestyle" && "These details spark conversation."}
                {step === "preferences_extras" && "Deal breakers keep discovery honest."}
                {step === "complete" && "You're set up with a thoughtful foundation."}
              </Text>

              <View style={styles.formStack}>
                {step === "identity" && (
                  <>
                    <OnboardingInput
                      label="Display name"
                      value={draft.display_name}
                      error={errors.display_name}
                      placeholder="How should Freeborn introduce you?"
                      onChangeText={(value) => update("display_name", value)}
                      hint={onboardingFieldHints.display_name}
                    />
                    <View style={styles.field}>
                      <Text style={styles.label}>Date of birth</Text>
                      <Pressable
                        onPress={() => setDobVisible(true)}
                        style={[styles.dobButton, errors.birth_date ? styles.inputError : null]}
                      >
                        <Text style={[styles.dobText, !dobValue && styles.dobPlaceholder]}>
                          {dobValue || "Add your date of birth"}
                        </Text>
                        <Text style={styles.dobChevron}>▾</Text>
                      </Pressable>
                      {errors.birth_date ? <Text style={styles.errorText}>{errors.birth_date}</Text> : null}
                      <Text style={styles.hintText}>{onboardingFieldHints.birth_date}</Text>
                    </View>
                  </>
                )}

                {step === "about_you" && (
                  <>
                    <View style={styles.field}>
                      <Text style={styles.label}>Gender</Text>
                      <OptionCardRow
                        options={genderOptions.map((option) => ({ value: option.value, label: option.label }))}
                        value={draft.gender ? [draft.gender] : []}
                        onChange={(next) => update("gender", next[0] ?? "")}
                        single
                      />
                      {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
                      <Text style={styles.hintText}>{onboardingFieldHints.gender}</Text>
                    </View>
                    <OnboardingInput
                      label="City"
                      value={draft.city}
                      error={errors.city}
                      placeholder="Where do you live?"
                      onChangeText={(value) => update("city", value)}
                      hint={onboardingFieldHints.city}
                    />
                    <OnboardingInput
                      label="Region"
                      value={draft.region}
                      error={errors.region}
                      placeholder="State, province, or region"
                      onChangeText={(value) => update("region", value)}
                      hint={onboardingFieldHints.region}
                      optional
                    />
                    <OnboardingInput
                      label="Country code"
                      value={draft.country_code}
                      error={errors.country_code}
                      placeholder="US"
                      onChangeText={(value) => update("country_code", value.toUpperCase())}
                      hint={onboardingFieldHints.country_code}
                      optional
                      maxLength={2}
                    />
                  </>
                )}

                {step === "bio_goals" && (
                  <>
                    <OnboardingInput
                      label="Short bio"
                      value={draft.bio}
                      error={errors.bio}
                      placeholder="What do you care about? What does a good Sunday look like?"
                      onChangeText={(value) => update("bio", value.slice(0, 500))}
                      hint={`${draft.bio.length}/500 · ${onboardingFieldHints.bio}`}
                      multiline
                      style={styles.bioInput}
                    />
                    <View style={styles.field}>
                      <View style={styles.labelRow}>
                        <Text style={styles.label}>Relationship goals</Text>
                        <Text style={styles.counter}>{draft.relationship_goals.length}/3</Text>
                      </View>
                      <OptionCardRow
                        options={relationshipGoalOptions.map((option) => ({ value: option.value, label: option.label, caption: option.caption }))}
                        value={draft.relationship_goals}
                        onChange={(next) => update("relationship_goals", next)}
                        max={3}
                      />
                      {errors.relationship_goals ? <Text style={styles.errorText}>{errors.relationship_goals}</Text> : null}
                    </View>
                  </>
                )}

                {step === "interests_lifestyle" && (
                  <>
                    <ChipSelect
                      label="Interests"
                      options={interestOptions}
                      value={draft.interests}
                      onChange={(next) => update("interests", next)}
                      error={errors.interests}
                      hint={onboardingFieldHints.interests}
                      max={12}
                    />
                    <ChipSelect
                      label="Lifestyle"
                      options={lifestyleOptions}
                      value={draft.lifestyle_preferences}
                      onChange={(next) => update("lifestyle_preferences", next)}
                      error={errors.lifestyle_preferences}
                      hint={onboardingFieldHints.lifestyle_preferences}
                      max={12}
                    />
                  </>
                )}

                {step === "preferences_extras" && (
                  <>
                    <ChipSelect
                      label="Deal breakers"
                      options={dealBreakerOptions}
                      value={draft.deal_breakers}
                      onChange={(next) => update("deal_breakers", next)}
                      error={errors.deal_breakers}
                      hint={onboardingFieldHints.deal_breakers}
                      optional
                      max={12}
                    />
                    <OnboardingInput
                      label="Occupation"
                      value={draft.occupation}
                      error={errors.occupation}
                      placeholder="What do you do?"
                      onChangeText={(value) => update("occupation", value)}
                      hint={onboardingFieldHints.occupation}
                      optional
                    />
                    <OnboardingInput
                      label="Education"
                      value={draft.education}
                      error={errors.education}
                      placeholder="Where did you study?"
                      onChangeText={(value) => update("education", value)}
                      hint={onboardingFieldHints.education}
                      optional
                    />
                  </>
                )}

                {step === "complete" && (
                  <View style={styles.completeCard}>
                    <View style={styles.completeCheck}>
                      <Text style={styles.completeCheckGlyph}>✓</Text>
                    </View>
                    <Text style={styles.completeTitle}>Your profile is live.</Text>
                    <Text style={styles.completeSubtitle}>
                      You can refine anything from your profile later.
                    </Text>
                    {[
                      "Add clear, recent photos so people can recognize you with confidence.",
                      "Specific interests give better conversation starters than generic lists.",
                      "Keep your bio current — it sets the tone before a first message.",
                    ].map((tip) => (
                      <View key={tip} style={styles.completeRow}>
                        <View style={styles.completeDot} />
                        <Text style={styles.completeText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.actionRow}>
                  {step !== "complete" ? (
                    <Pressable onPress={handleBack} style={styles.secondaryButton} disabled={pending}>
                      <Text style={styles.secondaryButtonLabel}>{currentIndex === 0 ? "Exit" : "Back"}</Text>
                    </Pressable>
                  ) : (
                    <View style={styles.secondaryButton} />
                  )}
                  <Pressable
                    onPress={() => {
                      if (step === "identity")
                        validateAndContinue(onboardingIdentitySchema, { display_name: draft.display_name, birth_date: draft.birth_date }, "about_you");
                      else if (step === "about_you")
                        validateAndContinue(onboardingAboutYouSchema, { gender: draft.gender, city: draft.city, region: draft.region, country_code: draft.country_code }, "bio_goals");
                      else if (step === "bio_goals")
                        validateAndContinue(onboardingBioGoalsSchema, { bio: draft.bio, relationship_goals: draft.relationship_goals }, "interests_lifestyle");
                      else if (step === "interests_lifestyle")
                        validateAndContinue(onboardingInterestsLifestyleSchema, { interests: draft.interests, lifestyle_preferences: draft.lifestyle_preferences }, "preferences_extras");
                      else if (step === "preferences_extras")
                        validateAndContinue(onboardingPreferencesExtrasSchema, { deal_breakers: draft.deal_breakers, occupation: draft.occupation, education: draft.education }, "complete");
                      else if (step === "complete") handleFinish();
                    }}
                    disabled={pending}
                    style={[styles.primaryButton, pending && styles.disabledButton]}
                  >
                    <Text style={styles.primaryButtonLabel}>
                      {pending ? "Saving…" : step === "complete" ? "Enter Freeborn" : "Continue"}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </Animated.View>
          </View>
        </ScrollView>
      </SafeAreaView>

      <DateOfBirthPicker
        visible={dobVisible}
        value={draft.birth_date}
        onClose={() => setDobVisible(false)}
        onChange={(value) => update("birth_date", value)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 42, gap: 18 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  formCard: { borderRadius: radii.xl, borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", backgroundColor: "rgba(9,16,28,0.86)", padding: 18, ...premiumShadow },
  eyebrow: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 12, paddingVertical: 8 },
  eyebrowDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.accentGold },
  eyebrowLabel: { color: colors.stone, fontSize: 10, fontWeight: "700", letterSpacing: 2.2, textTransform: "uppercase" },
  title: { marginTop: 16, color: colors.pearl, fontSize: 26, lineHeight: 32, fontWeight: "700", letterSpacing: -1.2 },
  description: { marginTop: 8, color: colors.mist, fontSize: 14, lineHeight: 22 },
  formStack: { marginTop: 22, gap: 16 },
  field: { gap: 8 },
  labelRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  counter: { color: colors.stone, fontSize: 11, fontWeight: "700", letterSpacing: 1.4, textTransform: "uppercase" },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(255,255,255,0.05)", paddingHorizontal: 14, paddingVertical: 10 },
  chipActive: { borderColor: colors.accentGold, backgroundColor: "rgba(241,201,122,0.18)" },
  chipLabel: { color: colors.mist, fontSize: 13, fontWeight: "600" },
  chipLabelActive: { color: colors.pearl },
  bioInput: { minHeight: 110, textAlignVertical: "top" },
  hintText: { color: colors.mist, fontSize: 12, lineHeight: 18 },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  dobButton: {
    minHeight: 54,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  inputError: { borderColor: "rgba(255, 158, 160, 0.6)" },
  dobText: { color: colors.pearl, fontSize: 15 },
  dobPlaceholder: { color: "rgba(255,250,245,0.34)" },
  dobChevron: { color: colors.stone, fontSize: 14 },
  completeCard: { gap: 12, paddingVertical: 8, alignItems: "center" },
  completeCheck: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.accentGold,
    ...emberShadow,
  },
  completeCheckGlyph: { color: colors.ink, fontSize: 32, fontWeight: "800" },
  completeTitle: { marginTop: 6, color: colors.pearl, fontSize: 22, fontWeight: "700", letterSpacing: -0.6 },
  completeSubtitle: { color: colors.mist, fontSize: 14, lineHeight: 22, textAlign: "center", maxWidth: 300 },
  completeRow: { flexDirection: "row", gap: 12, alignItems: "flex-start", alignSelf: "stretch" },
  completeDot: { width: 8, height: 8, borderRadius: 999, backgroundColor: colors.accentGold, marginTop: 7 },
  completeText: { flex: 1, color: colors.pearl, fontSize: 14, lineHeight: 22 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  secondaryButton: { flex: 1, borderRadius: 22, borderWidth: 1, borderColor: colors.lineStrong, backgroundColor: "rgba(255,255,255,0.06)", paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  secondaryButtonLabel: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  primaryButton: { flex: 2, borderRadius: 22, backgroundColor: colors.pearl, paddingVertical: 15, alignItems: "center", justifyContent: "center" },
  primaryButtonLabel: { color: colors.ink, fontSize: 14, fontWeight: "800" },
  disabledButton: { opacity: 0.65 },
});
