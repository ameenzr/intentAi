import type { SoftwareProfile } from "../data/softwareProfiles.js";
import type { GeneratedInterface } from "../types/generatedInterface.js";

const formatControlNames = (generatedInterface: GeneratedInterface) =>
  generatedInterface.controls
    .slice(0, 4)
    .map((control) => control.label)
    .join(", ");

export const generateFallbackFollowUp = (
  softwareProfile: SoftwareProfile,
  userIntent: string,
  generatedInterface: GeneratedInterface,
  message: string
) => {
  const controlNames = formatControlNames(generatedInterface);
  const normalizedMessage = message.toLowerCase();

  if (softwareProfile.id === "miniphotopro") {
    if (normalizedMessage.includes("premium")) {
      return {
        reply: `For a more premium look, start with ${controlNames}. Keep brightness modest, raise contrast a little, and avoid heavy saturation. For "${userIntent}", I would use a clean background, a soft product shadow, and just enough sharpness to make details feel crisp without looking artificial.`
      };
    }

    if (normalizedMessage.includes("natural")) {
      return {
        reply: `To keep the result natural, make smaller changes than you think you need. Use brightness and contrast gently, keep warmth close to neutral, and use noise reduction only enough to clean the image. The goal is for the edit to feel polished, not obviously edited.`
      };
    }

    if (
      normalizedMessage.includes("dramatic") ||
      normalizedMessage.includes("poster")
    ) {
      return {
        reply: `For a more dramatic result, lean on contrast, warmth, crop ratio, and headline text. Increase contrast first, add a little warmth for mood, then choose a taller crop if this is poster-like. Keep the headline short so the image still carries the composition.`
      };
    }

    if (
      normalizedMessage.includes("clean") ||
      normalizedMessage.includes("background")
    ) {
      return {
        reply: `For a cleaner result, use remove background first, then choose a simple background color. After that, adjust brightness and product shadow together so the subject feels grounded. This is usually the safest path for ecommerce or catalog-style images.`
      };
    }
  }

  return {
    reply: `I would work through this interface from top to bottom. Start with ${controlNames || "the first few controls"}, make one small change at a time, and compare the result against your original goal: "${userIntent}". If you want it to feel more polished, use subtle values first, then increase only the controls that clearly improve the result.`
  };
};
