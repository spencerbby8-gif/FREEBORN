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
            <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>{option.label}</Text>
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
  grid: {
    gap: 10,
  },
  card: {
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 14,
  },
  cardActive: {
    borderColor: colors.accentGold,
    backgroundColor: "rgba(241,201,122,0.15)",
  },
  cardDisabled: {
    opacity: 0.5,
  },
  cardLabel: {
    color: colors.mist,
    fontSize: 14,
    fontWeight: "700",
  },
  cardLabelActive: {
    color: colors.pearl,
  },
  cardCaption: {
    marginTop: 4,
    color: colors.mist,
    fontSize: 12,
    lineHeight: 18,
  },
});
