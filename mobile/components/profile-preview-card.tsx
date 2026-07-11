import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, previewProfiles, radii } from "@freeborn/shared";

export function ProfilePreviewCard() {
  const profile = previewProfiles[0];

  return (
    <LinearGradient colors={[profile.palette[0], "#6f405d", profile.palette[1]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.shell}>
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
            <Text style={styles.badgeLabel}>Verified</Text>
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
    borderRadius: radii.xl,
    padding: 1,
    shadowColor: "#02060d",
    shadowOpacity: 0.48,
    shadowRadius: 36,
    shadowOffset: { width: 0, height: 22 },
    elevation: 24,
  },
  card: {
    borderRadius: radii.xl - 1,
    padding: 22,
    minHeight: 270,
    backgroundColor: "rgba(7,16,28,0.38)",
    overflow: "hidden",
  },
  innerGlow: {
    position: "absolute",
    width: 210,
    height: 210,
    right: -80,
    top: -70,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  name: {
    color: colors.pearl,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -1.4,
  },
  age: {
    fontSize: 22,
    opacity: 0.84,
  },
  location: {
    marginTop: 8,
    color: "rgba(255,250,245,0.82)",
    fontSize: 13,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeLabel: {
    color: colors.pearl,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  headline: {
    marginTop: 26,
    color: "rgba(255,250,245,0.94)",
    fontSize: 16,
    lineHeight: 27,
    maxWidth: 260,
  },
  tagRow: {
    marginTop: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    backgroundColor: "rgba(255,255,255,0.11)",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagLabel: {
    color: colors.pearl,
    fontSize: 12,
    fontWeight: "600",
  },
});
