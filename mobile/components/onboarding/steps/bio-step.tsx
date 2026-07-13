import { StyleSheet } from "react-native";
import { onboardingFieldHints } from "@freeborn/shared";
import { OnboardingInput } from "@/components/onboarding/onboarding-input";
import type { StepProps } from "../shared";

export function BioStep({ draft, errors, onUpdate }: StepProps) {
  return (
    <>
      <OnboardingInput
        label="Short bio"
        value={draft.bio}
        error={errors.bio}
        placeholder="A grounded intro: what you value, how you spend a good Sunday, and what feels meaningful."
        onChangeText={(v) => onUpdate("bio", v.slice(0, 500))}
        hint={`${draft.bio.length}/500 · Keep it human — contact details are blocked.`}
        multiline
        style={styles.bioInput}
      />
      <OnboardingInput
        label="Occupation"
        value={draft.occupation}
        error={errors.occupation}
        placeholder="What do you do?"
        onChangeText={(v) => onUpdate("occupation", v)}
        hint={onboardingFieldHints.occupation}
        optional
      />
      <OnboardingInput
        label="Education"
        value={draft.education}
        error={errors.education}
        placeholder="Where did you study?"
        onChangeText={(v) => onUpdate("education", v)}
        hint={onboardingFieldHints.education}
        optional
      />
    </>
  );
}

const styles = StyleSheet.create({
  bioInput: { minHeight: 100, textAlignVertical: "top" },
});
