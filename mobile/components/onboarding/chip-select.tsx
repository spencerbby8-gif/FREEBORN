import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@freeborn/shared";

type ChipSelectProps = {
  label: string;
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  error?: string;
  hint?: string;
  optional?: boolean;
  max?: number;
};

export function ChipSelect({
  label,
  options,
  value,
  onChange,
  error,
  hint,
  optional,
  max,
}: ChipSelectProps) {
  const toggle = (option: string) => {
    const isSelected = value.includes(option);
    let next: string[];
    if (isSelected) {
      next = value.filter((item) => item !== option);
    } else if (max && value.length >= max) {
      return;
    } else {
      next = [...value, option];
    }
    onChange(next);
  };

  const atMax = Boolean(max && value.length >= max);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.metaRow}>
          {optional ? (
            <View style={styles.optionalBadge}>
              <Text style={styles.optionalLabel}>Optional</Text>
            </View>
          ) : null}
          {max ? (
            <Text style={styles.counter}>
              {value.length}/{max}
            </Text>
          ) : null}
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {options.map((option) => {
          const active = value.includes(option);
          return (
            <Pressable
              key={option}
              onPress={() => toggle(option)}
              style={[
                styles.chip,
                active && styles.chipActive,
                atMax && !active && styles.chipDisabled,
              ]}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {hint && !error ? <Text style={styles.hint}>{hint}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: colors.pearl,
    fontSize: 14,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionalBadge: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.04)",
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  optionalLabel: {
    color: colors.stone,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  counter: {
    color: colors.stone,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    borderColor: colors.accentGold,
    backgroundColor: "rgba(241,201,122,0.18)",
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipLabel: {
    color: colors.mist,
    fontSize: 13,
    fontWeight: "600",
  },
  chipLabelActive: {
    color: colors.pearl,
  },
  hint: {
    color: colors.mist,
    fontSize: 12,
    lineHeight: 18,
  },
  error: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "600",
  },
});
