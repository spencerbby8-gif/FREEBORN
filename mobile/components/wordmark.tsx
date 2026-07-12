import { View, Text, StyleSheet } from "react-native";
import { brand, colors } from "@freeborn/shared";

export function Wordmark() {
  return (
    <View style={styles.row}>
      <View style={styles.markShell}>
        <View style={styles.markInner}>
          <View style={styles.markColumn} />
          <View style={styles.markRing} />
          <View style={styles.markColumn} />
        </View>
      </View>
      <View>
        <Text style={styles.name}>{brand.name}</Text>
        <Text style={styles.caption}>{brand.tagline.toUpperCase()}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  markShell: {
    width: 42,
    height: 42,
    borderRadius: 16,
    padding: 1,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  markInner: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: colors.night,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  markColumn: {
    width: 2,
    height: 14,
    borderRadius: 999,
    backgroundColor: colors.pearl,
  },
  markRing: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.4,
    borderTopColor: colors.pearl,
    borderBottomColor: colors.pearl,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  name: {
    color: colors.pearl,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  caption: {
    marginTop: 1,
    color: colors.ash,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 2.6,
  },
});
