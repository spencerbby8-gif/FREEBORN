import { useEffect, useRef } from "react";
import { Animated, View, StyleSheet, type ViewStyle } from "react-native";
import { colors, radii } from "@freeborn/shared";

/** Shimmer overlay that pulses opacity on dark glass blocks */
export function SkeletonBlock({ width, height, style }: { width: number | `${number}%`; height: number; style?: ViewStyle }) {
  const pulse = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.7, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, opacity: pulse },
        style,
      ]}
    />
  );
}

/** Discover card skeleton: photo + name + bio + chips + actions */
export function DiscoverSkeleton() {
  return (
    <View style={styles.card}>
      {/* Photo area */}
      <SkeletonBlock width="100%" height={300} style={styles.photoBlock} />

      {/* Name line */}
      <View style={styles.nameRow}>
        <SkeletonBlock width={140} height={22} style={styles.textBlock} />
        <SkeletonBlock width={40} height={18} style={styles.textBlock} />
      </View>

      {/* Location */}
      <SkeletonBlock width={180} height={14} style={styles.textBlock} />

      {/* Bio lines */}
      <SkeletonBlock width="100%" height={14} style={styles.textBlock} />
      <SkeletonBlock width="85%" height={14} style={styles.textBlock} />

      {/* Chips */}
      <View style={styles.chipRow}>
        <SkeletonBlock width={72} height={28} style={styles.chipBlock} />
        <SkeletonBlock width={90} height={28} style={styles.chipBlock} />
        <SkeletonBlock width={64} height={28} style={styles.chipBlock} />
        <SkeletonBlock width={80} height={28} style={styles.chipBlock} />
      </View>

      {/* Actions */}
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

/** Profile skeleton */
export function ProfileSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.profileOverview}>
        <SkeletonBlock width={88} height={88} style={styles.avatarBlock} />
        <View style={styles.profileInfo}>
          <SkeletonBlock width={160} height={20} style={styles.textBlock} />
          <SkeletonBlock width={120} height={14} style={styles.textBlock} />
          <SkeletonBlock width={100} height={12} style={styles.textBlock} />
        </View>
      </View>
      <SkeletonBlock width="100%" height={8} style={styles.textBlock} />
      <SkeletonBlock width="60%" height={14} style={styles.textBlock} />
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
  chipBlock: { borderRadius: 999 },
  actionBlock: { borderRadius: 20 },
  nameRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  actionRow: { flexDirection: "row", gap: 10, justifyContent: "space-between" },
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
  profileOverview: { flexDirection: "row", gap: 16, alignItems: "center" },
  profileInfo: { flex: 1, gap: 8 },
});
