import { type ReactNode } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { colors, radii } from "@freeborn/shared";
import { premiumShadow } from "@/components/magic-background";

type SurfaceCardProps = {
  children: ReactNode;
  style?: ViewStyle;
  blur?: boolean;
  noPadding?: boolean;
  gap?: number;
};

export function SurfaceCard({ children, style, blur, noPadding, gap }: SurfaceCardProps) {
  if (blur) {
    return (
      <View style={[styles.shell, !noPadding && styles.padded, gap != null && { gap }, style]}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={[styles.inner, !noPadding && styles.innerPadded, gap != null && { gap }]}>
          {children}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.card, !noPadding && styles.padded, gap != null && { gap }, style]}>
      {children}
    </View>
  );
}

const cardBase = {
  borderRadius: 28,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.10)",
  backgroundColor: "rgba(9,16,28,0.88)",
  ...premiumShadow,
} as const;

const styles = StyleSheet.create({
  card: {
    ...cardBase,
    padding: 20,
    gap: 16,
  },
  shell: {
    ...cardBase,
    overflow: "hidden",
    padding: 0,
  },
  padded: {
    padding: 20,
  },
  inner: {
    position: "relative",
    zIndex: 1,
    gap: 16,
  },
  innerPadded: {
    padding: 20,
  },
});
