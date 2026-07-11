import { PropsWithChildren } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radii } from "@freeborn/shared";
import { MagicBackground, premiumShadow } from "@/components/magic-background";
import { ProfilePreviewCard } from "@/components/profile-preview-card";
import { Wordmark } from "@/components/wordmark";

export function AuthSurface({
  eyebrow,
  title,
  description,
  children,
}: PropsWithChildren<{
  eyebrow: string;
  title: string;
  description: string;
}>) {
  return (
    <LinearGradient colors={["#03050b", colors.night, colors.midnight, colors.slate]} style={styles.container}>
      <MagicBackground />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Wordmark />

        <View style={styles.heroBlock}>
          <View style={styles.eyebrow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrowLabel}>{eyebrow}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <ProfilePreviewCard />

        <View style={styles.formCard}>{children}</View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 42,
    gap: 22,
  },
  heroBlock: {
    gap: 14,
    marginTop: 18,
  },
  eyebrow: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  eyebrowDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.accentGold,
  },
  eyebrowLabel: {
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2.4,
    textTransform: "uppercase",
  },
  title: {
    color: colors.pearl,
    fontSize: 40,
    lineHeight: 44,
    fontWeight: "700",
    letterSpacing: -1.8,
    maxWidth: 330,
  },
  description: {
    color: colors.mist,
    fontSize: 15,
    lineHeight: 26,
    maxWidth: 344,
  },
  formCard: {
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(9,16,28,0.86)",
    padding: 18,
    ...premiumShadow,
  },
});
