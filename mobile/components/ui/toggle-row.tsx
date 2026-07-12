import { StyleSheet, Switch, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@freeborn/shared";

type ToggleRowProps = {
  title: string;
  body: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  /** Whether haptic feedback should fire on toggle. Default: true */
  haptic?: boolean;
};

export function ToggleRow({ title, body, value, onValueChange, disabled, haptic = true }: ToggleRowProps) {
  const handleChange = (next: boolean) => {
    if (haptic) {
      Haptics.impactAsync(next ? Haptics.ImpactFeedbackStyle.Light : Haptics.ImpactFeedbackStyle.Medium);
    }
    onValueChange(next);
  };

  return (
    <View
      style={[styles.row, disabled && styles.rowDisabled]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={title}
      accessibilityHint={body}
    >
      <View style={{ flex: 1 }}>
        <Text style={[styles.rowTitle, disabled && styles.rowTitleDisabled]}>{title}</Text>
        <Text style={styles.rowBody}>{body}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={handleChange}
        disabled={disabled}
        trackColor={{
          false: "rgba(255,255,255,0.12)",
          true: disabled ? "rgba(255,255,255,0.08)" : colors.gold500,
        }}
        thumbColor={colors.pearl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.025)",
    padding: 16,
    marginTop: 12,
    minHeight: 56,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  rowTitle: {
    color: colors.pearl,
    fontSize: 14,
    fontWeight: "900",
  },
  rowTitleDisabled: {
    color: colors.mist,
  },
  rowBody: {
    color: colors.mist,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
});
