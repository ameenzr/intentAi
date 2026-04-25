import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import multer from "multer";
import OpenAI from "openai";
import {
  type SoftwareProfile,
  softwareProfiles
} from "./data/softwareProfiles.js";
import { generateFallbackFollowUp } from "./services/fallbackFollowUpGenerator.js";
import { generateFallbackInterface } from "./services/fallbackInterfaceGenerator.js";
import type { GeneratedInterface } from "./types/generatedInterface.js";

dotenv.config();

const app = express();
const port = process.env.PORT ?? 4000;
const upload = multer({ storage: multer.memoryStorage() });
const isOpenAIConfigured = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  return Boolean(apiKey && apiKey !== "your_key_here" && !apiKey.includes("your_key"));
};

type GenerateInterfaceRequest = {
  softwareId?: unknown;
  userIntent?: unknown;
};

type FollowUpRequest = {
  softwareId?: unknown;
  userIntent?: unknown;
  generatedInterface?: unknown;
  message?: unknown;
};

type FollowUpResponse = {
  reply: string;
};

const followUpResponseSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    reply: { type: "string" }
  },
  required: ["reply"]
};

const generatedInterfaceSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    interfaceTitle: { type: "string" },
    intentSummary: { type: "string" },
    recommendedWorkflow: {
      type: "array",
      items: { type: "string" }
    },
    controls: {
      type: "array",
      maxItems: 8,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          capabilityId: { type: "string" },
          label: { type: "string" },
          componentType: {
            type: "string",
            enum: [
              "slider",
              "button",
              "select",
              "color_picker",
              "toggle",
              "text_input"
            ]
          },
          purpose: { type: "string" },
          suggestedDefault: {
            anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }]
          },
          min: { type: ["number", "null"] },
          max: { type: ["number", "null"] },
          options: {
            type: ["array", "null"],
            items: { type: "string" }
          },
          proTip: { type: "string" }
        },
        required: [
          "capabilityId",
          "label",
          "componentType",
          "purpose",
          "suggestedDefault",
          "min",
          "max",
          "options",
          "proTip"
        ]
      }
    }
  },
  required: [
    "interfaceTitle",
    "intentSummary",
    "recommendedWorkflow",
    "controls"
  ]
};

const isGeneratedInterface = (
  value: unknown,
  softwareProfile: SoftwareProfile
): value is GeneratedInterface => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const allowedCapabilityIds = new Set(
    softwareProfile.capabilities.map((capability) => capability.id)
  );
  const candidate = value as Partial<GeneratedInterface>;

  return (
    typeof candidate.interfaceTitle === "string" &&
    typeof candidate.intentSummary === "string" &&
    Array.isArray(candidate.recommendedWorkflow) &&
    candidate.recommendedWorkflow.every((step) => typeof step === "string") &&
    Array.isArray(candidate.controls) &&
    candidate.controls.length <= 8 &&
    candidate.controls.every((control) => {
      const profileCapability = softwareProfile.capabilities.find(
        (capability) => capability.id === control.capabilityId
      );

      return (
        allowedCapabilityIds.has(control.capabilityId) &&
        typeof control.label === "string" &&
        typeof control.componentType === "string" &&
        control.componentType === profileCapability?.control &&
        typeof control.purpose === "string" &&
        ["string", "number", "boolean"].includes(
          typeof control.suggestedDefault
        ) &&
        typeof control.proTip === "string" &&
        (control.min == null || typeof control.min === "number") &&
        (control.max == null || typeof control.max === "number") &&
        (control.options == null ||
          (Array.isArray(control.options) &&
            control.options.every((option) => typeof option === "string")))
      );
    })
  );
};

const parseGeneratedInterface = (
  content: string,
  softwareProfile: SoftwareProfile
) => {
  try {
    const parsed: unknown = JSON.parse(content);

    if (!isGeneratedInterface(parsed, softwareProfile)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

const parseFollowUpResponse = (content: string) => {
  try {
    const parsed = JSON.parse(content) as Partial<FollowUpResponse>;

    if (typeof parsed.reply !== "string" || !parsed.reply.trim()) {
      return null;
    }

    return { reply: parsed.reply };
  } catch {
    return null;
  }
};

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "IntentUI API",
    openaiConfigured: isOpenAIConfigured()
  });
});

