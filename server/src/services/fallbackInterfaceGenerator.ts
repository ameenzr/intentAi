import type {
  Capability,
  SoftwareProfile
} from "../data/softwareProfiles.js";
import type {
  GeneratedControl,
  GeneratedInterface
} from "../types/generatedInterface.js";

type FallbackTemplate = {
  keywords: string[];
  title: string;
  capabilityIds: string[];
  workflow: string[];
};

const miniPhotoProTemplates: FallbackTemplate[] = [
  {
    keywords: ["ecommerce", "product", "store", "amazon", "listing"],
    title: "Professional Ecommerce Product Photo",
    capabilityIds: [
      "remove_background",
      "background_color",
      "brightness",
      "contrast",
      "clarity",
      "padding",
      "product_shadow",
      "platform_preset"
    ],
    workflow: [
      "Clean up the product so it stands apart from the original background.",
      "Set a simple background that feels store-ready.",
      "Tune clarity, light, and shadow before exporting the listing asset."
    ]
  },
  {
    keywords: ["instagram", "cafe", "cozy"],
    title: "Cozy Social Post",
    capabilityIds: [
      "warmth",
      "saturation",
      "contrast",
      "crop_ratio",
      "headline_text",
      "instagram_vibe"
    ],
    workflow: [
      "Warm up the image so it feels inviting.",
      "Shape the crop for a social feed or story.",
      "Add a short headline and export a polished post."
    ]
  },
  {
    keywords: ["cinematic", "poster", "dramatic"],
    title: "Cinematic Poster",
    capabilityIds: [
      "contrast",
      "warmth",
      "vignette",
      "product_shadow",
      "crop_ratio",
      "headline_text",
      "cinematic_tone"
    ],
    workflow: [
      "Build drama with contrast and warmer color.",
      "Use shadow and crop to create a poster-like composition.",
      "Add headline text and export the final artwork."
    ]
  }
];

const generalCapabilityIds = [
  "remove_background",
  "background_color",
  "brightness",
  "contrast",
  "crop_ratio",
  "zoom",
  "headline_text"
];

const defaultByCapabilityId: Record<string, string | number | boolean> = {
  remove_background: true,
  background_color: "#ffffff",
  brightness: 12,
  contrast: 18,
  exposure: 0,
  sharpness: 35,
  clarity: 22,
  blur: 0,
  noise_reduction: 20,
  product_shadow: 30,
  background_blur: 0,
  crop_ratio: "1:1",
  padding: 32,
  alignment: "Center",
  zoom: 100,
  export_ecommerce: true,
  export_png: true,
  export_jpg: true,
  resize: "Original",
  compression: 12,
  platform_preset: "Amazon",
  headline_text: "",
  subtext: "",
  text_position: "Bottom",
  font_size: 28,
  font_weight: "Bold",
  text_color: "#ffffff",
  saturation: 12,
  warmth: 18,
  vignette: 18,
  cinematic_tone: true,
  instagram_vibe: true,
  premium_look: true
};

const purposeByCapabilityId: Record<string, string> = {
  remove_background:
    "Removes distractions so the subject becomes the clear focus.",
  background_color:
    "Creates a clean backdrop that matches the final channel or mood.",
  brightness:
    "Makes the image easier to see without changing the whole design.",
  contrast:
    "Adds definition so the subject feels sharper and more intentional.",
  sharpness:
    "Improves visible detail for a crisper final image.",
  clarity:
    "Adds midtone punch so the subject feels cleaner and more dimensional.",
  blur:
    "Softens parts of the image for a more controlled visual focus.",
  noise_reduction:
    "Cleans up grain and rough texture so the result feels more professional.",
  background_blur:
    "Suggests depth by softening the scene behind the subject.",
  product_shadow:
    "Adds depth so the subject does not look flat or pasted on.",
  crop_ratio:
    "Frames the design for the format where it will be shared or sold.",
  padding:
    "Creates breathing room around the product so it feels intentionally placed.",
  alignment:
    "Positions the subject so the composition feels balanced.",
  zoom:
    "Adjusts subject scale without needing a real crop tool.",
  export_ecommerce:
    "Finishes the workflow with an output preset suitable for publishing.",
  headline_text:
    "Adds a simple message that tells viewers what to notice.",
  subtext:
    "Adds a smaller supporting line without overwhelming the image.",
  text_position:
    "Places text where it supports the composition instead of covering the subject.",
  font_size:
    "Makes the message readable for the target format.",
  font_weight:
    "Controls how bold and premium the text feels.",
  text_color:
    "Keeps text legible against the edited image.",
  saturation:
    "Controls color intensity so the image feels lively without becoming harsh.",
  warmth:
    "Adjusts the mood of the image toward inviting or dramatic tones.",
  vignette:
    "Darkens the edges slightly so attention moves toward the subject.",
  cinematic_tone:
    "Applies a quick dramatic color and contrast direction.",
  instagram_vibe:
    "Applies a warmer social-media friendly look.",
  premium_look:
    "Applies a restrained clean look that feels more polished."
};

