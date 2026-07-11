import { StyleSheet, View } from "react-native";
import { colors } from "@freeborn/shared";

export function MagicBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.orb, styles.orbEmber]} />
      <View style={[styles.orb, styles.orbViolet]} />
      <View style={[styles.orb, styles.orbGold]} />
      <View style={styles.grid} />
    </View>
  );
}

export const premiumShadow = {
  shadowColor: "#000",
  shadowOpacity: 0.42,
  shadowRadius: 34,
  shadowOffset: { width: 0, height: 22 },
  elevation: 18,
};

export const emberShadow = {
  shadowColor: colors.ember500,
  shadowOpacity: 0.34,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: 14 },
  elevation: 14,
};

const styles = StyleSheet.create({
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.72,
  },
  orbEmber: {
    width: 320,
    height: 320,
    left: -150,
    top: -120,
    backgroundColor: "rgba(239,94,94,0.18)",
  },
  orbViolet: {
    width: 360,
    height: 360,
    right: -190,
    top: 50,
    backgroundColor: "rgba(138,110,242,0.16)",
  },
  orbGold: {
    width: 260,
    height: 260,
    left: "26%",
    bottom: -150,
    backgroundColor: "rgba(217,167,82,0.10)",
  },
  grid: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: 0.08,
    backgroundColor: "transparent",
    borderColor: "rgba(255,255,255,0.08)",
  },
});
