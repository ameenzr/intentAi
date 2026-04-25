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

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

type ControlValue = string | number | boolean;

type ImageState = {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  exposure: number;
  blur: number;
  sharpness: number;
  clarity: number;
  noiseReduction: number;
  backgroundColor: string;
  backgroundBlur: number;
  removeBackground: boolean;
  shadow: number;
  cropRatio: string;
  zoom: number;
  padding: number;
  alignment: string;
  headlineText: string;
  subtext: string;
  textPosition: string;
  fontSize: number;
  fontWeight: string;
  textColor: string;
  vignette: number;
  overlayColor: string;
  overlayOpacity: number;
  outputFormat: string;
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
  saturation: 100,
  warmth: 0,
  exposure: 0,
  blur: 0,
  sharpness: 0,
  clarity: 0,
  noiseReduction: 0,
  backgroundColor: "#ffffff",
  backgroundBlur: 0,
  removeBackground: false,
  shadow: 0,
  cropRatio: "Original",
  zoom: 100,
  padding: 16,
  alignment: "Center",
  headlineText: "",
  subtext: "",
  textPosition: "Bottom",
  fontSize: 28,
  fontWeight: "Bold",
  textColor: "#ffffff",
  vignette: 0,
  overlayColor: "#000000",
  overlayOpacity: 0,
  outputFormat: "PNG",
  compression: 10,
};

const quickPrompts = [
  "Make it look professional for an ecommerce listing.",
  "Give it a cinematic, film-like look.",
  "Make it warm and cozy for social media.",
];

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
    imageState.brightness + imageState.exposure * 12 - imageState.noiseReduction * 0.08;
  const contrast =
    imageState.contrast + imageState.clarity * 0.35 + imageState.sharpness * 0.18;
  const saturation = imageState.saturation;
  const sepia = Math.max(0, imageState.warmth) * 0.35;
  const hueRotate = imageState.warmth < 0 ? imageState.warmth * 0.3 : 0;
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

function applyPresetToState(current: ImageState, preset: string): ImageState {
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
    };
  }

  if (preset === "Instagram" || preset === "Instagram Cozy") {
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
      headlineText: current.headlineText || "Cozy moments",
      textPosition: "Bottom",
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
      headlineText: current.headlineText || "New Arrival",
      fontSize: 42,
      fontWeight: "Black",
      textPosition: "Bottom",
    };
  }

  return current;
}

