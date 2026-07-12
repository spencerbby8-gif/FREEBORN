import { PropsWithChildren } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radii } from "@freeborn/shared";
import { premiumShadow } from "@/components/magic-background";

type GlassCardProps = PropsWithChildren<{
  style?: ViewStyle;
}>;

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.shell, style]}>
      <BlurView intensity={24} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 28,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(9,16,28,0.70)",
    ...premiumShadow,
  },
  inner: {
    position: "relative",
    zIndex: 1,
    padding: 20,
  },
});
