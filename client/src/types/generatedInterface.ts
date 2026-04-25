export type GeneratedComponentType =
  | "slider"
  | "button"
  | "select"
  | "color_picker"
  | "toggle"
  | "text_input";

export type GeneratedControl = {
  capabilityId: string;
  label: string;
  componentType: GeneratedComponentType;
  purpose: string;
  suggestedDefault: string | number | boolean;
  min?: number | null;
  max?: number | null;
  options?: string[] | null;
  proTip: string;
};

export type GeneratedInterface = {
  interfaceTitle: string;
  intentSummary: string;
  recommendedWorkflow: string[];
  controls: GeneratedControl[];
};