const proTipByCapabilityId: Record<string, string> = {
  remove_background: "Use this first so later edits are easier to judge.",
  background_color: "White is safest for stores; warm neutrals work well socially.",
  brightness: "Increase slowly so highlights do not look washed out.",
  contrast: "A modest boost often looks more premium than a heavy one.",
  sharpness: "Use enough to reveal detail, then stop before edges look crunchy.",
  clarity: "Use clarity before sharpness when the image feels flat.",
  blur: "Keep blur low unless you are intentionally making a soft look.",
  noise_reduction: "Pair this with sharpness so cleanup does not look blurry.",
  background_blur: "A little background blur can fake depth without complex masking.",
  product_shadow: "A soft shadow usually looks more realistic than a dark one.",
  crop_ratio: "Choose the destination format before adding headline text.",
  padding: "More padding often makes ecommerce shots feel more expensive.",
  alignment: "Center is safest for product images; bottom works well for posters.",
  zoom: "Zoom in only after crop ratio is selected.",
  export_ecommerce: "Export only after the crop and text are final.",
  headline_text: "Keep the headline short so it reads quickly on mobile.",
  subtext: "Use subtext only when the headline needs extra context.",
  text_position: "Place text in empty space, not over product detail.",
  font_size: "Large type works for posters; smaller type feels more premium.",
  font_weight: "Bold is readable, but Black can feel too loud.",
  text_color: "White works on dark images; charcoal works on light backgrounds.",
  saturation: "Boost color for social posts, reduce it for a more premium feel.",
  warmth: "Warmth helps cozy scenes; cooler tones can feel cleaner and techier.",
  vignette: "Keep the vignette subtle so it guides attention without looking fake.",
  cinematic_tone: "Use this after crop so the mood matches the final composition.",
  instagram_vibe: "Use this when warmth and saturation matter more than accuracy.",
  premium_look: "Use this when the edit should feel clean, restrained, and commercial."
};

const includesAnyKeyword = (intent: string, keywords: string[]) =>
  keywords.some((keyword) => intent.includes(keyword));

const getCapabilitiesById = (
  softwareProfile: SoftwareProfile,
  capabilityIds: string[]
) =>
  capabilityIds
    .map((capabilityId) =>
      softwareProfile.capabilities.find(
        (capability) => capability.id === capabilityId
      )
    )
    .filter((capability): capability is Capability => Boolean(capability));

const createControl = (capability: Capability): GeneratedControl => ({
  capabilityId: capability.id,
  label: capability.label,
  componentType: capability.control,
  purpose:
    purposeByCapabilityId[capability.id] ??
    `Helps apply ${capability.label.toLowerCase()} toward the user's goal.`,
  suggestedDefault:
    defaultByCapabilityId[capability.id] ??
    capability.options?.[0] ??
    capability.min ??
    false,
  min: capability.min,
  max: capability.max,
  options: capability.options,
  proTip:
    proTipByCapabilityId[capability.id] ??
    "Start with a small adjustment and compare before finalizing."
});

const buildInterface = (
  softwareProfile: SoftwareProfile,
  userIntent: string,
  title: string,
  capabilityIds: string[],
  workflow: string[]
): GeneratedInterface => ({
  interfaceTitle: title,
  intentSummary: `A beginner-friendly ${softwareProfile.name} workspace for: ${userIntent}`,
  recommendedWorkflow: workflow,
  controls: getCapabilitiesById(softwareProfile, capabilityIds).map(
    createControl
  )
});

const buildMiniPhotoProFallback = (
  softwareProfile: SoftwareProfile,
  userIntent: string
) => {
  const normalizedIntent = userIntent.toLowerCase();
  const matchedTemplate = miniPhotoProTemplates.find((template) =>
    includesAnyKeyword(normalizedIntent, template.keywords)
  );

  if (matchedTemplate) {
    return buildInterface(
      softwareProfile,
      userIntent,
      matchedTemplate.title,
      matchedTemplate.capabilityIds,
      matchedTemplate.workflow
    );
  }

  return buildInterface(
    softwareProfile,
    userIntent,
    "Helpful Photo Editing Workspace",
    generalCapabilityIds,
    [
      "Start with the cleanup controls that make the subject easier to work with.",
      "Adjust light, contrast, and framing to match the goal.",
      "Add any needed text once the image composition feels settled."
    ]
  );
};

const buildGenericFallback = (
  softwareProfile: SoftwareProfile,
  userIntent: string
) => {
  return buildInterface(
    softwareProfile,
    userIntent,
    `${softwareProfile.name} Starter Workspace`,
    generalCapabilityIds,
    [
      "Start with the most direct control for the main goal.",
      "Make small adjustments and review the result after each step.",
      "Export once the output matches the intent."
    ]
  );
};

export const generateFallbackInterface = (
  softwareProfile: SoftwareProfile,
  userIntent: string
): GeneratedInterface => {
  if (softwareProfile.id === "miniphotopro") {
    return buildMiniPhotoProFallback(softwareProfile, userIntent);
  }

  return buildGenericFallback(softwareProfile, userIntent);
};
