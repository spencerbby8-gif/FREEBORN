import { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, type ViewStyle } from "react-native";
import { colors, radii } from "@freeborn/shared";

/** Shimmer overlay that pulses opacity on dark glass blocks */
export function SkeletonBlock({
  width,
  height,
  style,
}: {
  width: number | `${number}%`;
  height: number;
  style?: ViewStyle;
}) {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 0.7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.3,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View style={[styles.block, { width, height, opacity: pulse }, style]} />
  );
}

/** Detail screen skeleton: section header + 3 form fields */
export function DetailSkeleton() {
  return (
    <View style={styles.card}>
      {/* Section header */}
      <SkeletonBlock width={80} height={10} style={styles.eyebrowBlock} />
      <SkeletonBlock width="60%" height={18} style={styles.textBlock} />
      <SkeletonBlock width="80%" height={12} style={styles.textBlock} />
      {/* Form field 1 */}
      <View style={styles.fieldGroup}>
        <SkeletonBlock width={90} height={10} style={styles.textBlock} />
        <SkeletonBlock width="100%" height={50} style={styles.inputBlock} />
      </View>
      {/* Form field 2 */}
      <View style={styles.fieldGroup}>
        <SkeletonBlock width={70} height={10} style={styles.textBlock} />
        <SkeletonBlock width="100%" height={50} style={styles.inputBlock} />
      </View>
      {/* Form field 3 */}
      <View style={styles.fieldGroup}>
        <SkeletonBlock width={100} height={10} style={styles.textBlock} />
        <SkeletonBlock width="100%" height={50} style={styles.inputBlock} />
      </View>
    </View>
  );
}

/** Two-panel detail skeleton for settings screens */
export function SettingsSkeleton() {
  return (
    <View style={styles.card}>
      {/* Section header */}
      <SkeletonBlock width={80} height={10} style={styles.eyebrowBlock} />
      <SkeletonBlock width="50%" height={18} style={styles.textBlock} />
      <SkeletonBlock width="70%" height={12} style={styles.textBlock} />
      {/* Toggle row 1 */}
      <View style={styles.toggleRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBlock width={120} height={14} style={styles.textBlock} />
          <SkeletonBlock width={180} height={10} style={styles.textBlock} />
        </View>
        <SkeletonBlock width={44} height={26} style={styles.switchBlock} />
      </View>
      {/* Toggle row 2 */}
      <View style={styles.toggleRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBlock width={100} height={14} style={styles.textBlock} />
          <SkeletonBlock width={160} height={10} style={styles.textBlock} />
        </View>
        <SkeletonBlock width={44} height={26} style={styles.switchBlock} />
      </View>
    </View>
  );
}

/** Discover card skeleton: photo + name + bio + chips + actions */
export function DiscoverSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonBlock width="100%" height={300} style={styles.photoBlock} />
      <View style={styles.nameRow}>
        <SkeletonBlock width={140} height={22} style={styles.textBlock} />
        <SkeletonBlock width={40} height={18} style={styles.textBlock} />
      </View>
      <SkeletonBlock width={180} height={14} style={styles.textBlock} />
      <SkeletonBlock width="100%" height={14} style={styles.textBlock} />
      <SkeletonBlock width="85%" height={14} style={styles.textBlock} />
      <View style={styles.chipRow}>
        <SkeletonBlock width={72} height={28} style={styles.chipBlock} />
        <SkeletonBlock width={90} height={28} style={styles.chipBlock} />
        <SkeletonBlock width={64} height={28} style={styles.chipBlock} />
        <SkeletonBlock width={80} height={28} style={styles.chipBlock} />
      </View>
      <View style={styles.actionRow}>
        <SkeletonBlock width="30%" height={58} style={styles.actionBlock} />
        <SkeletonBlock width="30%" height={58} style={styles.actionBlock} />
        <SkeletonBlock width="30%" height={58} style={styles.actionBlock} />
      </View>
    </View>
  );
}

/** Likes / list skeleton */
export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <View style={styles.listCard}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={[styles.listRow, i < rows - 1 && styles.listRowBorder]}>
          <SkeletonBlock width={44} height={44} style={styles.avatarBlock} />
          <View style={styles.listText}>
            <SkeletonBlock width={120} height={14} style={styles.textBlock} />
            <SkeletonBlock width={180} height={12} style={styles.textBlock} />
          </View>
        </View>
      ))}
    </View>
  );
}

/** Profile hub skeleton matching the final layout */
export function ProfileSkeleton() {
  return (
    <View style={styles.card}>
      {/* Hero photo area */}
      <SkeletonBlock width="100%" height={200} style={styles.photoBlock} />
      {/* Completion bar */}
      <View style={styles.completionRow}>
        <View style={{ flex: 1, gap: 6 }}>
          <SkeletonBlock width={120} height={14} style={styles.textBlock} />
          <SkeletonBlock width={200} height={10} style={styles.textBlock} />
        </View>
        <SkeletonBlock width={48} height={32} style={styles.textBlock} />
      </View>
      <SkeletonBlock width="100%" height={6} style={styles.chipBlock} />
      {/* Action buttons */}
      <View style={styles.actionRow}>
        <SkeletonBlock width="31%" height={50} style={styles.actionBlock} />
        <SkeletonBlock width="31%" height={50} style={styles.actionBlock} />
        <SkeletonBlock width="31%" height={50} style={styles.actionBlock} />
      </View>
      {/* Nav cards */}
      <SkeletonBlock width="100%" height={48} style={styles.navBlock} />
      <SkeletonBlock width="100%" height={48} style={styles.navBlock} />
      <SkeletonBlock width="100%" height={48} style={styles.navBlock} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    borderRadius: radii.md,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(9,16,28,0.88)",
    padding: 20,
    gap: 12,
  },
  photoBlock: { borderRadius: 24 },
  textBlock: { borderRadius: 8 },
  eyebrowBlock: { borderRadius: 4 },
  inputBlock: { borderRadius: 18 },
  chipBlock: { borderRadius: 999 },
  actionBlock: { borderRadius: 20 },
  navBlock: { borderRadius: 22 },
  switchBlock: { borderRadius: 14 },
  nameRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionRow: { flexDirection: "row", gap: 10, justifyContent: "space-between" },
  completionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  fieldGroup: { gap: 7 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 22, borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.025)", padding: 16 },
  listCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(9,16,28,0.88)",
    padding: 16,
    gap: 0,
  },
  listRow: { flexDirection: "row", gap: 12, paddingVertical: 14, alignItems: "center" },
  listRowBorder: { borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.05)" },
  listText: { flex: 1, gap: 6 },
  avatarBlock: { borderRadius: 16 },
});
