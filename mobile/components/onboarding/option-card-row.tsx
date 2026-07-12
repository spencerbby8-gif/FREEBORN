import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii } from "@freeborn/shared";

type OptionCard = {
  value: string;
  label: string;
  caption?: string;
};

type OptionCardRowProps = {
  options: OptionCard[];
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  single?: boolean;
};

export function OptionCardRow({ options, value, onChange, max, single }: OptionCardRowProps) {
  const toggle = (optionValue: string) => {
    if (single) {
      const isSelected = value.includes(optionValue);
      onChange(isSelected ? [] : [optionValue]);
      return;
    }
    if (value.includes(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }
    if (max && value.length >= max) {
      return;
    }
    onChange([...value, optionValue]);
  };

  return (
    <View style={styles.grid}>
      {options.map((option) => {
        const active = value.includes(option.value);
        const disabled = !active && Boolean(max && value.length >= max);
        return (
          <Pressable
            key={option.value}
            onPress={() => toggle(option.value)}
            disabled={disabled}
            style={[
              styles.card,
              active && styles.cardActive,
              disabled && styles.cardDisabled,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>{option.label}</Text>
              {active && <View style={styles.activeDot} />}
            </View>
            {option.caption ? (
              <Text style={styles.cardCaption}>{option.caption}</Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 10 },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 16,
  },
  cardActive: {
    borderColor: "rgba(241,201,122,0.32)",
    backgroundColor: "rgba(241,201,122,0.10)",
  },
  cardDisabled: {
    opacity: 0.4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: colors.mist,
    fontSize: 14,
    fontWeight: "700",
  },
  cardLabelActive: {
    color: colors.pearl,
    fontWeight: "900",
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.gold300,
  },
  cardCaption: {
    marginTop: 4,
    color: colors.mist,
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.8,
  },
});
