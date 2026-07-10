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
          colors={["#ff8578", "#f1c97a", "#8ccfff"]}
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
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.05)",
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
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 6,
    color: colors.pearl,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeLabel: {
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
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
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.04)",
    alignItems: "center",
    justifyContent: "center",
  },
  stepDotActive: {
    borderColor: colors.accentGold,
    backgroundColor: "rgba(241,201,122,0.18)",
  },
  stepDotDone: {
    borderColor: "rgba(127,216,184,0.4)",
    backgroundColor: "rgba(127,216,184,0.18)",
  },
  stepDotLabel: {
    color: colors.mist,
    fontSize: 12,
    fontWeight: "700",
  },
  stepDotLabelActive: {
    color: colors.pearl,
  },
  stepDotLabelDone: {
    color: "#7fd8b8",
  },
  stepLabel: {
    color: colors.mist,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  stepLabelActive: {
    color: colors.pearl,
  },
});
