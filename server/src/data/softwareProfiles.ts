export type CapabilityControl =
  | "button"
  | "color_picker"
  | "slider"
  | "select"
  | "text_input";

export type Capability = {
  id: string;
  label: string;
  control: CapabilityControl;
  category?: string;
  min?: number;
  max?: number;
  options?: string[];
};

export type SoftwareProfile = {
  id: string;
  name: string;
  domain: string;
  description: string;
  requiresUpload: boolean;
  capabilities: Capability[];
};

export const softwareProfiles: SoftwareProfile[] = [
  {
    id: "miniphotopro",
    name: "MiniPhoto Pro",
    domain: "image_editing",
    description:
      "Professional image editing for product photography, portraits, social media, cinematic looks, real estate, food, print, and photo restoration.",
    requiresUpload: true,
    capabilities: [
      // ── Light & Tone ─────────────────────────────────────────
      {
        id: "exposure",
        label: "Exposure",
        control: "slider",
        category: "Light & Tone",
        min: -3,
        max: 3
      },
      {
        id: "brightness",
        label: "Brightness",
        control: "slider",
        category: "Light & Tone",
        min: -100,
        max: 100
      },
      {
        id: "contrast",
        label: "Contrast",
        control: "slider",
        category: "Light & Tone",
        min: -100,
        max: 100
      },
      {
        id: "highlights",
        label: "Highlights",
        control: "slider",
        category: "Light & Tone",
        min: -100,
        max: 100
      },
      {
        id: "shadows",
        label: "Shadows",
        control: "slider",
        category: "Light & Tone",
        min: -100,
        max: 100
      },
      {
        id: "whites",
        label: "Whites",
        control: "slider",
        category: "Light & Tone",
        min: -100,
        max: 100
      },
      {
        id: "blacks",
        label: "Blacks",
        control: "slider",
        category: "Light & Tone",
        min: -100,
        max: 100
      },

      // ── Color ────────────────────────────────────────────────
      {
        id: "saturation",
        label: "Saturation",
        control: "slider",
        category: "Color",
        min: -100,
        max: 100
      },
      {
        id: "vibrance",
        label: "Vibrance",
        control: "slider",
        category: "Color",
        min: -100,
        max: 100
      },
      {
        id: "warmth",
        label: "Warmth",
        control: "slider",
        category: "Color",
        min: -100,
        max: 100
      },
      {
        id: "tint",
        label: "Tint",
        control: "slider",
        category: "Color",
        min: -100,
        max: 100
      },
      {
        id: "hue_shift",
        label: "Hue shift",
        control: "slider",
        category: "Color",
        min: -180,
        max: 180
      },
      {
        id: "color_grade_shadows",
        label: "Shadow color grade",
        control: "color_picker",
        category: "Color"
      },
      {
        id: "color_grade_midtones",
        label: "Midtone color grade",
        control: "color_picker",
        category: "Color"
      },
      {
        id: "color_grade_highlights",
        label: "Highlight color grade",
        control: "color_picker",
        category: "Color"
      },

      // ── Detail ───────────────────────────────────────────────
      {
        id: "sharpness",
        label: "Sharpness",
        control: "slider",
        category: "Detail",
        min: 0,
        max: 100
      },
      {
        id: "clarity",
        label: "Clarity",
        control: "slider",
        category: "Detail",
        min: -100,
        max: 100
      },
      {
        id: "texture",
        label: "Texture",
        control: "slider",
        category: "Detail",
        min: -100,
        max: 100
      },
      {
        id: "noise_reduction",
        label: "Noise reduction",
        control: "slider",
        category: "Detail",
        min: 0,
        max: 100
      },
      {
        id: "dehaze",
        label: "Dehaze",
        control: "slider",
        category: "Detail",
        min: -100,
        max: 100
      },

      // ── Effects ──────────────────────────────────────────────
      {
        id: "vignette",
        label: "Vignette",
        control: "slider",
        category: "Effects",
        min: -100,
        max: 100
      },
      {
        id: "film_grain",
        label: "Film grain",
        control: "slider",
        category: "Effects",
        min: 0,
        max: 100
      },
      {
        id: "glow",
        label: "Glow / Bloom",
        control: "slider",
        category: "Effects",
        min: 0,
        max: 100
      },
      {
        id: "lens_blur",
        label: "Lens blur",
        control: "slider",
        category: "Effects",
        min: 0,
        max: 100
      },
      {
        id: "blur",
        label: "Blur",
        control: "slider",
        category: "Effects",
        min: 0,
        max: 20
      },
      {
        id: "chromatic_aberration",
        label: "Chromatic aberration",
        control: "slider",
        category: "Effects",
        min: 0,
        max: 100
      },

      // ── Style Presets ────────────────────────────────────────
      {
        id: "style_preset",
        label: "Style preset",
        control: "select",
        category: "Style",
        options: [
          "None",
          "Cinematic",
          "Vivid",
          "Matte Film",
          "Warm Glow",
          "Cool Tone",
          "Black & White",
          "Vintage",
          "HDR Pop",
          "Soft Pastel",
          "Golden Hour",
          "Faded Analog"
        ]
      },
      {
        id: "lut_strength",
        label: "Preset intensity",
        control: "slider",
        category: "Style",
        min: 0,
        max: 100
      },

      // ── Transform ────────────────────────────────────────────
      {
        id: "crop_ratio",
        label: "Crop ratio",
        control: "select",
        category: "Transform",
        options: [
          "Original",
          "1:1",
          "4:5",
          "16:9",
          "9:16",
          "3:4",
          "4:3",
          "2:3",
          "5:4"
        ]
      },
      {
        id: "rotation",
        label: "Rotation",
        control: "slider",
        category: "Transform",
        min: -45,
        max: 45
      },
      {
        id: "perspective_h",
        label: "Horizontal perspective",
        control: "slider",
        category: "Transform",
        min: -100,
        max: 100
      },
      {
        id: "perspective_v",
        label: "Vertical perspective",
        control: "slider",
        category: "Transform",
        min: -100,
        max: 100
      },
      {
        id: "flip_horizontal",
        label: "Flip horizontal",
        control: "button",
        category: "Transform"
      },
      {
        id: "padding",
        label: "Padding",
        control: "slider",
        category: "Transform",
        min: 0,
        max: 120
      },
      {
        id: "alignment",
        label: "Product alignment",
        control: "select",
        category: "Transform",
        options: ["Center", "Top", "Bottom", "Left", "Right"]
      },
      {
        id: "zoom",
        label: "Zoom",
        control: "slider",
        category: "Transform",
        min: 50,
        max: 180
      },

      // ── Background ───────────────────────────────────────────
      {
        id: "remove_background",
        label: "Remove background",
        control: "button",
        category: "Background"
      },
      {
        id: "background_color",
        label: "Background color",
        control: "color_picker",
        category: "Background"
      },
      {
        id: "background_preset",
        label: "Background scene",
        control: "select",
        category: "Background",
        options: [
          "None",
          "Pure White",
          "Studio Gray",
          "Gradient Light",
          "Soft Blur",
          "Blurred Original",
          "Dark Studio",
          "Outdoor Bokeh"
        ]
      },
      {
        id: "background_blur",
        label: "Background blur",
        control: "slider",
        category: "Background",
        min: 0,
        max: 100
      },
      {
        id: "product_shadow",
        label: "Product shadow",
        control: "slider",
        category: "Background",
        min: 0,
        max: 100
      },
      {
        id: "shadow_direction",
        label: "Shadow direction",
        control: "select",
        category: "Background",
        options: ["Bottom", "Bottom Left", "Bottom Right", "Right", "Left"]
      },

      // ── Portrait ─────────────────────────────────────────────
      {
        id: "skin_smoothing",
        label: "Skin smoothing",
        control: "slider",
        category: "Portrait",
        min: 0,
        max: 100
      },
      {
        id: "skin_tone",
        label: "Skin tone correction",
        control: "slider",
        category: "Portrait",
        min: -100,
        max: 100
      },
      {
        id: "face_brightness",
        label: "Face brightness",
        control: "slider",
        category: "Portrait",
        min: 0,
        max: 100
      },
      {
        id: "eye_enhancement",
        label: "Eye enhancement",
        control: "slider",
        category: "Portrait",
        min: 0,
        max: 100
      },
      {
        id: "teeth_whitening",
        label: "Teeth whitening",
        control: "slider",
        category: "Portrait",
        min: 0,
        max: 100
      },

      // ── Text & Overlay ───────────────────────────────────────
      {
        id: "headline_text",
        label: "Headline text",
        control: "text_input",
        category: "Text & Overlay"
      },
      {
        id: "subheadline_text",
        label: "Subheadline text",
        control: "text_input",
        category: "Text & Overlay"
      },
      {
        id: "subtext",
        label: "Subtext",
        control: "text_input",
        category: "Text & Overlay"
      },
      {
        id: "text_position",
        label: "Text position",
        control: "select",
        category: "Text & Overlay",
        options: ["Bottom", "Top", "Center", "Bottom Left", "Bottom Right"]
      },
      {
        id: "font_size",
        label: "Font size",
        control: "slider",
        category: "Text & Overlay",
        min: 12,
        max: 72
      },
      {
        id: "font_weight",
        label: "Font weight",
        control: "select",
        category: "Text & Overlay",
        options: ["Regular", "Medium", "Bold", "Black"]
      },
      {
        id: "watermark_text",
        label: "Watermark text",
        control: "text_input",
        category: "Text & Overlay"
      },
      {
        id: "text_color",
        label: "Text color",
        control: "color_picker",
        category: "Text & Overlay"
      },
      {
        id: "overlay_color",
        label: "Color overlay",
        control: "color_picker",
        category: "Text & Overlay"
      },
      {
        id: "overlay_opacity",
        label: "Overlay opacity",
        control: "slider",
        category: "Text & Overlay",
        min: 0,
        max: 100
      },

      // ── Export ───────────────────────────────────────────────
      {
        id: "output_format",
        label: "Output format",
        control: "select",
        category: "Export",
        options: ["JPEG", "PNG", "WebP", "TIFF"]
      },
      {
        id: "export_size",
        label: "Export size",
        control: "select",
        category: "Export",
        options: ["Original", "1080px", "1500px", "2048px", "4096px"]
      },
      {
        id: "export_png",
        label: "Export PNG",
        control: "button",
        category: "Export"
      },
      {
        id: "export_jpg",
        label: "Export JPG",
        control: "button",
        category: "Export"
      },
      {
        id: "resize",
        label: "Resize",
        control: "select",
        category: "Export",
        options: ["Original", "1080px", "1500px", "2048px"]
      },
      {
        id: "compression",
        label: "Compression",
        control: "slider",
        category: "Export",
        min: 0,
        max: 100
      },
      {
        id: "platform_preset",
        label: "Platform preset",
        control: "select",
        category: "Export",
        options: ["Amazon", "Instagram", "LinkedIn", "YouTube"]
      },
      {
        id: "export_ecommerce",
        label: "Export for ecommerce",
        control: "button",
        category: "Export"
      },
      {
        id: "export_print",
        label: "Export for print",
        control: "button",
        category: "Export"
      },
      {
        id: "cinematic_tone",
        label: "Cinematic tone",
        control: "button",
        category: "Adaptive Looks"
      },
      {
        id: "instagram_vibe",
        label: "Instagram vibe",
        control: "button",
        category: "Adaptive Looks"
      },
      {
        id: "premium_look",
        label: "Premium look",
        control: "button",
        category: "Adaptive Looks"
      }
    ]
  }
];
