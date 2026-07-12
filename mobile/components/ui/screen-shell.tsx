import { type ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { colors } from "@freeborn/shared";
import { MagicBackground } from "@/components/magic-background";

type ScreenShellProps = {
  children: ReactNode;
  scroll?: boolean;
  contentStyle?: ViewStyle;
  noPadding?: boolean;
};

export function ScreenShell({ children, scroll = true, contentStyle, noPadding }: ScreenShellProps) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, noPadding && styles.noPadding, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, noPadding && styles.noPadding, contentStyle]}>
      {children}
    </View>
  );

  return (
    <LinearGradient
      colors={["#03050b", colors.night, colors.midnight, colors.slate]}
      style={styles.container}
    >
      <MagicBackground />
      <SafeAreaView style={styles.safe}>
        {inner}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 120,
    gap: 16,
  },
  noPadding: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
});