app.get("/api/software", (_req, res) => {
  const softwareSummaries = softwareProfiles.map((profile) => ({
    id: profile.id,
    name: profile.name,
    domain: profile.domain,
    description: profile.description,
    capabilityCount: profile.capabilities.length
  }));

  res.json(softwareSummaries);
});

app.get("/api/software/:id", (req, res) => {
  const softwareProfile = softwareProfiles.find(
    (profile) => profile.id === req.params.id
  );

  if (!softwareProfile) {
    res.status(404).json({
      error: "Software profile not found",
      softwareId: req.params.id
    });
    return;
  }

  res.json(softwareProfile);
});

app.post("/api/generate-interface", async (req, res) => {
  const { softwareId, userIntent } = req.body as GenerateInterfaceRequest;

  if (typeof softwareId !== "string" || typeof userIntent !== "string") {
    res.status(400).json({
      error: "softwareId and userIntent are required strings"
    });
    return;
  }

  const softwareProfile = softwareProfiles.find(
    (profile) => profile.id === softwareId
  );

  if (!softwareProfile) {
    res.status(404).json({
      error: "Software profile not found",
      softwareId
    });
    return;
  }

  if (!isOpenAIConfigured()) {
    res.json(generateFallbackInterface(softwareProfile, userIntent));
    return;
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert image editor generating beginner-friendly purpose-built UI plans from software capabilities. Return only JSON matching the supplied schema. Only use capabilities from the selected software. Do not invent capability IDs. Generate at most 8 controls. CRITICAL: Order the controls array strictly from most impactful to least impactful for the specific user intent — the first control must be the single most decisive step toward achieving the stated goal, not simply whichever capability appears first in the list. Prioritize realistic starting values that produce an immediate good result. Every control must explain why it helps the user's goal."
        },
        {
          role: "user",
          content: JSON.stringify({
            userIntent,
            software: {
              name: softwareProfile.name,
              domain: softwareProfile.domain,
              description: softwareProfile.description,
              capabilities: softwareProfile.capabilities
            }
          })
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "generated_interface",
          strict: true,
          schema: generatedInterfaceSchema
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("OpenAI returned an empty response.");
    }

    const generatedInterface = parseGeneratedInterface(
      content,
      softwareProfile
    );

    if (!generatedInterface) {
      res.json(generateFallbackInterface(softwareProfile, userIntent));
      return;
    }

    res.json(generatedInterface);
  } catch (error) {
    console.error("OpenAI interface generation failed", error);
    res.json(generateFallbackInterface(softwareProfile, userIntent));
  }
});

app.post("/api/edit-image", upload.single("image"), async (req, res) => {
  try {
    const userIntent = req.body.userIntent;
    
    if (!req.file || typeof userIntent !== "string") {
      res.status(400).json({ error: "Image file and userIntent are required" });
      return;
    }

    if (!isOpenAIConfigured()) {
      // Mock delay and response for fallback mode
      await new Promise(resolve => setTimeout(resolve, 2000));
      res.json({ imageUrl: "https://picsum.photos/800/800" });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Step 1: Describe the uploaded image
    const base64Image = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Describe this image in detail. Focus on the main subject, setting, style, and colors." },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
          ]
        }
      ]
    });
    
    const description = visionResponse.choices[0].message.content || "An image";

    // Step 2: Generate new image based on description + user intent
    const generateResponse = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Original image description: ${description}. Now make the following changes/edits as requested by the user: ${userIntent}. Make it look extremely high quality and professional.`,
      n: 1,
      size: "1024x1024",
    });

    const imageUrl = generateResponse.data[0].url;
    
    if (!imageUrl) {
      throw new Error("Failed to generate image url");
    }

    res.json({ imageUrl });
  } catch (error) {
    console.error("Image editing failed:", error);
    res.status(500).json({ error: "Failed to edit image" });
  }
});



app.listen(port, () => {
  console.log(`IntentUI API listening on http://localhost:${port}`);
});
