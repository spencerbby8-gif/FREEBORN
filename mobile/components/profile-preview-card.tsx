import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, previewProfiles, radii } from "@freeborn/shared";

export function ProfilePreviewCard() {
  const profile = previewProfiles[0];

  return (
    <LinearGradient
      colors={[profile.palette[0], "#6f405d", profile.palette[1]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.shell}
    >
      <View style={styles.card}>
        <View style={styles.innerGlow} />
        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.name}>
              {profile.name} <Text style={styles.age}>{profile.age}</Text>
            </Text>
            <Text style={styles.location}>{profile.location}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>✓ Verified</Text>
          </View>
        </View>
        <Text style={styles.headline}>{profile.headline}</Text>
        <View style={styles.tagRow}>
          {profile.traits.map((trait) => (
            <View key={trait} style={styles.tag}>
              <Text style={styles.tagLabel}>{trait}</Text>
            </View>
          ))}
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 28,
    padding: 1.5,
    shadowColor: "#02060d",
    shadowOpacity: 0.48,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 22 },
    elevation: 24,
  },
  card: {
    borderRadius: 27,
    padding: 24,
    minHeight: 260,
    backgroundColor: "rgba(7,16,28,0.40)",
    overflow: "hidden",
  },
  innerGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    right: -70,
    top: -60,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    color: colors.pearl,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1.4,
  },
  age: {
    fontSize: 20,
    opacity: 0.80,
    fontWeight: "700",
  },
  location: {
    marginTop: 8,
    color: "rgba(255,250,245,0.80)",
    fontSize: 13,
    fontWeight: "700",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  badgeLabel: {
    color: colors.pearl,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  headline: {
    marginTop: 26,
    color: "rgba(255,250,245,0.92)",
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 260,
  },
  tagRow: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.10)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  tagLabel: {
    color: "rgba(255,255,255,0.88)",
    fontSize: 11,
    fontWeight: "700",
  },
});
