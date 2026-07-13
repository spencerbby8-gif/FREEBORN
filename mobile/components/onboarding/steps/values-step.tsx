import { valueOptions } from "@freeborn/shared";
import { ChipSelect } from "@/components/onboarding/chip-select";
import type { StepProps } from "../shared";

export function ValuesStep({ draft, errors, onUpdate }: StepProps) {
  return (
    <ChipSelect
      label="Values"
      options={valueOptions as unknown as string[]}
      value={draft.values}
      onChange={(next) => onUpdate("values", next)}
      error={errors.values}
      hint="Choose up to 8 values that matter most for compatibility."
      max={8}
    />
  );
}
