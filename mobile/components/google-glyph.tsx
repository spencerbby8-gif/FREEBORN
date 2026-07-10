import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";

export function GoogleGlyph({ size = 18 }: { size?: number }) {
  return (
    <View
      style={[
        styles.badge,
        { width: size + 12, height: size + 12, borderRadius: (size + 12) / 2 },
      ]}
    >
      <Ionicons name="logo-google" size={size} color="#1f1f1f" />
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
});
