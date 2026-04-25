import type { CapabilityControl } from "../data/softwareProfiles.js";

export type GeneratedControl = {
  capabilityId: string;
  label: string;
  componentType: CapabilityControl | "toggle";
  purpose: string;
  suggestedDefault: string | number | boolean;
  min?: number;
  max?: number;
  options?: string[];
  proTip: string;
};

export type GeneratedInterface = {
  interfaceTitle: string;
  intentSummary: string;
  recommendedWorkflow: string[];
  controls: GeneratedControl[];
};
