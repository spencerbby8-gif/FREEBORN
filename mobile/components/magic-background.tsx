import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { colors } from "@freeborn/shared";

const sparkles = [
  { left: "12%", top: "18%", opacity: 0.34 },
  { left: "78%", top: "16%", opacity: 0.26 },
  { left: "64%", top: "36%", opacity: 0.2 },
  { left: "22%", top: "58%", opacity: 0.18 },
  { left: "86%", top: "70%", opacity: 0.24 },
] as const;

export function MagicBackground() {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(drift, {
        toValue: 1,
        duration: 14000,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      }),
      { resetBeforeIteration: true },
    );
    loop.start();
    return () => loop.stop();
  }, [drift]);

  const emberTranslate = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 22, 0] });
  const violetTranslate = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -18, 0] });
  const goldScale = drift.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1] });

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View style={[styles.orb, styles.orbEmber, { transform: [{ translateY: emberTranslate }, { scale: goldScale }] }]} />
      <Animated.View style={[styles.orb, styles.orbViolet, { transform: [{ translateX: violetTranslate }, { scale: goldScale }] }]} />
      <Animated.View style={[styles.orb, styles.orbGold, { transform: [{ translateY: violetTranslate }, { scale: goldScale }] }]} />
      {sparkles.map((sparkle, index) => (
        <Animated.View
          key={`${sparkle.left}-${sparkle.top}`}
          style={[
            styles.spark,
            {
              left: sparkle.left,
              top: sparkle.top,
              opacity: drift.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [sparkle.opacity, Math.min(sparkle.opacity + 0.24, 0.5), sparkle.opacity],
              }),
              transform: [
                {
                  scale: drift.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [1, 1.2 + index * 0.03, 1],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
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
  },
  orbEmber: {
    width: 340,
    height: 340,
    left: -170,
    top: -128,
    opacity: 0.34,
    backgroundColor: "rgba(239,94,94,0.42)",
  },
  orbViolet: {
    width: 390,
    height: 390,
    right: -220,
    top: 42,
    opacity: 0.3,
    backgroundColor: "rgba(138,110,242,0.38)",
  },
  orbGold: {
    width: 280,
    height: 280,
    left: "24%",
    bottom: -168,
    opacity: 0.24,
    backgroundColor: "rgba(217,167,82,0.38)",
  },
  spark: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: colors.gold300,
  },
});
