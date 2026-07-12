import { useCallback, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  type WithSpringConfig,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import { colors, type DiscoveryCandidate, type ProfilePhoto } from "@freeborn/shared";
import { premiumShadow } from "@/components/magic-background";

const SWIPE_THRESHOLD = 140;
const SPRING_BACK: WithSpringConfig = { damping: 20, stiffness: 180, mass: 0.8 };

type SwipeCardProps = {
  candidate: DiscoveryCandidate;
  photoUrl: string | null;
  matchedName: string | null;
  onSwipe: (action: "like" | "pass" | "superlike") => void;
  onBlockReport: (candidateId: string) => void;
};

export function SwipeCard({ candidate, photoUrl, matchedName, onSwipe, onBlockReport }: SwipeCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const cardScale = useSharedValue(1);
  const cardWidth = useSharedValue(0);

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    cardWidth.value = e.nativeEvent.layout.width;
  }, []);

  // Reset animation values when card changes
  useEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
    cardOpacity.value = withSpring(1, { damping: 18, stiffness: 140 });
    cardScale.value = withSpring(1, { damping: 18, stiffness: 140 });
  }, [candidate.id]);

  const triggerSwipe = useCallback(
    (action: "like" | "pass" | "superlike") => {
      onSwipe(action);
    },
    [onSwipe],
  );

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .activeOffsetY([-10, 10])
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      const x = event.translationX;
      const y = event.translationY;

      // Swipe right = like
      if (x > SWIPE_THRESHOLD) {
        translateX.value = withSpring(600, { velocity: event.velocityX, damping: 16, stiffness: 80 }, (finished) => {
          if (finished) runOnJS(triggerSwipe)("like");
        });
        return;
      }
      // Swipe left = pass
      if (x < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-600, { velocity: event.velocityX, damping: 16, stiffness: 80 }, (finished) => {
          if (finished) runOnJS(triggerSwipe)("pass");
        });
        return;
      }
      // Swipe up = superlike / spark
      if (y < -SWIPE_THRESHOLD) {
        translateY.value = withSpring(-800, { velocity: event.velocityY, damping: 16, stiffness: 80 }, (finished) => {
          if (finished) runOnJS(triggerSwipe)("superlike");
        });
        return;
      }
      // Spring back
      translateX.value = withSpring(0, SPRING_BACK);
      translateY.value = withSpring(0, SPRING_BACK);
    });

  const rotation = useAnimatedStyle(() => {
    const w = cardWidth.value || 1;
    const rotate = interpolate(translateX.value, [-w, 0, w], [-12, 0, 12]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
        { scale: cardScale.value },
      ],
      opacity: cardOpacity.value,
    };
  });

  // Like overlay (right swipe)
  const likeOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, SWIPE_THRESHOLD * 0.5, SWIPE_THRESHOLD], [0, 0.7, 1]);
    const scale = interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0.85, 1.05]);
    return { opacity, transform: [{ scale }] };
  });

  // Pass overlay (left swipe)
  const passOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, -SWIPE_THRESHOLD * 0.5, -SWIPE_THRESHOLD], [0, 0.7, 1]);
    const scale = interpolate(translateX.value, [0, -SWIPE_THRESHOLD], [0.85, 1.05]);
    return { opacity, transform: [{ scale }] };
  });

  // Spark overlay (upward swipe)
  const sparkOverlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateY.value, [0, -SWIPE_THRESHOLD * 0.5, -SWIPE_THRESHOLD], [0, 0.7, 1]);
    const scale = interpolate(translateY.value, [0, -SWIPE_THRESHOLD], [0.85, 1.05]);
    return { opacity, transform: [{ scale }] };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.cardShell, rotation]} onLayout={handleLayout}>
        {/* Photo area */}
        <View style={styles.photoBox}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.profilePhoto} resizeMode="cover" />
          ) : (
            <View style={styles.initialsContainer}>
              <Text style={styles.initials}>{(candidate.display_name ?? "FB").slice(0, 2).toUpperCase()}</Text>
              <Text style={styles.noPhotoText}>No public photo yet</Text>
            </View>
          )}

          {/* Bottom gradient overlay */}
          <LinearGradient
            colors={["transparent", "rgba(9,16,28,0.82)"]}
            style={styles.photoFade}
          />

          {/* Verified badge */}
          {candidate.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓ Verified</Text>
            </View>
          )}

          {/* Name overlay at photo bottom */}
          <View style={styles.nameOverlay}>
            <Text style={styles.name}>
              {candidate.display_name ?? "Freeborn member"}
              {candidate.age ? <Text style={styles.age}>  {candidate.age}</Text> : null}
            </Text>
            <Text style={styles.locationLine}>
              {[candidate.city, candidate.region].filter(Boolean).join(", ") || "Nearby"}
              {candidate.occupation ? ` · ${candidate.occupation}` : ""}
            </Text>
          </View>

          {/* Swipe overlay labels */}
          <Animated.View style={[styles.swipeLabelContainer, styles.likeLabel, likeOverlayStyle]}>
            <Text style={styles.likeLabelIcon}>♥</Text>
            <Text style={styles.likeLabelText}>LIKE</Text>
          </Animated.View>
          <Animated.View style={[styles.swipeLabelContainer, styles.passLabel, passOverlayStyle]}>
            <Text style={styles.passLabelIcon}>✕</Text>
            <Text style={styles.passLabelText}>PASS</Text>
          </Animated.View>
          <Animated.View style={[styles.swipeLabelContainer, styles.sparkLabel, sparkOverlayStyle]}>
            <Text style={styles.sparkLabelIcon}>★</Text>
            <Text style={styles.sparkLabelText}>SPARK</Text>
          </Animated.View>
        </View>

        {/* Info section */}
        <View style={styles.infoSection}>
          <Text style={styles.bio} numberOfLines={4}>
            {candidate.bio ?? "This member has not added a bio yet. Look for their interests and intentions before deciding."}
          </Text>

          {/* Chips */}
          <View style={styles.chips}>
            {(candidate.relationship_goals ?? []).slice(0, 2).map((g) => (
              <View key={g} style={styles.goldChip}>
                <Text style={styles.goldChipText}>{g.replace(/_/g, " ")}</Text>
              </View>
            ))}
            {(candidate.interests ?? []).slice(0, 4).map((i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{i}</Text>
              </View>
            ))}
          </View>

          {/* Match banner */}
          {matchedName && (
            <View style={styles.matchBanner}>
              <Text style={styles.matchEyebrow}>It&apos;s a match</Text>
              <Text style={styles.matchBody}>You and {matchedName} liked each other.</Text>
              <Text style={styles.matchHint}>Start from something specific in their profile.</Text>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardShell: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(9,16,28,0.88)",
    overflow: "hidden",
    ...premiumShadow,
  },
  photoBox: {
    height: 320,
    backgroundColor: "rgba(255,133,120,0.06)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  },
  profilePhoto: { width: "100%", height: "100%" },
  initialsContainer: {
    width: 120,
    minHeight: 100,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.06)",
    justifyContent: "center",
    alignItems: "center",
    padding: 14,
  },
  initials: {
    color: colors.pearl,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1,
  },
  noPhotoText: {
    color: colors.mist,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 8,
    textAlign: "center",
  },
  photoFade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  verifiedBadge: {
    position: "absolute",
    right: 14,
    top: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  verifiedText: {
    color: colors.pearl,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  nameOverlay: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: 16,
  },
  name: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1.2,
    lineHeight: 30,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 6,
  },
  age: { color: "rgba(255,255,255,0.80)", fontSize: 20, fontWeight: "700" },
  locationLine: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  /* Swipe overlay labels */
  swipeLabelContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  likeLabel: {
    top: 50,
    left: 24,
    transform: [{ rotate: "-16deg" }],
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.pearl,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "rgba(5,7,13,0.42)",
  },
  likeLabelIcon: {
    color: colors.pearl,
    fontSize: 36,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 8,
  },
  likeLabelText: {
    color: colors.pearl,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 8,
  },
  passLabel: {
    top: 50,
    right: 24,
    transform: [{ rotate: "16deg" }],
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.mist,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "rgba(5,7,13,0.42)",
  },
  passLabelIcon: {
    color: colors.mist,
    fontSize: 36,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 8,
  },
  passLabelText: {
    color: colors.mist,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 8,
  },
  sparkLabel: {
    top: 28,
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 3,
    borderColor: colors.violet300,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: "rgba(5,7,13,0.42)",
  },
  sparkLabelIcon: {
    color: colors.violet300,
    fontSize: 36,
    fontWeight: "900",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 8,
  },
  sparkLabelText: {
    color: colors.violet300,
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 8,
  },

  /* Info section */
  infoSection: { padding: 20, gap: 12 },
  bio: {
    color: colors.pearl,
    opacity: 0.92,
    fontSize: 14,
    lineHeight: 22,
  },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  goldChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.28)",
    backgroundColor: "rgba(217,167,82,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  goldChipText: { color: colors.pearl, fontSize: 11, fontWeight: "900" },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  chipText: { color: colors.mist, fontSize: 11, fontWeight: "700" },
  matchBanner: {
    backgroundColor: "rgba(241,201,122,0.10)",
    borderWidth: 1,
    borderColor: "rgba(241,201,122,0.28)",
    borderRadius: 20,
    padding: 16,
  },
  matchEyebrow: {
    color: colors.gold300,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.8,
    fontSize: 10,
  },
  matchBody: { color: colors.pearl, marginTop: 6, fontWeight: "800", fontSize: 16 },
  matchHint: { color: colors.mist, marginTop: 4, fontSize: 12, lineHeight: 18 },
});
