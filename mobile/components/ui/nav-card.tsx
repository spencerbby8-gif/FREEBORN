import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";

type NavCardProps = {
  icon: string;
  title: string;
  subtitle?: string;
  count?: number;
  onPress: () => void;
  accent?: "gold" | "teal" | "violet" | "ember";
  disabled?: boolean;
};

export function NavCard({ icon, title, subtitle, count, onPress, accent, disabled }: NavCardProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.card,
        accent === "gold" && styles.cardGold,
        accent === "teal" && styles.cardTeal,
        accent === "violet" && styles.cardViolet,
        accent === "ember" && styles.cardEmber,
        pressed && styles.cardPressed,
        disabled && styles.cardDisabled,
      ]}
    >
      <View style={[styles.iconBox, accent === "gold" && styles.iconGold, accent === "teal" && styles.iconTeal, accent === "violet" && styles.iconViolet, accent === "ember" && styles.iconEmber]}>
        <Text style={[styles.iconGlyph, accent === "gold" && styles.iconGlyphGold, accent === "teal" && styles.iconGlyphTeal, accent === "violet" && styles.iconGlyphViolet, accent === "ember" && styles.iconGlyphEmber]}>{icon}</Text>
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      </View>
      {count != null ? (
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      ) : null}
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.03)",
  },
  cardGold: { borderColor: "rgba(246,215,154,0.16)", backgroundColor: "rgba(217,167,82,0.06)" },
  cardTeal: { borderColor: "rgba(166,230,220,0.14)", backgroundColor: "rgba(79,184,167,0.05)" },
  cardViolet: { borderColor: "rgba(200,185,255,0.14)", backgroundColor: "rgba(138,110,242,0.05)" },
  cardEmber: { borderColor: "rgba(239,94,94,0.14)", backgroundColor: "rgba(239,94,94,0.05)" },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.985 }] },
  cardDisabled: { opacity: 0.4 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconGold: { backgroundColor: "rgba(217,167,82,0.14)" },
  iconTeal: { backgroundColor: "rgba(79,184,167,0.14)" },
  iconViolet: { backgroundColor: "rgba(138,110,242,0.14)" },
  iconEmber: { backgroundColor: "rgba(239,94,94,0.14)" },
  iconGlyph: { fontSize: 18, color: colors.mist, fontWeight: "700" },
  iconGlyphGold: { color: colors.gold300 },
  iconGlyphTeal: { color: colors.teal300 },
  iconGlyphViolet: { color: colors.violet300 },
  iconGlyphEmber: { color: colors.ember300 },
  textCol: { flex: 1, gap: 2 },
  title: { color: colors.pearl, fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  subtitle: { color: colors.mist, fontSize: 12, lineHeight: 16 },
  countBadge: {
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 9,
    paddingVertical: 3,
    minWidth: 24,
    alignItems: "center",
  },
  countText: { color: colors.sand, fontSize: 11, fontWeight: "900" },
  chevron: { color: colors.ash, fontSize: 22, fontWeight: "700", marginRight: -4 },
});