function App() {
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const [page, setPage] = useState<Page>("landing");
  const [software, setSoftware] = useState<SoftwareSummary[]>([]);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState("");
  const [selectedSoftware, setSelectedSoftware] =
    useState<SoftwareProfile | null>(null);
  const [userVision, setUserVision] = useState("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageState, setImageState] = useState<ImageState>(defaultImageState);
  const [showBefore, setShowBefore] = useState(false);
  const [generatedInterface, setGeneratedInterface] =
    useState<GeneratedInterface | null>(null);
  const [generatedUserIntent, setGeneratedUserIntent] = useState("");
  const [lastGenerationIntent, setLastGenerationIntent] = useState("");
  const [generationError, setGenerationError] = useState("");
  const [isGeneratingInterface, setIsGeneratingInterface] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [followUpError, setFollowUpError] = useState("");
  const [isSendingFollowUp, setIsSendingFollowUp] = useState(false);
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

  useEffect(() => {
    if (!showCapabilities) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowCapabilities(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [showCapabilities]);

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
    setGeneratedUserIntent("");
    setChatMessages([]);
    setUserVision("");
    setImagePreviewUrl(null);
    setImageFileName("");
    setImageError("");
    setImageState(defaultImageState);
    setShowBefore(false);
    setGenerationError("");
    setFollowUpMessage("");
    setFollowUpError("");
    setPage("workspace");
  };

  const handleBack = () => {
    setPage("landing");
  };

  useEffect(() => {
    if (!isImageEditing) {
      setImagePreviewUrl(null);
      setImageFileName("");
      setImageError("");
    }
  }, [isImageEditing]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setImagePreviewUrl(null);
      setImageFileName("");
      setImageError("");
      return;
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      event.target.value = "";
      setImagePreviewUrl(null);
      setImageFileName("");
      setImageError(
        "Upload a PNG, JPG, JPEG, or WebP image for the demo preview."
      );
      return;
    }
    setImageError("");
    setImageFileName(file.name);
    setImagePreviewUrl(URL.createObjectURL(file));
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
        case "saturation":
          return { ...current, saturation: 100 + numericValue };
        case "warmth":
          return { ...current, warmth: numericValue };
        case "exposure":
          return { ...current, exposure: numericValue };
        case "blur":
        case "lens_blur":
          return { ...current, blur: numericValue * 0.12 };
        case "sharpness":
          return { ...current, sharpness: numericValue };
        case "clarity":
          return { ...current, clarity: numericValue };
        case "noise_reduction":
          return { ...current, noiseReduction: numericValue };
        case "remove_background":
          return { ...current, removeBackground: booleanValue };
        case "background_color":
          return { ...current, backgroundColor: stringValue };
        case "background_blur":
          return { ...current, backgroundBlur: numericValue };
        case "product_shadow":
          return { ...current, shadow: numericValue };
        case "crop_ratio":
          return { ...current, cropRatio: stringValue };
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
        case "output_format":
          return { ...current, outputFormat: stringValue };
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

    if (["export_ecommerce", "export_png", "export_jpg"].includes(capabilityId)) {
      void exportEditedImage(capabilityId === "export_jpg" ? "jpeg" : "png");
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

  const applyDefaultsFromGeneratedInterface = (generated: GeneratedInterface) => {
    for (const control of generated.controls ?? []) {
      if (control.componentType === "button") {
        if (
          control.suggestedDefault === true &&
          !control.capabilityId.startsWith("export")
        ) {
          applyControlAction(control.capabilityId);
        }
        continue;
      }

      updateImageCapability(control.capabilityId, control.suggestedDefault);
    }
  };

  const resetImageState = () => {
    setImageState(defaultImageState);
    setShowBefore(false);
  };

  const exportEditedImage = async (format: "png" | "jpeg" = "png") => {
    const image = imageElementRef.current;
    if (!image) return;

    const canvas = document.createElement("canvas");
    const width = image.naturalWidth || 1200;
    const height = image.naturalHeight || 900;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.fillStyle = imageState.backgroundColor;
    context.fillRect(0, 0, width, height);
    context.filter = imageFilter;
    context.drawImage(image, 0, 0, width, height);

    const link = document.createElement("a");
    const extension = format === "jpeg" ? "jpg" : "png";
    link.download = `miniphotopro-export.${extension}`;
    link.href = canvas.toDataURL(`image/${format}`, 1 - imageState.compression / 120);
    link.click();
  };

  const applyQuickPreset = (preset: string) => {
    setImageState((current) => applyPresetToState(current, preset));
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
    setIsGeneratingInterface(true);
    setGenerationError("");
    setLastGenerationIntent(intent);
    try {
      const response = await fetch(`${API_BASE_URL}/api/generate-interface`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          softwareId: selectedSoftwareId,
          userIntent: intent,
        }),
      });
      const payload = (await response.json()) as
        | GeneratedInterface
        | { error?: string };
      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Could not generate an interface."
        );
      }
      const nextGeneratedInterface = payload as GeneratedInterface;
      setGeneratedInterface(nextGeneratedInterface);
      setGeneratedUserIntent(intent);
      setChatMessages([]);
      setFollowUpMessage("");
      setFollowUpError("");
      applyDefaultsFromGeneratedInterface(nextGeneratedInterface);
      setShowBefore(false);
    } catch (error) {
      setGeneratedInterface(null);
      setGeneratedUserIntent("");
      setChatMessages([]);
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Could not generate an interface. Try again."
      );
    } finally {
      setIsGeneratingInterface(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setUserVision(prompt);
    void generateInterface(prompt);
  };

  const sendFollowUp = async () => {
    const message = followUpMessage.trim();
    if (!generatedInterface || !generatedUserIntent) {
      setFollowUpError("Generate an interface before asking a follow-up.");
      return;
    }
    if (!message) {
      setFollowUpError("Ask how you want to refine the generated interface.");
      return;
    }
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: message,
    };
    setChatMessages((msgs) => [...msgs, userMessage]);
    setFollowUpMessage("");
    setFollowUpError("");
    setIsSendingFollowUp(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/follow-up`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          softwareId: selectedSoftwareId,
          userIntent: generatedUserIntent,
          generatedInterface,
          message,
        }),
      });
      const payload = (await response.json()) as {
        reply?: string;
        error?: string;
      };
      if (!response.ok || !payload.reply) {
        throw new Error(payload.error ?? "Could not send follow-up.");
      }
      setChatMessages((msgs) => [
        ...msgs,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: payload.reply!,
        },
      ]);
    } catch (error) {
      const msg =
        error instanceof Error
          ? error.message
          : "Could not send follow-up. Try again.";
      setFollowUpError(msg);
      setChatMessages((msgs) => [
        ...msgs,
        { id: `${Date.now()}-system`, role: "system", content: msg },
      ]);
    } finally {
      setIsSendingFollowUp(false);
    }
  };

  // ── Landing page ──────────────────────────────────────────────────────────

  if (page === "landing") {
    return (
      <div className="landing-shell">
        {isFallbackMode ? (
          <div className="fallback-banner">
            Running in fallback mode — OpenAI key not configured. Generated
            interfaces will use the local fallback generator.
          </div>
        ) : null}

        <header className="landing-header">
          <div className="landing-brand">
            <p className="eyebrow">IntentUI</p>
            <h1>Adaptive interfaces for complex software</h1>
            <p className="landing-subtitle">
              Choose a software to generate a purpose-built interface tailored
              to your goal.
            </p>
          </div>
          <span className="model-badge">Mock capability model</span>
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
        <span className="model-badge">Mock capability model</span>
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
          </div>

          {isImageEditing ? (
            <div className="quick-prompts">
              {quickPrompts.map((prompt) => (
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
            {isGeneratingInterface ? "Generating..." : "Generate Interface"}
          </button>

          {generationError ? (
            <div className="error-card">
              <strong>Could not generate interface</strong>
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

          {generatedInterface ? (
            <>
              <div className="chat-divider">
                <span>Refinement chat</span>
              </div>

              <div className="chat-thread">
                {chatMessages.length === 0 ? (
                  <p className="muted-state">
                    Ask how to refine the generated interface...
                  </p>
                ) : null}
                {chatMessages.map((msg) => (
                  <div
                    className={`chat-message chat-message-${msg.role}`}
                    key={msg.id}
                  >
                    <span>
                      {msg.role === "user"
                        ? "You"
                        : msg.role === "assistant"
                          ? "Assistant"
                          : "System"}
                    </span>
                    <p>{msg.content}</p>
                  </div>
                ))}
                {isSendingFollowUp ? (
                  <div className="chat-message chat-message-assistant">
                    <span>Assistant</span>
                    <div
                      className="typing-indicator"
                      aria-label="Assistant typing"
                    >
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                ) : null}
              </div>

              {followUpError ? (
                <p className="error-message">{followUpError}</p>
              ) : null}

              <div className="follow-up-composer">
                <input
                  aria-label="Ask how to refine this"
                  placeholder="Ask how to refine this..."
                  type="text"
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void sendFollowUp();
                  }}
                />
                <button
                  type="button"
                  disabled={isSendingFollowUp}
                  onClick={() => void sendFollowUp()}
                >
                  {isSendingFollowUp ? "..." : "Send"}
                </button>
              </div>
            </>
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
            <div className="upload-zone">
              <div className="preview-card">
                <div
                  className="preview-area"
                  style={{
                    backgroundColor: imageState.backgroundColor,
                  }}
                >
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
                      {imageState.removeBackground ? (
                        <div
                          className="fake-background-blur"
                          style={{
                            backgroundImage: `url(${imagePreviewUrl})`,
                            filter: `blur(${imageState.backgroundBlur * 0.12}px)`,
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
                            : `scale(${imageState.zoom / 100})`,
                          boxShadow: showBefore
                            ? "none"
                            : `0 ${Math.round(imageState.shadow * 0.28)}px ${Math.round(
                                imageState.shadow * 0.8
                              )}px rgba(0, 0, 0, ${Math.min(
                                0.45,
                                imageState.shadow / 180
                              )})`,
                        }}
                      />
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
                    </div>
                  ) : (
                    <div className="image-upload-placeholder">
                      <span aria-hidden="true">&#8679;</span>
                      <strong>Upload an image to give the AI context</strong>
                      <small>PNG, JPG, JPEG, or WebP</small>
                    </div>
                  )}
                </div>
                <div className="preview-meta">
                  <span>Demo context only</span>
                  <strong>{imageFileName || "No image uploaded"}</strong>
                </div>
              </div>
              {imageError ? (
                <p className="error-message">{imageError}</p>
              ) : null}
              <label className="upload-button">
                {imageFileName ? "Replace image" : "Upload image"}
                <input
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  type="file"
                  onChange={handleImageChange}
                />
              </label>
              {imagePreviewUrl ? (
                <div className="image-tools">
                  <div className="before-after-toggle">
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
                  <button type="button" onClick={resetImageState}>
                    Reset to Original
                  </button>
                  <button type="button" onClick={() => applyQuickPreset("Ecommerce Clean")}>
                    Ecommerce Clean
                  </button>
                  <button type="button" onClick={() => applyQuickPreset("Instagram Cozy")}>
                    Instagram Cozy
                  </button>
                  <button type="button" onClick={() => applyQuickPreset("Cinematic Poster")}>
                    Cinematic Poster
                  </button>
                </div>
              ) : null}
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
                Describe your goal in the chat panel and generate your interface.
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
                ? (generatedInterface.interfaceTitle ?? "Generated interface")
                : "Generated interface"}
            </h2>
            {generatedInterface?.intentSummary ? (
              <p className="controls-intent-summary">
                {generatedInterface.intentSummary}
              </p>
            ) : null}
          </div>

          {isGeneratingInterface ? (
            <div className="interface-loading-card" role="status">
              <span className="spinner" aria-hidden="true" />
              <h2>Generating purpose-built interface&hellip;</h2>
            </div>
          ) : !generatedInterface ? (
            <div className="interface-empty-state">
              <h2>
                Describe your goal and click Generate to build your interface.
              </h2>
            </div>
          ) : (
            <>
              <GeneratedInterfaceErrorBoundary>
                <GeneratedInterfacePanel
                  generatedInterface={generatedInterface}
                  showHeader={false}
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
    </div>
  );
}

export default App;
