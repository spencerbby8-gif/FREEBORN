import { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import { onboardingFieldHints } from "@freeborn/shared";
import { OnboardingInput } from "@/components/onboarding/onboarding-input";
import type { StepProps } from "../shared";

export function BioStep({ draft, errors, onUpdate }: StepProps) {
  const [localBio, setLocalBio] = useState(draft.bio);
  const [localOccupation, setLocalOccupation] = useState(draft.occupation);
  const [localEducation, setLocalEducation] = useState(draft.education);

  useEffect(() => {
    setLocalBio(draft.bio);
    setLocalOccupation(draft.occupation);
    setLocalEducation(draft.education);
  }, [draft.bio, draft.occupation, draft.education]);

  return (
    <>
      <OnboardingInput
        label="Short bio"
        value={localBio}
        error={errors.bio}
        placeholder="A grounded intro: what you value, how you spend a good Sunday, and what feels meaningful."
        onChangeText={(v) => {
          const sliced = v.slice(0, 500);
          setLocalBio(sliced);
          onUpdate("bio", sliced);
        }}
        onBlur={() => onUpdate("bio", localBio)}
        hint={`${localBio.length}/500 · Keep it human — contact details are blocked.`}
        multiline
        style={styles.bioInput}
      />
      <OnboardingInput
        label="Occupation"
        value={localOccupation}
        error={errors.occupation}
        placeholder="What do you do?"
        onChangeText={(v) => {
          setLocalOccupation(v);
          onUpdate("occupation", v);
        }}
        onBlur={() => onUpdate("occupation", localOccupation)}
        hint={onboardingFieldHints.occupation}
        optional
      />
      <OnboardingInput
        label="Education"
        value={localEducation}
        error={errors.education}
        placeholder="Where did you study?"
        onChangeText={(v) => {
          setLocalEducation(v);
          onUpdate("education", v);
        }}
        onBlur={() => onUpdate("education", localEducation)}
        hint={onboardingFieldHints.education}
        optional
      />
    </>
  );
}

const styles = StyleSheet.create({
  bioInput: { minHeight: 100, textAlignVertical: "top" },
});
