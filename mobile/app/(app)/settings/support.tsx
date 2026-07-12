import { useState } from "react";
import { Alert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, faqs } from "@freeborn/shared";
import { DetailScreenShell } from "@/components/ui/detail-screen-shell";
import { SurfaceCard } from "@/components/ui/surface-card";
import { SectionHeader } from "@/components/ui/section-header";

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Pressable
      onPress={() => setOpen(!open)}
      style={styles.faqItem}
      accessibilityRole="button"
      accessibilityLabel={q}
      accessibilityState={{ expanded: open }}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQ}>{q}</Text>
        <Text style={[styles.faqChevron, open && styles.faqChevronOpen]}>
          {open ? "−" : "+"}
        </Text>
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </Pressable>
  );
}

export default function SupportScreen() {
  const openEmail = () => {
    Linking.openURL("mailto:support@freeborn.app?subject=Freeborn%20Support%20Request").catch(() => {
      Alert.alert("Could not open email", "Please email support@freeborn.app directly.");
    });
  };

  const openReportEmail = () => {
    Linking.openURL("mailto:support@freeborn.app?subject=Safety%20Report%20-%20Freeborn&body=Please%20describe%20your%20concern%20below%3A%0A%0A").catch(() => {
      Alert.alert("Could not open email", "Please email support@freeborn.app directly with your safety concern.");
    });
  };

  return (
    <DetailScreenShell title="Support" subtitle="Get help">
      <SurfaceCard>
        <SectionHeader eyebrow="Help" title="How can we help?" body="Freeborn is here to support your experience. Reach out anytime." />
        <Pressable onPress={openEmail} style={styles.contactItem} accessibilityRole="link" accessibilityLabel="Email support at support@freeborn.app">
          <Text style={styles.contactIcon}>✉</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.contactTitle}>Email support</Text>
            <Text style={styles.contactBody}>support@freeborn.app</Text>
          </View>
          <Text style={styles.contactChevron}>›</Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="FAQ" title="Common questions" body="Tap a question to see the answer." />
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} />
        ))}
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Feedback" title="Share your thoughts" body="Freeborn is shaped by its members. Your feedback helps us build a better experience." />
        <Pressable onPress={openEmail} style={styles.feedbackBtn} accessibilityRole="link" accessibilityLabel="Send feedback email">
          <Text style={styles.feedbackBtnText}>Send feedback</Text>
        </Pressable>
      </SurfaceCard>

      <SurfaceCard>
        <SectionHeader eyebrow="Safety" title="Report a concern" body="If you experience harassment, abuse, or a safety issue, contact our support team directly." />
        <Pressable onPress={openReportEmail} style={styles.reportBtn} accessibilityRole="link" accessibilityLabel="Report a safety concern via email">
          <Text style={styles.reportBtnText}>Report a safety concern</Text>
        </Pressable>
        <Text style={styles.reportHint}>Reports are reviewed promptly and treated with care.</Text>
      </SurfaceCard>
    </DetailScreenShell>
  );
}

const styles = StyleSheet.create({
  contactItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8, minHeight: 56 },
  contactIcon: { fontSize: 20, color: colors.gold300 },
  contactTitle: { color: colors.pearl, fontSize: 14, fontWeight: "800" },
  contactBody: { color: colors.mist, fontSize: 13, marginTop: 2 },
  contactChevron: { color: colors.ash, fontSize: 22, fontWeight: "700" },
  faqItem: { gap: 6, paddingVertical: 12, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" },
  faqHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  faqQ: { color: colors.pearl, fontSize: 14, fontWeight: "800", flex: 1 },
  faqChevron: { color: colors.gold300, fontSize: 18, fontWeight: "900", width: 24, textAlign: "center" },
  faqChevronOpen: { color: colors.pearl },
  faqA: { color: colors.mist, fontSize: 13, lineHeight: 20, marginTop: 4 },
  feedbackBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(246,215,154,0.20)",
    backgroundColor: "rgba(217,167,82,0.08)",
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  feedbackBtnText: { color: colors.gold300, fontSize: 14, fontWeight: "900" },
  reportBtn: {
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,107,122,0.20)",
    backgroundColor: "rgba(255,107,122,0.06)",
    alignItems: "center",
    minHeight: 50,
    justifyContent: "center",
  },
  reportBtnText: { color: colors.danger, fontSize: 14, fontWeight: "900" },
  reportHint: { color: colors.ash, fontSize: 12, marginTop: 10, lineHeight: 18 },
});
