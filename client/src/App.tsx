import { useEffect, useMemo, useRef, useState } from "react";
import GeneratedInterfaceErrorBoundary from "./components/GeneratedInterfaceErrorBoundary";
import GeneratedInterfacePanel from "./components/GeneratedInterfacePanel";
import GeneratedJsonViewer from "./components/GeneratedJsonViewer";
import type { GeneratedInterface } from "./types/generatedInterface";

type Page = "landing" | "workspace";

type SoftwareSummary = {
  id: string;
  name: string;
  domain: string;
  description: string;
  capabilityCount: number;
};

type Capability = {
  id: string;
  label: string;
  control: CapabilityControl;
  category?: string;
  min?: number;
  max?: number;
  options?: string[];
};

type SoftwareProfile = SoftwareSummary & {
  requiresUpload: boolean;
  capabilities: Capability[];
};

type CapabilityControl =
  | "slider"
  | "button"
  | "select"
  | "color_picker"
  | "text_input";

type ControlValue = string | number | boolean;

type ImageState = {
  brightness: number;
  contrast: number;
  highlights: number;
  shadows: number;
  whites: number;
  blacks: number;
  saturation: number;
  vibrance: number;
  warmth: number;
  tint: number;
  hueShift: number;
  colorGradeShadows: string;
  colorGradeMidtones: string;
  colorGradeHighlights: string;
  exposure: number;
  blur: number;
  sharpness: number;
  clarity: number;
  texture: number;
  noiseReduction: number;
  dehaze: number;
  filmGrain: number;
  glow: number;
  chromaticAberration: number;
  stylePreset: string;
  lutStrength: number;
  backgroundColor: string;
  backgroundPreset: string;
  backgroundBlur: number;
  removeBackground: boolean;
  shadow: number;
  shadowDirection: string;
  skinSmoothing: number;
  skinTone: number;
  faceBrightness: number;
  eyeEnhancement: number;
  teethWhitening: number;
  cropRatio: string;
  rotation: number;
  perspectiveH: number;
  perspectiveV: number;
  flipped: boolean;
  zoom: number;
  padding: number;
  alignment: string;
  headlineText: string;
  subtext: string;
  watermarkText: string;
  textPosition: string;
  fontSize: number;
  fontWeight: string;
  textColor: string;
  vignette: number;
  overlayColor: string;
  overlayOpacity: number;
  outputFormat: string;
  exportSize: string;
  resize: string;
  compression: number;
};

type HealthResponse = {
  openaiConfigured?: boolean;
};

const API_BASE_URL = "http://localhost:4000";
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

const defaultImageState: ImageState = {
  brightness: 100,
  contrast: 100,
  highlights: 0,
  shadows: 0,
  whites: 0,
  blacks: 0,
  saturation: 100,
  vibrance: 0,
  warmth: 0,
  tint: 0,
  hueShift: 0,
  colorGradeShadows: "#0b1020",
  colorGradeMidtones: "#ffffff",
  colorGradeHighlights: "#fff7df",
  exposure: 0,
  blur: 0,
  sharpness: 0,
  clarity: 0,
  texture: 0,
  noiseReduction: 0,
  dehaze: 0,
  filmGrain: 0,
  glow: 0,
  chromaticAberration: 0,
  stylePreset: "None",
  lutStrength: 0,
  backgroundColor: "transparent",
  backgroundPreset: "None",
  backgroundBlur: 0,
  removeBackground: false,
  shadow: 0,
  shadowDirection: "Bottom",
  skinSmoothing: 0,
  skinTone: 0,
  faceBrightness: 0,
  eyeEnhancement: 0,
  teethWhitening: 0,
  cropRatio: "Original",
  rotation: 0,
  perspectiveH: 0,
  perspectiveV: 0,
  flipped: false,
  zoom: 100,
  padding: 0,
  alignment: "Center",
  headlineText: "",
  subtext: "",
  watermarkText: "",
  textPosition: "Bottom",
  fontSize: 28,
  fontWeight: "Bold",
  textColor: "#ffffff",
  vignette: 0,
  overlayColor: "#000000",
  overlayOpacity: 0,
  outputFormat: "PNG",
  exportSize: "Original",
  resize: "Original",
  compression: 10,
};

const defaultQuickPrompts = [
  "Make it look professional for an ecommerce listing.",
  "Give it a cinematic, film-like look.",
  "Make it warm and cozy for social media.",
];

const getIntentsForFilename = (filename: string): string[] => {
  const name = filename.toLowerCase();
  if (name.includes("portrait")) {
    return [
      "Turn this into a dramatic cinematic movie poster with a dark moody tone and bold title text",
      "Make this look like a Netflix thriller poster with high contrast and a cinematic color grade",
      "Create a film-style poster with warm shadows, vignette, and strong headline typography",
    ];
  }
  if (name.includes("product") && !name.includes("lifestyle")) {
    return [
      "Make this product photo look clean and professional for an Amazon listing with a white background",
      "Prepare this image for ecommerce — clean background, sharp details, well lit",
      "Turn this into a studio-style product shot with soft shadows and neutral tones",
    ];
  }
  if (name.includes("food") || name.includes("coffee") || name.includes("dessert")) {
    return [
      "Make this food photo vibrant and warm for Instagram with golden tones",
      "Create a cozy cafe aesthetic with soft glow and rich colors",
      "Enhance this image for social media with warmth, vibrance, and shallow depth feel",
    ];
  }
  if (name.includes("living") || name.includes("room") || name.includes("real estate")) {
    return [
      "Enhance this interior photo for a real estate listing — bright, airy, and neutral",
      "Make this room look more spacious and well-lit for a property listing",
      "Correct lighting and perspective for a professional architectural look",
    ];
  }
  if (name.includes("selfie") || name.includes("linkedin")) {
    return [
      "Retouch this portrait for a LinkedIn headshot — clean, professional, and well-lit",
      "Make this look like a corporate profile photo with natural skin and bright eyes",
      "Enhance this portrait subtly without making it look artificial",
    ];
  }
  if (name.includes("lifestyle") || name.includes("campaign")) {
    return [
      "Create a promotional image with brand colors and bold text for a product launch",
      "Turn this into a social media ad with overlay color and headline text",
      "Design a campaign banner with strong typography and visual hierarchy",
    ];
  }
  if (name.includes("street") || name.includes("vintage")) {
    return [
      "Give this image a vintage film look with grain and faded tones",
      "Make this look like a retro photo with matte colors and subtle grain",
      "Apply a nostalgic film aesthetic with soft contrast",
    ];
  }
  if (name.includes("premium") || name.includes("luxury")) {
    return [
      "Make this look premium and high-end with subtle tones and clean lighting",
      "Give this a luxury brand feel with soft contrast and neutral colors",
      "Enhance this image to feel minimal, refined, and expensive",
    ];
  }
  return defaultQuickPrompts;
};

