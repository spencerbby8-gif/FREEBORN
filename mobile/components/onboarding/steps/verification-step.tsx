import { InfoCardStep } from "./info-card-step";
import type { StepProps } from "../shared";

export function VerificationStep(_props: StepProps) {
  return (
    <InfoCardStep
      title="Trust status"
      body="Verification helps people trust your profile. You can complete a verification selfie anytime from your Profile Hub — you don't need to wait."
      tip="Unverified profiles are still active and discoverable. The badge appears only after you choose to verify."
    />
  );
}
