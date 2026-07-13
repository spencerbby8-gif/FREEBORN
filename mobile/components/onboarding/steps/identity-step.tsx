import { Pressable, StyleSheet, Text, View } from "react-native";
import { genderOptions, onboardingFieldHints } from "@freeborn/shared";
import { colors } from "@freeborn/shared";
import { OnboardingInput } from "@/components/onboarding/onboarding-input";
import { OptionCardRow } from "@/components/onboarding/option-card-row";
import type { StepProps } from "../shared";

type Props = StepProps & {
  dobLabel: string;
  onShowDobPicker: () => void;
};

export function IdentityStep({ draft, errors, onUpdate, dobLabel, onShowDobPicker }: Props) {
  return (
    <>
      <OnboardingInput
        label="Display name"
        value={draft.display_name}
        error={errors.display_name}
        placeholder="How should Freeborn introduce you?"
        onChangeText={(v) => onUpdate("display_name", v)}
        hint={onboardingFieldHints.display_name}
      />
      <View style={styles.field}>
        <Text style={styles.label}>Date of birth</Text>
        <Pressable
          onPress={onShowDobPicker}
          style={[styles.dobBtn, errors.birth_date ? styles.dobBtnError : null]}
        >
          <Text style={[styles.dobText, !dobLabel && styles.dobPlaceholder]}>
            {dobLabel || "Add your date of birth"}
          </Text>
          <Text style={styles.dobChevron}>▾</Text>
        </Pressable>
        {errors.birth_date ? <Text style={styles.errorText}>{errors.birth_date}</Text> : null}
        <Text style={styles.hint}>{onboardingFieldHints.birth_date}</Text>
      </View>
      <View style={styles.field}>
        <Text style={styles.label}>Gender</Text>
        <OptionCardRow
          options={genderOptions.map((o) => ({ value: o.value, label: o.label }))}
          value={draft.gender ? [draft.gender] : []}
          onChange={(next) => onUpdate("gender", next[0] ?? "")}
          single
        />
        {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
        <Text style={styles.hint}>{onboardingFieldHints.gender}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: colors.pearl, fontSize: 14, fontWeight: "700" },
  hint: { color: colors.mist, fontSize: 12, lineHeight: 18 },
  errorText: { color: colors.danger, fontSize: 12, fontWeight: "600" },
  dobBtn: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
    backgroundColor: "rgba(255,255,255,0.04)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  dobBtnError: { borderColor: "rgba(255,158,160,0.5)" },
  dobText: { color: colors.pearl, fontSize: 15, fontWeight: "700" },
  dobPlaceholder: { color: "rgba(255,250,245,0.30)" },
  dobChevron: { color: colors.ash, fontSize: 14 },
});
