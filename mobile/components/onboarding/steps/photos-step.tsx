import { InfoCardStep } from "./info-card-step";
import type { StepProps } from "../shared";

export function PhotosStep(_props: StepProps) {
  return (
    <InfoCardStep
      title="Photos come next"
      body="After onboarding, you can upload, crop, and reorder photos from your Profile Hub. For now, just continue — your profile will be active and discoverable."
      tip="Best quality: clear face, natural light, no heavy filters or text overlays."
    />
  );
}
