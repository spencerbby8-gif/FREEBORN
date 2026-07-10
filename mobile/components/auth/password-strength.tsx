import { StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";

const rules = [
  (v: string) => v.length >= 8,
  (v: string) => /[A-Z]/.test(v),
  (v: string) => /[a-z]/.test(v),
  (v: string) => /[0-9]/.test(v),
];

const levels = [
  { label: "Too weak", color: colors.danger, segments: 1 },
  { label: "Fair", color: colors.warning, segments: 2 },
  { label: "Good", color: colors.gold500, segments: 3 },
  { label: "Strong", color: colors.success, segments: 4 },
];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const passed = rules.filter((rule) => rule(password)).length;
  const level = passed >= 4 ? 3 : Math.max(0, passed - 1);
  const current = levels[level];

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.segment,
              { backgroundColor: i < current.segments ? current.color : "rgba(255,255,255,0.10)" },
            ]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Text style={[styles.label, { color: current.color }]}>{current.label}</Text>
        <View style={styles.dots}>
          {rules.map((rule, i) => (
            <Text key={i} style={{ color: rule(password) ? colors.success : "rgba(255,255,255,0.20)", fontSize: 11 }}>
              {rule(password) ? "●" : "○"}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 8, marginTop: 4 },
  track: { flexDirection: "row", gap: 6 },
  segment: { flex: 1, height: 4, borderRadius: 999 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 11, fontWeight: "700" },
  dots: { flexDirection: "row", gap: 4 },
});
