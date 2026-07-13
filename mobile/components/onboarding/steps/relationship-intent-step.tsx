import { StyleSheet, Text, View } from "react-native";
import { relationshipGoalOptions } from "@freeborn/shared";
import { colors } from "@freeborn/shared";
import { OptionCardRow } from "@/components/onboarding/option-card-row";
import type { StepProps } from "../shared";

export function RelationshipIntentStep({ draft, errors, onUpdate }: StepProps) {
  return (
    <View style={styles.field}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>Relationship intent</Text>
        <Text style={styles.counter}>{draft.relationship_goals.length}/3</Text>
      </View>
      <OptionCardRow
        options={relationshipGoalOptions.map((o) => ({
          value: o.value,
          label: o.label,
          caption: o.caption,
        }))}
        value={draft.relationship_goals}
        onChange={(next) => onUpdate("relationship_goals", next)}
        max={3}
      />
      {errors.relationship_goals ? (
        <Text style={styles.errorText}>{errors.relationship_goals}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  counter: {
    color: colors.ash,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: "600" },
});
