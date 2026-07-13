import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import type { OnboardingStep } from "@freeborn/shared";
import { colors } from "@freeborn/shared";
import { STEP_TITLES, STEP_SUBTITLES } from "./shared";

type Props = {
  step: OnboardingStep;
  stepIndex: number;
  isFinish: boolean;
  pending: boolean;
  onBack: () => void;
  onContinue: () => void;
  children: ReactNode;
};

export function StepLayout({ step, stepIndex, isFinish, pending, onBack, onContinue, children }: Props) {
  const title = STEP_TITLES[step];
  const subtitle = STEP_SUBTITLES[step];

  return (
    <>
      {/* Eyebrow badge */}
      <View style={styles.eyebrow}>
        <View style={styles.eyebrowDot} />
        <Text style={styles.eyebrowLabel}>
          {isFinish ? "COMPLETE" : `STEP ${stepIndex + 1}`}
        </Text>
      </View>

      {/* Title + subtitle */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Content */}
      <View style={styles.body}>{children}</View>

      {/* Actions */}
      <View style={styles.actions}>
        {stepIndex > 0 ? (
          <Pressable onPress={onBack} style={styles.backBtn} disabled={pending}>
            <Text style={styles.backLabel}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Pressable
          onPress={onContinue}
          style={[styles.continueBtn, pending && styles.continueBtnDisabled]}
          disabled={pending}
        >
          {pending ? (
            <ActivityIndicator size="small" color={colors.ink} />
          ) : (
            <Text style={styles.continueLabel}>
              {isFinish ? "Enter Freeborn" : "Continue"}
            </Text>
          )}
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  eyebrowDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: colors.gold300 },
  eyebrowLabel: {
    color: colors.sand,
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 14,
    color: colors.pearl,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 6,
    color: colors.mist,
    fontSize: 13,
    lineHeight: 20,
  },
  body: { marginTop: 18, gap: 14 },
  actions: { flexDirection: "row", gap: 12, marginTop: 24 },
  backBtn: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  backLabel: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  continueBtn: {
    flex: 2,
    borderRadius: 20,
    backgroundColor: colors.pearl,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnDisabled: { opacity: 0.6 },
  continueLabel: { color: colors.ink, fontSize: 14, fontWeight: "900" },
});
