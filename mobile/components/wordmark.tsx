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
        <Text style={styles.caption}>INTENTIONAL CONNECTION</Text>
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
    width: 44,
    height: 44,
    borderRadius: 18,
    padding: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  markInner: {
    flex: 1,
    borderRadius: 17,
    backgroundColor: colors.night,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 4,
  },
  markColumn: {
    width: 2,
    height: 16,
    borderRadius: 999,
    backgroundColor: colors.pearl,
  },
  markRing: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1.6,
    borderTopColor: colors.pearl,
    borderBottomColor: colors.pearl,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  name: {
    color: colors.pearl,
    fontSize: 24,
    fontWeight: "600",
    letterSpacing: -0.9,
  },
  caption: {
    marginTop: 2,
    color: colors.stone,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2.8,
  },
});
