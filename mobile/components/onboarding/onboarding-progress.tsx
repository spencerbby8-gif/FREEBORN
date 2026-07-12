import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, onboardingStepMeta, onboardingStepOrder, radii } from "@freeborn/shared";

type OnboardingProgressProps = {
  currentIndex: number;
  total: number;
};

export function OnboardingProgress({ currentIndex, total }: OnboardingProgressProps) {
  const clampedIndex = Math.min(currentIndex, total - 1);
  const progress = total > 0 ? ((clampedIndex + 1) / total) * 100 : 0;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>
            Step {clampedIndex + 1} of {total}
          </Text>
          <Text style={styles.title}>{onboardingStepMeta[clampedIndex]?.label ?? "Onboarding"}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeLabel}>{Math.round(progress)}%</Text>
        </View>
      </View>

      <View style={styles.progressTrack}>
        <LinearGradient
          colors={[colors.ember500, colors.gold300, colors.violet300]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress}%` }]}
        />
      </View>

      <View style={styles.stepRow}>
        {onboardingStepOrder.map((step, index) => {
          const meta = onboardingStepMeta[index];
          const state = index < clampedIndex ? "done" : index === clampedIndex ? "active" : "upcoming";
          return (
            <View key={step} style={styles.stepItem}>
              <View
                style={[
                  styles.stepDot,
                  state === "done" && styles.stepDotDone,
                  state === "active" && styles.stepDotActive,
                ]}
              >
                <Text
                  style={[
                    styles.stepDotLabel,
                    state === "active" && styles.stepDotLabelActive,
                    state === "done" && styles.stepDotLabelDone,
                  ]}
                >
                  {state === "done" ? "✓" : index + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  state === "active" && styles.stepLabelActive,
                ]}
                numberOfLines={1}
              >
                {meta?.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  eyebrow: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    color: colors.pearl,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeLabel: {
    color: colors.sand,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  stepItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  stepDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    borderColor: colors.gold300,
    backgroundColor: "rgba(241,201,122,0.14)",
  },
  stepDotDone: {
    borderColor: "rgba(109,211,176,0.32)",
    backgroundColor: "rgba(109,211,176,0.14)",
  },
  stepDotLabel: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: "700",
  },
  stepDotLabelActive: {
    color: colors.pearl,
    fontWeight: "900",
  },
  stepDotLabelDone: {
    color: colors.success,
  },
  stepLabel: {
    color: colors.mist,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
  },
  stepLabelActive: {
    color: colors.pearl,
  },
});
