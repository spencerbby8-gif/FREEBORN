import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
import { Wordmark } from "@/components/wordmark";
import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

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

  const currentIndex = stepKeys.findIndex((item) => item === step);

  const update = useCallback(<K extends keyof DraftState>(key: K, value: DraftState[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }, []);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle<UserProfileRow>();

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
      if (!user || !isSupabaseConfigured) return;
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

  const handleIdentityContinue = async () => {
    setNotice(null);
    setErrors({});
    setPending(true);
    try {
      const parsed = onboardingIdentitySchema.safeParse({
        display_name: draft.display_name,
        birth_date: draft.birth_date,
      });
      if (!parsed.success) {
        const next: FieldErrors = {};
        parsed.error.issues.forEach((issue) => {
          const key = issue.path[0];
          if (typeof key === "string" && !(key in next)) {
            next[key as keyof FieldErrors] = issue.message;
          }
        });
        setErrors(next);
        return;
      }
      await persist("about_you");
      setStep("about_you");
    } catch {
      // handled in persist
    } finally {
      setPending(false);
    }
  };

  const handleAboutYouContinue = async () => {
    setNotice(null);
    setErrors({});
    setPending(true);
    try {
      const parsed = onboardingAboutYouSchema.safeParse({
        gender: draft.gender,
        city: draft.city,
        region: draft.region,
        country_code: draft.country_code,
      });
      if (!parsed.success) {
        const next: FieldErrors = {};
        parsed.error.issues.forEach((issue) => {
          const key = issue.path[0];
          if (typeof key === "string" && !(key in next)) {
            next[key as keyof FieldErrors] = issue.message;
          }
        });
        setErrors(next);
        return;
      }
      await persist("bio_goals");
      setStep("bio_goals");
    } catch {
      // handled in persist
    } finally {
      setPending(false);
    }
  };

  const handleBioGoalsContinue = async () => {
    setNotice(null);
    setErrors({});
    setPending(true);
    try {
      const parsed = onboardingBioGoalsSchema.safeParse({
        bio: draft.bio,
        relationship_goals: draft.relationship_goals,
      });
      if (!parsed.success) {
        const next: FieldErrors = {};
        parsed.error.issues.forEach((issue) => {
          const key = issue.path[0];
          if (typeof key === "string" && !(key in next)) {
            next[key as keyof FieldErrors] = issue.message;
          }
        });
        setErrors(next);
        return;
      }
      await persist("interests_lifestyle");
      setStep("interests_lifestyle");
    } catch {
      // handled in persist
    } finally {
      setPending(false);
    }
  };

  const handleInterestsContinue = async () => {
    setNotice(null);
    setErrors({});
    setPending(true);
    try {
      const parsed = onboardingInterestsLifestyleSchema.safeParse({
        interests: draft.interests,
        lifestyle_preferences: draft.lifestyle_preferences,
      });
      if (!parsed.success) {
        const next: FieldErrors = {};
        parsed.error.issues.forEach((issue) => {
          const key = issue.path[0];
          if (typeof key === "string" && !(key in next)) {
            next[key as keyof FieldErrors] = issue.message;
          }
        });
        setErrors(next);
        return;
      }
      await persist("preferences_extras");
      setStep("preferences_extras");
    } catch {
      // handled in persist
    } finally {
      setPending(false);
    }
  };

  const handlePreferencesContinue = async () => {
    setNotice(null);
    setErrors({});
    setPending(true);
    try {
      const parsed = onboardingPreferencesExtrasSchema.safeParse({
        deal_breakers: draft.deal_breakers,
        occupation: draft.occupation,
        education: draft.education,
      });
      if (!parsed.success) {
        const next: FieldErrors = {};
        parsed.error.issues.forEach((issue) => {
          const key = issue.path[0];
          if (typeof key === "string" && !(key in next)) {
            next[key as keyof FieldErrors] = issue.message;
          }
        });
        setErrors(next);
        return;
      }
      await persist("complete");
      setStep("complete");
    } catch {
      // handled in persist
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
    if (currentIndex === 0) {
      router.replace("/(app)");
      return;
    }
    setStep(stepKeys[currentIndex - 1]);
  };

  const meta = onboardingStepMeta[currentIndex];

  return (
    <LinearGradient colors={[colors.night, colors.midnight, colors.slate]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.headerRow}>
            <Wordmark />
            <View style={styles.phaseBadge}>
              <Text style={styles.phaseLabel}>Phase 2</Text>
            </View>
          </View>

          <OnboardingProgress currentIndex={currentIndex} total={stepKeys.length} />

          {notice ? (
            <View style={styles.noticeWrap}>
              <NoticeCard {...notice} />
            </View>
          ) : null}

          <View style={styles.formCard}>
            <View style={styles.eyebrow}>
              <View style={styles.eyebrowDot} />
              <Text style={styles.eyebrowLabel}>{meta?.label?.toUpperCase() ?? "ONBOARDING"}</Text>
            </View>
            <Text style={styles.title}>
              {step === "identity" && onboardingIntro.title}
              {step === "about_you" && "Where you are, how you identify."}
              {step === "bio_goals" && "Your voice, your intentions."}
              {step === "interests_lifestyle" && "What lights you up?"}
              {step === "preferences_extras" && "The finer details."}
              {step === "complete" && "Your Freeborn profile is live."}
            </Text>
            <Text style={styles.description}>
              {step === "identity" && onboardingIntro.description}
              {step === "about_you" && "These details shape who discovers you."}
              {step === "bio_goals" && "A short bio and a few relationship goals go a long way."}
              {step === "interests_lifestyle" && "These are the details that spark conversation."}
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
                  <OnboardingInput
                    label="Date of birth"
                    value={draft.birth_date}
                    error={errors.birth_date}
                    placeholder="YYYY-MM-DD"
                    onChangeText={(value) => update("birth_date", value)}
                    hint={onboardingFieldHints.birth_date}
                    keyboardType="numbers-and-punctuation"
                  />
                </>
              )}

              {step === "about_you" && (
                <>
                  <View style={styles.field}>
                    <View style={styles.labelRow}>
                      <Text style={styles.label}>Gender</Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                      {genderOptions.map((option) => {
                        const active = draft.gender === option.value;
                        return (
                          <Pressable
                            key={option.value}
                            onPress={() => update("gender", option.value)}
                            style={[styles.chip, active && styles.chipActive]}
                          >
                            <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                              {option.label}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
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
                    onChangeText={(value) => update("country_code", value)}
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
                      options={relationshipGoalOptions.map((option) => ({
                        value: option.value,
                        label: option.label,
                        caption: option.caption,
                      }))}
                      value={draft.relationship_goals}
                      onChange={(next) => update("relationship_goals", next)}
                      max={3}
                    />
                    {errors.relationship_goals ? (
                      <Text style={styles.errorText}>{errors.relationship_goals}</Text>
                    ) : null}
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
                  <View style={styles.completeRow}>
                    <View style={styles.completeDot} />
                    <Text style={styles.completeText}>
                      Your profile is active and ready for the next phase of Freeborn.
                    </Text>
                  </View>
                  <View style={styles.completeRow}>
                    <View style={[styles.completeDot, { backgroundColor: colors.accentRose }]} />
                    <Text style={styles.completeText}>
                      You can edit any of these details from your profile later.
                    </Text>
                  </View>
                  <View style={styles.completeRow}>
                    <View style={[styles.completeDot, { backgroundColor: colors.accentBlue }]} />
                    <Text style={styles.completeText}>
                      Discovery and matching arrive in the next phase.
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.actionRow}>
                <Pressable onPress={handleBack} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonLabel}>
                    {currentIndex === 0 ? "Exit" : "Back"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (step === "identity") handleIdentityContinue();
                    else if (step === "about_you") handleAboutYouContinue();
                    else if (step === "bio_goals") handleBioGoalsContinue();
                    else if (step === "interests_lifestyle") handleInterestsContinue();
                    else if (step === "preferences_extras") handlePreferencesContinue();
                    else if (step === "complete") handleFinish();
                  }}
                  disabled={pending}
                  style={[styles.primaryButton, pending && styles.disabledButton]}
                >
                  <Text style={styles.primaryButtonLabel}>
                    {pending
                      ? "Saving…"
                      : step === "complete"
                        ? "Enter Freeborn"
                        : "Continue"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 42,
    gap: 18,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  phaseBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  phaseLabel: {
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  noticeWrap: {
    marginTop: 0,
  },
  formCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(9,16,28,0.82)",
    padding: 18,
  },
  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accentGold,
  },
  eyebrowLabel: {
    color: colors.stone,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 18,
    color: colors.pearl,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: "700",
    letterSpacing: -1.2,
  },
  description: {
    marginTop: 10,
    color: colors.mist,
    fontSize: 14,
    lineHeight: 22,
  },
  formStack: {
    marginTop: 22,
    gap: 16,
  },
  field: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: colors.pearl,
    fontSize: 14,
    fontWeight: "700",
  },
  counter: {
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    borderColor: colors.accentGold,
    backgroundColor: "rgba(241,201,122,0.18)",
  },
  chipLabel: {
    color: colors.mist,
    fontSize: 13,
    fontWeight: "600",
  },
  chipLabelActive: {
    color: colors.pearl,
  },
  bioInput: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  hintText: {
    color: colors.mist,
    fontSize: 12,
    lineHeight: 18,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
  completeCard: {
    gap: 14,
    paddingVertical: 8,
  },
  completeRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  completeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accentGold,
    marginTop: 7,
  },
  completeText: {
    flex: 1,
    color: colors.pearl,
    fontSize: 14,
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonLabel: {
    color: colors.pearl,
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 2,
    borderRadius: 22,
    backgroundColor: colors.pearl,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonLabel: {
    color: colors.ink,
    fontSize: 14,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.65,
  },
});
