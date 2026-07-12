import { StyleSheet, Text, View } from "react-native";
import { colors } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";

export default function SupportScreen() {
  return (
    <DetailScreenShell title="Support" subtitle="Get help">
      <SurfaceCard>
        <SectionHeader eyebrow="Help" title="How can we help?" body="Freeborn is here to support your experience. Reach out anytime." />
        <View style={styles.contactItem}>
          <Text style={styles.contactIcon}>✉</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Email support</Text>
            <Text style={styles.contactBody}>support@freeborn.app</Text>
          </View>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="FAQ" title="Common questions" />
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Who is Freeborn for?</Text>
          <Text style={styles.faqA}>Freeborn is for values-aligned singles who care about medical freedom, natural health, informed choice, and intentional long-term relationships.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Is my information private?</Text>
          <Text style={styles.faqA}>Emails, full birth dates, last names, and account provider details stay out of discovery cards and public profile surfaces.</Text>
        </View>
        <View style={styles.faqItem}>
          <Text style={styles.faqQ}>Is Freeborn free?</Text>
          <Text style={styles.faqA}>The current product lets members create a profile, discover people, like, match, and message without a paid plan.</Text>
        </View>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Feedback" title="Share your thoughts" body="Freeborn is shaped by its members. Your feedback helps us build a better experience." />
        <Text style={styles.feedbackHint}>Send feedback to support@freeborn.app and we'll read every message.</Text>
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  contactItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  contactIcon: { fontSize: 20, color: colors.gold300 },
  contactTitle: { color: colors.pearl, fontSize: 14, fontWeight: "800" },
  contactBody: { color: colors.mist, fontSize: 13, marginTop: 2 },
  faqItem: { gap: 4, paddingVertical: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  faqQ: { color: colors.pearl, fontSize: 14, fontWeight: "800" },
  faqA: { color: colors.mist, fontSize: 13, lineHeight: 20 },
  feedbackHint: { color: colors.mist, fontSize: 13, lineHeight: 20 },
});