function getDomainLabel(domain: string): string {
  return domain.replace(/_/g, " ");
}

function getAvatarLetters(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getCssFilter(imageState: ImageState): string {
  const brightness =
    imageState.brightness +
    imageState.exposure * 12 +
    imageState.whites * 0.08 +
    imageState.highlights * 0.05 +
    imageState.faceBrightness * 0.08 -
    imageState.noiseReduction * 0.08;
  const contrast =
    imageState.contrast +
    imageState.clarity * 0.35 +
    imageState.texture * 0.18 +
    imageState.dehaze * 0.2 +
    imageState.sharpness * 0.18 -
    imageState.noiseReduction * 0.12;
  const saturation =
    imageState.saturation +
    imageState.vibrance * 0.4 -
    imageState.skinSmoothing * 0.05 +
    imageState.teethWhitening * 0.03;
  const sepia = Math.max(0, imageState.warmth) * 0.35 + imageState.skinTone * 0.05;
  const hueRotate =
    imageState.hueShift +
    imageState.tint * 0.2 +
    (imageState.warmth < 0 ? imageState.warmth * 0.3 : 0);
  const blur = imageState.blur + imageState.noiseReduction * 0.015;

  return [
    `brightness(${Math.max(20, brightness)}%)`,
    `contrast(${Math.max(20, contrast)}%)`,
    `saturate(${Math.max(0, saturation)}%)`,
    `sepia(${Math.max(0, sepia)}%)`,
    `hue-rotate(${hueRotate}deg)`,
    `blur(${blur}px)`
  ].join(" ");
}

function getCropAspectRatio(cropRatio: string): string {
  const ratioMap: Record<string, string> = {
    "1:1": "1 / 1",
    "4:5": "4 / 5",
    "16:9": "16 / 9",
    "9:16": "9 / 16",
    "3:4": "3 / 4",
    "4:3": "4 / 3",
    "2:3": "2 / 3",
    "5:4": "5 / 4",
  };

  return ratioMap[cropRatio] ?? "4 / 3";
}

function getTextPositionClass(position: string): string {
  return `text-overlay-${position.toLowerCase().replace(/\s+/g, "-")}`;
}

function getFontWeight(fontWeight: string): number {
  return {
    Regular: 400,
    Medium: 600,
    Bold: 800,
    Black: 900,
  }[fontWeight] ?? 800;
}

function getBackgroundStyle(imageState: ImageState): string {
  if (imageState.backgroundPreset === "Pure White") return "#ffffff";
  if (imageState.backgroundPreset === "Studio Gray") return "#e7ebf0";
  if (imageState.backgroundPreset === "Dark Studio") return "#111827";
  if (imageState.backgroundPreset === "Gradient Light") {
    return "linear-gradient(135deg, #ffffff, #dfe7f3)";
  }
  if (imageState.backgroundPreset === "Outdoor Bokeh") {
    return "radial-gradient(circle at 30% 25%, #d9f99d, transparent 24%), radial-gradient(circle at 70% 30%, #bae6fd, transparent 22%), #f8fafc";
  }
  if (imageState.backgroundPreset === "Soft Blur" || imageState.backgroundPreset === "Blurred Original") {
    return imageState.backgroundColor;
  }

  return imageState.backgroundColor;
}

function getImageTransform(imageState: ImageState): string {
  const flip = imageState.flipped ? -1 : 1;
  const perspectiveX = imageState.perspectiveH * 0.05;
  const perspectiveY = imageState.perspectiveV * 0.05;

  return [
    `scale(${(imageState.zoom / 100) * flip}, ${imageState.zoom / 100})`,
    `rotate(${imageState.rotation}deg)`,
    `skew(${perspectiveX}deg, ${perspectiveY}deg)`,
  ].join(" ");
}

function getShadowCss(imageState: ImageState): string {
  const directionMap: Record<string, { x: number; y: number }> = {
    Bottom: { x: 0, y: 0.28 },
    "Bottom Left": { x: -0.22, y: 0.28 },
    "Bottom Right": { x: 0.22, y: 0.28 },
    Right: { x: 0.32, y: 0.08 },
    Left: { x: -0.32, y: 0.08 },
  };
  const direction = directionMap[imageState.shadowDirection] ?? directionMap.Bottom;

  return `${Math.round(imageState.shadow * direction.x)}px ${Math.round(
    imageState.shadow * direction.y
  )}px ${Math.round(imageState.shadow * 0.8)}px rgba(0, 0, 0, ${Math.min(
    0.45,
    imageState.shadow / 180
  )})`;
}

function applyPresetToState(current: ImageState, preset: string): ImageState {
  if (preset === "None") {
    return {
      ...current,
      stylePreset: "None",
      lutStrength: 0,
      glow: 0,
      filmGrain: 0,
      chromaticAberration: 0,
    };
  }

  if (preset === "Amazon" || preset === "Premium" || preset === "Ecommerce Clean") {
    return {
      ...current,
      brightness: 112,
      contrast: 116,
      saturation: 96,
      warmth: 0,
      clarity: 20,
      sharpness: 30,
      noiseReduction: 18,
      removeBackground: true,
      backgroundColor: "#ffffff",
      shadow: 28,
      padding: 42,
      zoom: 104,
      cropRatio: "1:1",
      vignette: 0,
      stylePreset: "None",
      outputFormat: "PNG",
      exportSize: "1500px",
    };
  }

  if (preset === "Instagram" || preset === "Instagram Cozy" || preset === "Golden Hour") {
    return {
      ...current,
      brightness: 106,
      contrast: 112,
      saturation: 118,
      warmth: 34,
      clarity: 12,
      shadow: 18,
      cropRatio: "4:5",
      vignette: 12,
      glow: 10,
      stylePreset: "Warm Glow",
      textPosition: "Bottom",
      outputFormat: "JPEG",
      exportSize: "1080px",
    };
  }

  if (preset === "Cinematic" || preset === "Cinematic Poster") {
    return {
      ...current,
      brightness: 94,
      contrast: 132,
      saturation: 86,
      warmth: 24,
      clarity: 26,
      shadow: 42,
      cropRatio: "16:9",
      vignette: 36,
      glow: 8,
      stylePreset: "Cinematic",
      fontSize: 42,
      fontWeight: "Black",
      textPosition: "Bottom",
      outputFormat: "JPEG",
      exportSize: "2048px",
    };
  }

  if (preset === "Vivid" || preset === "HDR Pop") {
    return {
      ...current,
      brightness: 106,
      contrast: preset === "HDR Pop" ? 136 : 122,
      saturation: 126,
      vibrance: 34,
      clarity: 28,
      texture: 18,
      dehaze: 18,
      stylePreset: preset,
    };
  }

  if (preset === "Matte Film" || preset === "Faded Analog") {
    return {
      ...current,
      brightness: 102,
      contrast: 88,
      saturation: 88,
      warmth: preset === "Faded Analog" ? 28 : 12,
      shadows: 24,
      blacks: 26,
      filmGrain: preset === "Faded Analog" ? 34 : 18,
      vignette: 16,
      stylePreset: preset,
    };
  }

  if (preset === "Warm Glow") {
    return {
      ...current,
      brightness: 108,
      contrast: 106,
      saturation: 112,
      warmth: 38,
      glow: 24,
      vignette: 10,
      stylePreset: preset,
    };
  }

  if (preset === "Cool Tone") {
    return {
      ...current,
      brightness: 100,
      contrast: 118,
      saturation: 92,
      warmth: -34,
      tint: -10,
      colorGradeShadows: "#14213d",
      overlayColor: "#14213d",
      overlayOpacity: 8,
      stylePreset: preset,
    };
  }

  if (preset === "Black & White") {
    return {
      ...current,
      contrast: 128,
      saturation: 0,
      warmth: 0,
      clarity: 22,
      vignette: 18,
      stylePreset: preset,
    };
  }

  if (preset === "Vintage") {
    return {
      ...current,
      brightness: 104,
      contrast: 96,
      saturation: 82,
      warmth: 44,
      tint: 8,
      filmGrain: 28,
      vignette: 24,
      stylePreset: preset,
    };
  }

  if (preset === "Soft Pastel") {
    return {
      ...current,
      brightness: 112,
      contrast: 88,
      saturation: 108,
      warmth: 12,
      glow: 18,
      clarity: -18,
      stylePreset: preset,
    };
  }

  if (preset === "LinkedIn") {
    return {
      ...current,
      cropRatio: "1:1",
      brightness: 108,
      contrast: 112,
      saturation: 100,
      clarity: 16,
      backgroundPreset: "Studio Gray",
      outputFormat: "JPEG",
      exportSize: "1080px",
    };
  }

  if (preset === "YouTube") {
    return {
      ...current,
      cropRatio: "16:9",
      contrast: 126,
      saturation: 118,
      sharpness: 26,
      fontSize: 46,
      fontWeight: "Black",
      textPosition: "Center",
      outputFormat: "JPEG",
      exportSize: "2048px",
    };
  }

  return current;
}

function parsePixelSize(value: string): number | null {
  const match = value.match(/^(\d+)px$/i);
  return match ? Number(match[1]) : null;
}

function getExportMimeType(format: "png" | "jpeg" | "webp" | "tiff") {
  if (format === "jpeg") return "image/jpeg";
  if (format === "webp") return "image/webp";
  return "image/png";
}

function getExportExtension(format: "png" | "jpeg" | "webp" | "tiff") {
  if (format === "jpeg") return "jpg";
  if (format === "webp") return "webp";
  if (format === "tiff") return "png";
  return "png";
}

function getCanvasCropRatio(cropRatio: string, fallbackWidth: number, fallbackHeight: number) {
  const ratioMap: Record<string, number> = {
    "1:1": 1,
    "4:5": 4 / 5,
    "16:9": 16 / 9,
    "9:16": 9 / 16,
    "3:4": 3 / 4,
    "4:3": 4 / 3,
    "2:3": 2 / 3,
    "5:4": 5 / 4,
  };

  return ratioMap[cropRatio] ?? fallbackWidth / fallbackHeight;
}

function getHexAsRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((character) => character + character).join("")
    : normalized;
  const red = parseInt(value.slice(0, 2), 16) || 0;
  const green = parseInt(value.slice(2, 4), 16) || 0;
  const blue = parseInt(value.slice(4, 6), 16) || 0;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function App() {
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const previewCardRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState<Page>("landing");
  const [software, setSoftware] = useState<SoftwareSummary[]>([]);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState("");
  const [selectedSoftware, setSelectedSoftware] =
    useState<SoftwareProfile | null>(null);
  const [userVision, setUserVision] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAiEditingEnabled, setIsAiEditingEnabled] = useState(false);
  const [isWorkspaceBuildingEnabled, setIsWorkspaceBuildingEnabled] = useState(true);
  const [imageFileName, setImageFileName] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageState, setImageState] = useState<ImageState>(defaultImageState);
  const [showBefore, setShowBefore] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showUploadPrompt, setShowUploadPrompt] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [autoAppliedControlIds, setAutoAppliedControlIds] = useState<string[]>([]);
  const [generatedInterface, setGeneratedInterface] =
    useState<GeneratedInterface | null>(null);
  const [lastGenerationIntent, setLastGenerationIntent] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [isGeneratingInterface, setIsGeneratingInterface] = useState(false);
  const [isLoadingSoftware, setIsLoadingSoftware] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [softwareError, setSoftwareError] = useState("");
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);

  const imageFilter = useMemo(() => getCssFilter(imageState), [imageState]);
  const cropAspectRatio = useMemo(
    () => getCropAspectRatio(imageState.cropRatio),
    [imageState.cropRatio]
  );

  const dynamicPrompts = useMemo(
    () => (imageFileName ? getIntentsForFilename(imageFileName) : defaultQuickPrompts),
    [imageFileName]
  );

  useEffect(() => {
    if (!showCapabilities) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCapabilities(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showCapabilities]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void previewCardRef.current?.requestFullscreen();
    }
  };

  useEffect(() => {
    const loadSoftware = async () => {
      try {
        const healthResponse = await fetch(`${API_BASE_URL}/api/health`);
        if (healthResponse.ok) {
          const health = (await healthResponse.json()) as HealthResponse;
          setIsFallbackMode(health.openaiConfigured === false);
        }
        const response = await fetch(`${API_BASE_URL}/api/software`);
        if (!response.ok) throw new Error("Could not load software profiles.");
        const profiles = (await response.json()) as SoftwareSummary[];
        setSoftware(profiles);
        setSoftwareError("");
      } catch {
        setSoftwareError("Start the backend server to load software profiles.");
      } finally {
        setIsLoadingSoftware(false);
      }
    };
    void loadSoftware();
  }, []);

  useEffect(() => {
    if (!selectedSoftwareId) {
      setSelectedSoftware(null);
      return;
    }
    const loadSoftwareDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/software/${selectedSoftwareId}`
        );
        if (!response.ok) throw new Error("Could not load selected software.");
        setSelectedSoftware((await response.json()) as SoftwareProfile);
      } catch {
        setSelectedSoftware(null);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    void loadSoftwareDetails();
  }, [selectedSoftwareId]);

  const selectedSummary = useMemo(
    () => software.find((profile) => profile.id === selectedSoftwareId),
    [selectedSoftwareId, software]
  );

  const selectedDomain = selectedSoftware?.domain ?? selectedSummary?.domain;
  const isImageEditing = selectedDomain === "image_editing";

  const handleSelectSoftware = (id: string) => {
    setSelectedSoftwareId(id);
    setGeneratedInterface(null);
    setAutoAppliedControlIds([]);
    setUserVision("");
    setImagePreviewUrl(null);
    setImageFile(null);
    setImageFileName("");
    setImageError("");
    setImageState(defaultImageState);
    setShowBefore(false);
    setGenerationError("");
    setPage("workspace");
  };

  const handleBack = () => {
    setPage("landing");
  };

  useEffect(() => {
    if (!isImageEditing) {
      setImagePreviewUrl(null);
      setImageFile(null);
      setImageFileName("");
      setImageError("");
    }
  }, [isImageEditing]);

  const loadImageFile = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setImagePreviewUrl(null);
      setImageFile(null);
      setImageFileName("");
      setImageError("Upload a PNG, JPG, JPEG, or WebP image for the demo preview.");
      return;
    }
    setImageError("");
    setImageFileName(file.name);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageState(defaultImageState);
    setGeneratedInterface(null);
    setAutoAppliedControlIds([]);
    setUserVision("");
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreviewUrl(null);
      setImageFile(null);
      setImageFileName("");
      setImageError("");
      return;
    }
    loadImageFile(file);
  };

  const updateImageCapability = (capabilityId: string, value: ControlValue) => {
    setImageState((current) => {
      const numericValue = typeof value === "number" ? value : Number(value);
      const stringValue = String(value);
      const booleanValue = Boolean(value);

      switch (capabilityId) {
        case "brightness":
          return { ...current, brightness: 100 + numericValue };
        case "contrast":
          return { ...current, contrast: 100 + numericValue };
        case "highlights":
          return { ...current, highlights: numericValue };
        case "shadows":
          return { ...current, shadows: numericValue, brightness: current.brightness + numericValue * 0.04 };
        case "whites":
          return { ...current, whites: numericValue };
        case "blacks":
          return { ...current, blacks: numericValue, contrast: 100 + numericValue * -0.12 };
        case "saturation":
          return { ...current, saturation: 100 + numericValue };
        case "vibrance":
          return { ...current, vibrance: numericValue };
        case "warmth":
          return { ...current, warmth: numericValue };
        case "tint":
          return { ...current, tint: numericValue };
        case "hue_shift":
          return { ...current, hueShift: numericValue };
        case "color_grade_shadows":
          return { ...current, colorGradeShadows: stringValue, overlayColor: stringValue, overlayOpacity: Math.max(current.overlayOpacity, 10) };
        case "color_grade_midtones":
          return { ...current, colorGradeMidtones: stringValue, overlayColor: stringValue, overlayOpacity: Math.max(current.overlayOpacity, 8) };
        case "color_grade_highlights":
          return { ...current, colorGradeHighlights: stringValue, overlayColor: stringValue, overlayOpacity: Math.max(current.overlayOpacity, 6) };
        case "exposure":
          return { ...current, exposure: numericValue };
        case "blur":
        case "lens_blur":
          return { ...current, blur: numericValue * 0.12 };
        case "sharpness":
          return { ...current, sharpness: numericValue };
        case "clarity":
          return { ...current, clarity: numericValue };
        case "texture":
          return { ...current, texture: numericValue };
        case "noise_reduction":
          return { ...current, noiseReduction: numericValue };
        case "dehaze":
          return { ...current, dehaze: numericValue };
        case "film_grain":
          return { ...current, filmGrain: numericValue };
        case "glow":
          return { ...current, glow: numericValue };
        case "chromatic_aberration":
          return { ...current, chromaticAberration: numericValue };
        case "style_preset":
          return applyPresetToState({ ...current, stylePreset: stringValue }, stringValue);
        case "lut_strength":
          return { ...current, lutStrength: numericValue, contrast: 100 + numericValue * 0.2, saturation: 100 + numericValue * 0.15 };
        case "remove_background":
          return { ...current, removeBackground: booleanValue };
        case "background_color":
          return { ...current, backgroundColor: stringValue };
        case "background_preset":
          return { ...applyPresetToState(current, stringValue), backgroundPreset: stringValue };
        case "background_blur":
          return { ...current, backgroundBlur: numericValue };
        case "product_shadow":
          return { ...current, shadow: numericValue };
        case "shadow_direction":
          return { ...current, shadowDirection: stringValue };
        case "crop_ratio":
          return { ...current, cropRatio: stringValue };
        case "rotation":
          return { ...current, rotation: numericValue };
        case "perspective_h":
          return { ...current, perspectiveH: numericValue };
        case "perspective_v":
          return { ...current, perspectiveV: numericValue };
        case "flip_horizontal":
          return { ...current, flipped: booleanValue };
        case "padding":
          return { ...current, padding: numericValue };
        case "alignment":
          return { ...current, alignment: stringValue };
        case "zoom":
          return { ...current, zoom: numericValue };
        case "headline_text":
          return { ...current, headlineText: stringValue };
        case "subtext":
        case "subheadline_text":
          return { ...current, subtext: stringValue };
        case "watermark_text":
          return { ...current, watermarkText: stringValue };
        case "text_position":
          return { ...current, textPosition: stringValue };
        case "font_size":
          return { ...current, fontSize: numericValue };
        case "font_weight":
          return { ...current, fontWeight: stringValue };
        case "text_color":
          return { ...current, textColor: stringValue };
        case "vignette":
          return { ...current, vignette: Math.abs(numericValue) };
        case "overlay_color":
          return { ...current, overlayColor: stringValue };
        case "overlay_opacity":
          return { ...current, overlayOpacity: numericValue };
        case "skin_smoothing":
          return { ...current, skinSmoothing: numericValue, blur: Math.max(current.blur, numericValue * 0.02) };
        case "skin_tone":
          return { ...current, skinTone: numericValue, warmth: current.warmth + numericValue * 0.12 };
        case "face_brightness":
          return { ...current, faceBrightness: numericValue };
        case "eye_enhancement":
          return { ...current, eyeEnhancement: numericValue, clarity: Math.max(current.clarity, numericValue * 0.35) };
        case "teeth_whitening":
          return { ...current, teethWhitening: numericValue, saturation: Math.max(0, current.saturation - numericValue * 0.05) };
        case "output_format":
          return { ...current, outputFormat: stringValue };
        case "export_size":
          return { ...current, exportSize: stringValue };
        case "resize":
          return { ...current, resize: stringValue };
        case "compression":
          return { ...current, compression: numericValue };
        case "platform_preset":
          return applyPresetToState(current, stringValue);
        default:
          return current;
      }
    });
  };

  const applyControlAction = (capabilityId: string) => {
    if (capabilityId === "remove_background") {
      setImageState((current) => ({
        ...current,
        removeBackground: true,
        backgroundColor: "#ffffff",
      }));
      return;
    }

    if (capabilityId === "flip_horizontal") {
      setImageState((current) => ({ ...current, flipped: !current.flipped }));
      return;
    }

    if (
      ["export_ecommerce", "export_png", "export_jpg", "export_print"].includes(
        capabilityId
      )
    ) {
      void exportEditedImage(
        capabilityId === "export_print"
          ? "tiff"
          : capabilityId === "export_jpg" || imageState.outputFormat === "JPEG"
          ? "jpeg"
          : capabilityId === "export_png"
            ? "png"
            : imageState.outputFormat === "WebP"
              ? "webp"
              : "png"
      );
      return;
    }

    if (capabilityId === "cinematic_tone") {
      setImageState((current) => applyPresetToState(current, "Cinematic"));
      return;
    }

    if (capabilityId === "instagram_vibe") {
      setImageState((current) => applyPresetToState(current, "Instagram"));
      return;
    }

    if (capabilityId === "premium_look") {
      setImageState((current) => applyPresetToState(current, "Premium"));
    }
  };

  const applyGeneratedControlsToImage = (generated: GeneratedInterface) => {
    const appliedControlIds: string[] = [];

    setImageState(defaultImageState);

    for (const control of generated.controls ?? []) {
      const capabilityId = control.capabilityId;

      if (!capabilityId || control.suggestedDefault === undefined) {
        continue;
      }

      if (control.componentType === "button") {
        const shouldApplyVisualAction =
          control.suggestedDefault === true &&
          !capabilityId.startsWith("export");

        if (shouldApplyVisualAction) {
          applyControlAction(capabilityId);
          appliedControlIds.push(capabilityId);
        }

        continue;
      }

      updateImageCapability(capabilityId, control.suggestedDefault);
      appliedControlIds.push(capabilityId);
    }

    setAutoAppliedControlIds(appliedControlIds);
    setShowBefore(false);
  };

  const resetImageState = () => {
    setImageState(defaultImageState);
    setAutoAppliedControlIds([]);
    setShowBefore(false);
  };

  const resizeImageToBase64 = (file: File, maxPx = 1024): Promise<{ data: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas")); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve({ data: dataUrl.split(",")[1], mimeType: "image/jpeg" });
      };
      img.onerror = reject;
      img.src = url;
    });

  const loadCorsImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  const exportEditedImage = async (formatOverride?: "png" | "jpeg" | "webp" | "tiff") => {
    if (!imagePreviewUrl) return;
    const image = await loadCorsImage(imagePreviewUrl).catch(() => imageElementRef.current);
    if (!image) return;

    const selectedFormat = formatOverride ?? imageState.outputFormat.toLowerCase();
    const format =
      selectedFormat === "jpg"
        ? "jpeg"
        : selectedFormat === "webp" || selectedFormat === "tiff" || selectedFormat === "jpeg"
          ? selectedFormat
          : "png";
    const canvas = document.createElement("canvas");
    const sourceWidth = image.naturalWidth || 1200;
    const sourceHeight = image.naturalHeight || 900;
    const exportSize =
      parsePixelSize(imageState.exportSize) ??
      parsePixelSize(imageState.resize) ??
      (format === "tiff" ? 4096 : null);
    const cropRatio = getCanvasCropRatio(imageState.cropRatio, sourceWidth, sourceHeight);
    const width = exportSize ?? sourceWidth;
    const height = Math.round(width / cropRatio);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle =
      imageState.backgroundPreset === "Dark Studio"
        ? "#111827"
        : imageState.backgroundPreset === "Studio Gray"
          ? "#e7ebf0"
          : imageState.backgroundColor;
    context.fillRect(0, 0, width, height);

    if (imageState.backgroundPreset === "Gradient Light") {
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#ffffff");
      gradient.addColorStop(1, "#dfe7f3");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    const padding = Math.min(width, height) * (imageState.padding / 800);
    const availableWidth = Math.max(1, width - padding * 2);
    const availableHeight = Math.max(1, height - padding * 2);
    const scale = Math.min(availableWidth / sourceWidth, availableHeight / sourceHeight) * (imageState.zoom / 100);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const alignmentX =
      imageState.alignment === "Left"
        ? padding
        : imageState.alignment === "Right"
          ? width - padding - drawWidth
          : (width - drawWidth) / 2;
    const alignmentY =
      imageState.alignment === "Top"
        ? padding
        : imageState.alignment === "Bottom"
          ? height - padding - drawHeight
          : (height - drawHeight) / 2;

    context.save();
    context.translate(alignmentX + drawWidth / 2, alignmentY + drawHeight / 2);
    context.rotate((imageState.rotation * Math.PI) / 180);
    context.scale(imageState.flipped ? -1 : 1, 1);
    if (imageState.shadow > 0) {
      const shadowOffset = imageState.shadow / 2;
      context.shadowColor = getHexAsRgba("#000000", Math.min(0.45, imageState.shadow / 180));
      context.shadowBlur = imageState.shadow * 0.8;
      context.shadowOffsetX =
        imageState.shadowDirection === "Left"
          ? -shadowOffset
          : imageState.shadowDirection === "Right"
            ? shadowOffset
            : 0;
      context.shadowOffsetY = shadowOffset;
    }
    context.filter = imageFilter;
    context.drawImage(image, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    context.restore();

    if (imageState.overlayOpacity > 0) {
      context.fillStyle = getHexAsRgba(imageState.overlayColor, imageState.overlayOpacity / 100);
      context.fillRect(0, 0, width, height);
    }

    if (imageState.vignette > 0) {
      const gradient = context.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.2,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.65
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, getHexAsRgba("#000000", Math.min(0.7, imageState.vignette / 120)));
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);
    }

    if (imageState.headlineText || imageState.subtext) {
      context.shadowColor = "rgba(0, 0, 0, 0.55)";
      context.shadowBlur = 18;
      context.fillStyle = imageState.textColor;
      context.textAlign = imageState.textPosition.includes("Left")
        ? "left"
        : imageState.textPosition.includes("Right")
          ? "right"
          : "center";
      context.textBaseline = "middle";
      context.font = `${getFontWeight(imageState.fontWeight)} ${Math.round(
        imageState.fontSize * (width / 1000)
      )}px Inter, Arial, sans-serif`;
      const textX = imageState.textPosition.includes("Left")
        ? width * 0.08
        : imageState.textPosition.includes("Right")
          ? width * 0.92
          : width / 2;
      const textY = imageState.textPosition === "Top"
        ? height * 0.14
        : imageState.textPosition === "Center"
          ? height / 2
          : height * 0.84;
      if (imageState.headlineText) context.fillText(imageState.headlineText, textX, textY);
      if (imageState.subtext) {
        context.font = `500 ${Math.round(imageState.fontSize * 0.5 * (width / 1000))}px Inter, Arial, sans-serif`;
        context.fillText(imageState.subtext, textX, textY + imageState.fontSize * 0.8);
      }
      context.shadowBlur = 0;
    }

    if (imageState.watermarkText) {
      context.fillStyle = "rgba(255, 255, 255, 0.55)";
      context.font = `700 ${Math.max(14, Math.round(width * 0.018))}px Inter, Arial, sans-serif`;
      context.textAlign = "right";
      context.fillText(imageState.watermarkText, width - 24, height - 24);
    }

    try {
      const dataUrl = canvas.toDataURL(
        getExportMimeType(format),
        Math.max(0.08, 1 - imageState.compression / 120)
      );
      const link = document.createElement("a");
      const extension = getExportExtension(format);
      link.download = `miniphotopro-export.${extension}`;
      link.href = dataUrl;
      link.click();
    } catch {
      setImageError("Export failed — the image could not be read due to cross-origin restrictions.");
    }
  };

  const generateInterface = async (intentOverride?: string) => {
    const intent = (intentOverride ?? userVision).trim();
    if (!selectedSoftwareId) {
      setGenerationError("Choose a software profile before generating.");
      return;
    }
    if (!intent) {
      setGenerationError("Describe your goal before generating.");
      return;
    }
    if (isImageEditing && !imagePreviewUrl) {
      setShowUploadPrompt(true);
      return;
    }
    setIsGeneratingInterface(true);
    setGenerationError("");
    setLastGenerationIntent(intent);

    const hasImage = isImageEditing && !!imageFile;
    const steps = hasImage
      ? ["Uploading image to AI…", "Analysing your photo…", "Planning controls…", "Building workspace…", "Applying presets…"]
      : ["Planning controls…", "Building workspace…", "Applying presets…"];
    let stepIdx = 0;
    setLoadingMessage(steps[0]);
    const stepTimer = setInterval(() => {
      stepIdx = Math.min(stepIdx + 1, steps.length - 1);
      setLoadingMessage(steps[stepIdx]);
    }, 2200);

    try {
      let imagePayload: { imageData?: string; imageMimeType?: string } = {};
      if (hasImage && imageFile) {
        try {
          const encoded = await resizeImageToBase64(imageFile);
          imagePayload = { imageData: encoded.data, imageMimeType: encoded.mimeType };
        } catch {
          // best-effort; proceed without image data
        }
      }

      let interfacePromise = null;
      if (isWorkspaceBuildingEnabled) {
        interfacePromise = fetch(`${API_BASE_URL}/api/generate-interface`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            softwareId: selectedSoftwareId,
            userIntent: intent,
            ...imagePayload,
          }),
        });
      }

      let editImagePromise = null;
      if (imageFile && isAiEditingEnabled) {
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("userIntent", intent);
        editImagePromise = fetch(`${API_BASE_URL}/api/edit-image`, {
          method: "POST",
          body: formData,
        });
      }

      const [response, editResponse] = await Promise.all([
        interfacePromise,
        editImagePromise,
      ]);

      if (editResponse && editResponse.ok) {
        try {
          const editPayload = await editResponse.json() as { imageUrl?: string };
          if (editPayload.imageUrl) {
            setImagePreviewUrl(editPayload.imageUrl);
          }
        } catch (e) {
          console.error("Failed to parse edit response", e);
        }
      }

      if (response && response.ok) {
        const payload = (await response.json()) as
          | GeneratedInterface
          | { error?: string };
        if (!response.ok) {
          throw new Error(
            "error" in payload && payload.error
              ? payload.error
              : "Could not build workspace."
          );
        }
        const nextGeneratedInterface = payload as GeneratedInterface;
        setLoadingMessage("Applying presets…");
        setGeneratedInterface(nextGeneratedInterface);
        applyGeneratedControlsToImage(nextGeneratedInterface);
      } else if (!isWorkspaceBuildingEnabled) {
        setGeneratedInterface(null);
        setAutoAppliedControlIds([]);
      } else {
        throw new Error("Could not build workspace.");
      }
      setShowBefore(false);
    } catch (error) {
      setGeneratedInterface(null);
      setAutoAppliedControlIds([]);
        setGenerationError(
        error instanceof Error
          ? error.message
          : "Could not build workspace. Try again."
      );
    } finally {
      clearInterval(stepTimer);
      setLoadingMessage("");
      setIsGeneratingInterface(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setUserVision(prompt);
  };

  // ── Landing page ──────────────────────────────────────────────────────────

  if (page === "landing") {
    return (
      <div className="landing-shell">
        {isFallbackMode ? (
          <div className="fallback-banner">
            Running in fallback mode — OpenAI key not configured. Workspaces
            will use the local fallback generator.
          </div>
        ) : null}

        <header className="landing-header">
          <div className="landing-brand">
            <p className="eyebrow">IntentUI</p>
            <h1>Adaptive workspaces for complex software</h1>
            <p className="landing-subtitle">
              Choose a software to build a workspace tailored
              to your goal.
            </p>
          </div>

        </header>

        {softwareError ? (
          <p className="error-message landing-error">{softwareError}</p>
        ) : null}

        {isLoadingSoftware ? (
          <div className="software-grid">
            {[1, 2, 3].map((n) => (
              <div className="software-card software-card-skeleton" key={n} />
            ))}
          </div>
        ) : (
          <div className="software-grid">
            {software.map((profile) => (
              <button
                className="software-card"
                key={profile.id}
                type="button"
                onClick={() => handleSelectSoftware(profile.id)}
              >
                <div className="software-card-top">
                  <div className="software-card-avatar">
                    {getAvatarLetters(profile.name)}
                  </div>
                  <span className="domain-badge">
                    {getDomainLabel(profile.domain)}
                  </span>
                </div>
                <div className="software-card-body">
                  <h2>{profile.name}</h2>
                  <p>{profile.description}</p>
                </div>
                <div className="software-card-footer">
                  <span>{profile.capabilityCount} capabilities</span>
                  <span className="card-arrow">&#8594;</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Workspace page ────────────────────────────────────────────────────────

  const softwareName =
    selectedSoftware?.name ?? selectedSummary?.name ?? "Software";

  return (
    <div className="workspace-shell">
      <header className="workspace-topbar">
        <button className="back-button" type="button" onClick={handleBack}>
          &#8592; Back
        </button>
        <div className="workspace-topbar-center">
          <h1 className="workspace-topbar-title">{softwareName}</h1>
          {selectedDomain ? (
            <span className="domain-badge">
              {getDomainLabel(selectedDomain)}
            </span>
          ) : null}
        </div>
        <button
          className="capabilities-button"
          type="button"
          onClick={() => setShowCapabilities(true)}
        >
          {selectedSoftware
            ? `${selectedSoftware.capabilities.length} capabilities`
            : "Capabilities"}
        </button>

      </header>

      {isFallbackMode ? (
        <div className="fallback-banner">
          Running in fallback mode — OpenAI key not configured.
        </div>
      ) : null}

      <div className="workspace-grid">
        {/* ── Chat panel ──────────────────────────────────────────── */}
        <section className="ws-panel chat-panel" aria-label="Chat">
          <div className="ws-panel-header">
            <p className="section-label">Your intent</p>
            <h2>Describe your goal</h2>
          </div>

          <div className="vision-block">
            <label htmlFor="user-vision">What do you want to achieve?</label>
            <textarea
              id="user-vision"
              placeholder="e.g. Make this product photo look professional for my ecommerce listing..."
              value={userVision}
              onChange={(e) => setUserVision(e.target.value)}
            />
            {imageFile ? (
              <label className="ai-edit-toggle">
                <div className="switch">
                  <input
                    type="checkbox"
                    checked={isAiEditingEnabled}
                    onChange={(e) => setIsAiEditingEnabled(e.target.checked)}
                  />
                  <span className="slider"></span>
                </div>
                <span>Active AI Image Editing</span>
              </label>
            ) : null}
            <label className="ai-edit-toggle" style={{ marginTop: imageFile ? "4px" : "12px" }}>
              <div className="switch">
                <input
                  type="checkbox"
                  checked={isWorkspaceBuildingEnabled}
                  onChange={(e) => setIsWorkspaceBuildingEnabled(e.target.checked)}
                />
                <span className="slider"></span>
              </div>
              <span>Build Workspace Controls</span>
            </label>
          </div>

          {isImageEditing && imagePreviewUrl ? (
            <div className="quick-prompts">
              {dynamicPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  disabled={isGeneratingInterface}
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <button
            className="generate-button"
            type="button"
            disabled={isGeneratingInterface || isLoadingDetails}
            onClick={() => void generateInterface()}
          >
            {isGeneratingInterface ? "Generating..." : "Generate"}
          </button>

          {generationError ? (
            <div className="error-card">
              <strong>Could not build workspace</strong>
              <p>{generationError}</p>
              <button
                type="button"
                onClick={() =>
                  void generateInterface(lastGenerationIntent || userVision)
                }
              >
                Try again
              </button>
            </div>
          ) : null}

        </section>

        {/* ── Image / Media panel ─────────────────────────────────── */}
        <section className="ws-panel media-panel" aria-label="Media">
          <div className="ws-panel-header">
            <p className="section-label">
              {isImageEditing ? "Image" : "Context"}
            </p>
            <h2>{isImageEditing ? "Upload your image" : "No upload needed"}</h2>
          </div>

          {isImageEditing ? (
            <div
              className={`upload-zone${isDragging ? " drag-over" : ""}`}
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) loadImageFile(file);
              }}
            >
              <div className="preview-card" ref={previewCardRef}>
                <button
                  className="fullscreen-button"
                  type="button"
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  onClick={toggleFullscreen}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    {isFullscreen ? (
                      <>
                        <path d="M5 1H1v4M9 1h4v4M5 13H1V9M9 13h4V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    ) : (
                      <>
                        <path d="M1 5V1h4M9 1h4v4M1 9v4h4M13 9v4H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </>
                    )}
                  </svg>
                </button>
                <div
                  className="preview-area"
                  style={imagePreviewUrl ? { background: getBackgroundStyle(imageState) } : undefined}
                >
                  {isGeneratingInterface && isAiEditingEnabled ? (
                    <div className="ai-generating-overlay">
                      <div className="loading-spinner" aria-hidden="true" />
                      <p>Generating AI edits...</p>
                    </div>
                  ) : null}
                  {imagePreviewUrl ? (
                    <div
                      className={`editor-stage editor-align-${imageState.alignment
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      style={{
                        aspectRatio: cropAspectRatio,
                        padding: `${imageState.padding}px`,
                      }}
                    >
                      <span className={`compare-badge${showBefore ? " is-before" : ""}`}>
                        {showBefore ? "Before" : "After"}
                      </span>
                      {imageState.removeBackground ||
                      imageState.backgroundBlur > 0 ||
                      ["Soft Blur", "Blurred Original"].includes(
                        imageState.backgroundPreset
                      ) ? (
                        <div
                          className="fake-background-blur"
                          style={{
                            backgroundImage: `url(${imagePreviewUrl})`,
                            filter: `blur(${Math.max(
                              4,
                              imageState.backgroundBlur * 0.16
                            )}px)`,
                          }}
                        />
                      ) : null}
                      <img
                        ref={imageElementRef}
                        className="editable-image"
                        src={imagePreviewUrl}
                        alt="Uploaded preview"
                        style={{
                          filter: showBefore ? "none" : imageFilter,
                          transform: showBefore
                            ? "scale(1)"
                            : getImageTransform(imageState),
                          boxShadow: showBefore
                            ? "none"
                            : getShadowCss(imageState),
                        }}
                      />
                      {!showBefore && imageState.chromaticAberration > 0 ? (
                        <>
                          <img
                            className="editable-image chromatic-layer chromatic-red"
                            src={imagePreviewUrl}
                            alt=""
                            aria-hidden="true"
                            style={{
                              filter: imageFilter,
                              transform: `${getImageTransform(imageState)} translateX(${
                                imageState.chromaticAberration * 0.04
                              }px)`,
                            }}
                          />
                          <img
                            className="editable-image chromatic-layer chromatic-blue"
                            src={imagePreviewUrl}
                            alt=""
                            aria-hidden="true"
                            style={{
                              filter: imageFilter,
                              transform: `${getImageTransform(imageState)} translateX(-${
                                imageState.chromaticAberration * 0.04
                              }px)`,
                            }}
                          />
                        </>
                      ) : null}
                      {!showBefore && imageState.glow > 0 ? (
                        <div
                          className="image-glow"
                          style={{ opacity: imageState.glow / 130 }}
                        />
                      ) : null}
                      {!showBefore && imageState.overlayOpacity > 0 ? (
                        <div
                          className="image-color-overlay"
                          style={{
                            backgroundColor: imageState.overlayColor,
                            opacity: imageState.overlayOpacity / 100,
                          }}
                        />
                      ) : null}
                      {!showBefore && imageState.vignette > 0 ? (
                        <div
                          className="image-vignette"
                          style={{ opacity: imageState.vignette / 100 }}
                        />
                      ) : null}
                      {!showBefore && imageState.filmGrain > 0 ? (
                        <div
                          className="film-grain-overlay"
                          style={{ opacity: imageState.filmGrain / 180 }}
                        />
                      ) : null}
                      {!showBefore &&
                      (imageState.headlineText || imageState.subtext) ? (
                        <div
                          className={`image-text-overlay ${getTextPositionClass(
                            imageState.textPosition
                          )}`}
                          style={{
                            color: imageState.textColor,
                            fontSize: `${imageState.fontSize}px`,
                            fontWeight: getFontWeight(imageState.fontWeight),
                          }}
                        >
                          {imageState.headlineText ? (
                            <strong>{imageState.headlineText}</strong>
                          ) : null}
                          {imageState.subtext ? <span>{imageState.subtext}</span> : null}
                        </div>
                      ) : null}
                      {!showBefore && imageState.watermarkText ? (
                        <div className="watermark-overlay">
                          {imageState.watermarkText}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <span aria-hidden="true">&#8679;</span>
                      <strong>Drop an image or click Upload</strong>
                      <small>PNG · JPG · WebP</small>
                    </div>
                  )}
                </div>
                <div className="preview-meta">

                  <strong>{imageFileName || "No image uploaded"}</strong>
                </div>
              </div>
              {imageError ? (
                <p className="error-message">{imageError}</p>
              ) : null}
              <div className="upload-actions">
                <label className="upload-button">
                  {imageFileName ? "Replace image" : "Upload image"}
                  <input
                    accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                    type="file"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
              <div className="image-tools">
                {imagePreviewUrl ? (
                  <>
                    <div className="before-after-toggle" role="group" aria-label="Compare">
                      <button
                        type="button"
                        className={showBefore ? "active" : ""}
                        onClick={() => setShowBefore(true)}
                      >
                        Before
                      </button>
                      <button
                        type="button"
                        className={!showBefore ? "active" : ""}
                        onClick={() => setShowBefore(false)}
                      >
                        After
                      </button>
                    </div>
                    <button className="reset-button" type="button" onClick={resetImageState}>
                      ↺ Reset
                    </button>
                  </>
                ) : null}
                <button
                  className="export-now-button"
                  type="button"
                  disabled={!imagePreviewUrl}
                  onClick={() =>
                    void exportEditedImage(
                      imageState.outputFormat === "JPEG"
                        ? "jpeg"
                        : imageState.outputFormat === "WebP"
                          ? "webp"
                          : imageState.outputFormat === "TIFF"
                            ? "tiff"
                            : "png"
                    )
                  }
                >
                  &#8595; Export image
                </button>
              </div>
            </div>
          ) : (
            <div className="no-media-placeholder">
              <div className="no-media-icon" aria-hidden="true">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    stroke="#bfe5d7"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                  />
                  <path
                    d="M13 20h14M20 13v14"
                    stroke="#0f6b57"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <strong>No file upload required</strong>
              <p>
                Describe your goal in the chat panel and build your workspace.
              </p>
            </div>
          )}
        </section>

        {/* ── Controls panel ──────────────────────────────────────── */}
        <section className="ws-panel controls-panel" aria-label="Generated controls">
          <div className="ws-panel-header">
            <p className="section-label">Controls</p>
            <h2>
              {generatedInterface
                ? (generatedInterface.interfaceTitle ?? "Generated workspace")
                : "Generated workspace"}
            </h2>
            {generatedInterface?.intentSummary ? (
              <p className="controls-intent-summary">
                {generatedInterface.intentSummary}
              </p>
            ) : null}
          </div>

          {isGeneratingInterface && isWorkspaceBuildingEnabled ? (
            <div className="interface-loading-card" role="status">
              <span className="spinner" aria-hidden="true" />
              <div className="loading-steps">
                <h2>{loadingMessage || "Building workspace…"}</h2>
              </div>
            </div>
          ) : !generatedInterface ? (
            <div className="interface-empty-state">
              <h2>
                Describe your goal and click Build Workspace to create your workspace.
              </h2>
            </div>
          ) : (
            <>
              <GeneratedInterfaceErrorBoundary>
                <GeneratedInterfacePanel
                  generatedInterface={generatedInterface}
                  showHeader={false}
                  autoAppliedControlIds={autoAppliedControlIds}
                  onControlChange={updateImageCapability}
                  onControlAction={applyControlAction}
                />
              </GeneratedInterfaceErrorBoundary>
              <GeneratedJsonViewer generatedInterface={generatedInterface} />
            </>
          )}
        </section>
      </div>

      {/* ── Capabilities modal ────────────────────────────────────── */}
      {showCapabilities && selectedSoftware ? (
        <div
          className="cap-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="All capabilities"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCapabilities(false);
          }}
        >
          <div className="cap-modal">
            <div className="cap-modal-header">
              <div>
                <p className="section-label">MiniPhoto Pro</p>
                <h2>All capabilities</h2>
                <p className="cap-modal-subtitle">
                  {selectedSoftware.capabilities.length} capabilities across{" "}
                  {
                    new Set(
                      selectedSoftware.capabilities.map(
                        (c) => c.category ?? "Other"
                      )
                    ).size
                  }{" "}
                  categories
                </p>
              </div>
              <button
                className="cap-close-button"
                type="button"
                aria-label="Close"
                onClick={() => setShowCapabilities(false)}
              >
                &#10005;
              </button>
            </div>

            <div className="cap-modal-body">
              {(() => {
                const grouped = new Map<string, Capability[]>();
                for (const cap of selectedSoftware.capabilities) {
                  const cat = cap.category ?? "Other";
                  if (!grouped.has(cat)) grouped.set(cat, []);
                  grouped.get(cat)!.push(cap);
                }
                return Array.from(grouped.entries()).map(([category, caps]) => (
                  <div className="cap-group" key={category}>
                    <div className="cap-group-heading">
                      <h3>{category}</h3>
                      <span className="cap-group-count">{caps.length}</span>
                    </div>
                    <div className="cap-rows">
                      {caps.map((cap) => (
                        <div className="cap-row" key={cap.id}>
                          <div className="cap-row-main">
                            <strong>{cap.label}</strong>
                            <span className="cap-row-id">{cap.id}</span>
                          </div>
                          <div className="cap-row-meta">
                            <span className="cap-type-badge">{cap.control}</span>
                            {cap.control === "slider" &&
                            cap.min !== undefined &&
                            cap.max !== undefined ? (
                              <span className="cap-range">
                                {cap.min} &ndash; {cap.max}
                              </span>
                            ) : null}
                            {cap.control === "select" && cap.options ? (
                              <span className="cap-options">
                                {cap.options.slice(0, 3).join(", ")}
                                {cap.options.length > 3
                                  ? ` +${cap.options.length - 3}`
                                  : ""}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      ) : null}

      {showUploadPrompt ? (
        <div
          className="upload-prompt-backdrop"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowUploadPrompt(false)}
        >
          <div className="upload-prompt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="upload-prompt-icon" aria-hidden="true">&#8679;</div>
            <h2>Upload an image first</h2>
            <p>Add an image to your workspace before building the interface. The AI uses it to tailor the controls to your photo.</p>
            <button
              className="upload-prompt-close"
              type="button"
              onClick={() => setShowUploadPrompt(false)}
            >
              Got it
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
