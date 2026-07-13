import type { OnboardingStep, OnboardingDraft } from "@freeborn/shared";
import { WelcomeStep } from "./steps/welcome-step";
import { IdentityStep } from "./steps/identity-step";
import { LocationStep } from "./steps/location-step";
import { RelationshipIntentStep } from "./steps/relationship-intent-step";
import { LifestyleStep } from "./steps/lifestyle-step";
import { ValuesStep } from "./steps/values-step";
import { InterestsStep } from "./steps/interests-step";
import { BioStep } from "./steps/bio-step";
import { PhotosStep } from "./steps/photos-step";
import { DiscoveryPreferencesStep } from "./steps/discovery-preferences-step";
import { VerificationStep } from "./steps/verification-step";
import { FinishStep } from "./steps/finish-step";
import type { StepProps } from "./shared";

export type StepComponentProps = StepProps & {
  step: OnboardingStep;
  dobLabel: string;
  onShowDobPicker: () => void;
};

/** Routes the current step slug to its component. */
export function StepRouter({ step, ...rest }: StepComponentProps) {
  switch (step) {
    case "welcome":
      return <WelcomeStep {...rest} />;
    case "identity":
      return <IdentityStep {...rest} />;
    case "location":
      return <LocationStep {...rest} />;
    case "relationship_intent":
    case "intent":
      return <RelationshipIntentStep {...rest} />;
    case "lifestyle":
      return <LifestyleStep {...rest} />;
    case "values":
      return <ValuesStep {...rest} />;
    case "interests":
      return <InterestsStep {...rest} />;
    case "bio":
      return <BioStep {...rest} />;
    case "photos":
      return <PhotosStep {...rest} />;
    case "discovery_preferences":
      return <DiscoveryPreferencesStep {...rest} />;
    case "verification":
      return <VerificationStep {...rest} />;
    case "finish":
      return <FinishStep {...rest} />;
    default:
      return <WelcomeStep {...rest} />;
  }
}
