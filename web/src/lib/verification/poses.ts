export type VerificationPoseGender = "male" | "female";

export type VerificationPose = {
  id: string;
  gender: VerificationPoseGender;
  title: string;
  instruction: string;
  gesture: string;
  headDirection: "straight" | "left" | "right";
  requiresHandGesture: boolean;
  assetPath: string;
};

const poseDefinitions = [
  ["open-palm", "Open palm", "Hold one open palm beside your face.", "open palm", "straight", true],
  ["ok-sign", "OK sign", "Make a clear OK sign near your cheek.", "OK sign", "straight", true],
  ["thumbs-up", "Thumbs up", "Give a visible thumbs up near shoulder height.", "thumbs up", "straight", true],
  ["peace-sign", "Peace sign", "Show a peace sign with two fingers visible.", "peace sign", "straight", true],
  ["hand-on-chin", "Hand on chin", "Rest one hand lightly near your chin.", "hand on chin", "straight", true],
  ["hand-beside-cheek", "Hand beside cheek", "Place one hand beside your cheek.", "hand beside cheek", "straight", true],
  ["head-left", "Head slightly left", "Turn your head slightly to your left.", "none", "left", false],
  ["head-right", "Head slightly right", "Turn your head slightly to your right.", "none", "right", false],
  ["straight-ahead", "Looking straight ahead", "Look straight at the camera with a neutral expression.", "none", "straight", false],
  ["natural-smile", "Natural smile", "Look straight ahead with a natural smile.", "none", "straight", false],
  ["finger-up", "Finger pointing upward", "Raise one index finger pointing upward.", "finger pointing upward", "straight", true],
  ["small-wave", "Small wave", "Give a small wave beside your face.", "small wave", "straight", true],
  ["palm-near-shoulder", "Palm near shoulder", "Hold an open palm near shoulder height.", "open palm", "right", true],
  ["ok-near-cheek", "OK near cheek", "Make an OK sign near your cheek with your head slightly left.", "OK sign", "left", true],
  ["thumbs-up-left", "Thumbs up left", "Give a thumbs up while turning slightly left.", "thumbs up", "left", true],
  ["peace-sign-right", "Peace sign right", "Show a peace sign while turning slightly right.", "peace sign", "right", true],
  ["chin-head-left", "Chin with head left", "Rest a hand near your chin while turning slightly left.", "hand on chin", "left", true],
  ["cheek-head-right", "Cheek with head right", "Place a hand beside your cheek while turning slightly right.", "hand beside cheek", "right", true],
  ["soft-smile-left", "Soft smile left", "Give a soft smile with your head slightly left.", "none", "left", false],
  ["wave-head-right", "Wave with head right", "Give a small wave with your head slightly right.", "small wave", "right", true],
] as const;

function makePose(gender: VerificationPoseGender, index: number, definition: (typeof poseDefinitions)[number]): VerificationPose {
  const [slug, title, instruction, gesture, headDirection, requiresHandGesture] = definition;
  return {
    id: `${gender}-${String(index + 1).padStart(2, "0")}-${slug}`,
    gender,
    title,
    instruction,
    gesture,
    headDirection,
    requiresHandGesture,
    assetPath: `/verification-poses/${gender}/${gender}-${String(index + 1).padStart(2, "0")}-${slug}.svg`,
  };
}

export const maleVerificationPoses = poseDefinitions.map((definition, index) => makePose("male", index, definition));
export const femaleVerificationPoses = poseDefinitions.map((definition, index) => makePose("female", index, definition));
export const verificationPoses = [...maleVerificationPoses, ...femaleVerificationPoses];

export function verificationGenderFromProfileGender(gender?: string | null): VerificationPoseGender {
  return gender === "woman" ? "female" : "male";
}

export function posesForGender(gender: VerificationPoseGender) {
  return gender === "female" ? femaleVerificationPoses : maleVerificationPoses;
}

export function getVerificationPose(id: string) {
  return verificationPoses.find((pose) => pose.id === id) ?? null;
}
