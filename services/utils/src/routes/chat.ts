import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { chatRateLimiter } from "../middleware/rateLimiter.js";

dotenv.config();

const router = express.Router();

const SYSTEM_INSTRUCTION = `You are "Nomato AI", a friendly, enthusiastic, and knowledgeable culinary concierge for Nomato (India's premier food delivery app, like Zomato/Swiggy).

Your responsibilities:
1. Food & Restaurant Recommendations: Suggest appetizing dishes, popular cuisines (Indian, Chinese, Italian, Mexican, street food, etc.), meal ideas for different occasions (party, quick lunch, romantic dinner, late night craving), and dietary options (Pure Veg, Vegan, Keto, High-protein, Jain).
2. Nomato App Assistance: Answer user questions about ordering food, tracking live orders, refund policies, applying coupons/discounts (NOMATO50, FEAST20, FREEDEL), and guide restaurant partners on how to register and list their menus.
3. Tone: Cheerful, polite, appetizing, and helpful. Use relevant food emojis (🍕, 🍛, 🍜, 🥗, 🍰) and clean bullet points for readability.
4. Boundaries: If a user asks about topics completely unrelated to food, restaurants, or the Nomato platform, warmly steer the conversation back to food and dining.`;

// Retrieve API key directly from system environment variables
const getGeminiApiKey = (): string => {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ""
  );
};

const CANDIDATE_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-flash-latest",
];

router.post("/", chatRateLimiter, async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the system environment.",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Build multi-turn contents compliant with Gemini alternating user/model specification
    let contents: any = [];

    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        const role = msg.role === "assistant" ? "model" : "user";
        if (contents.length === 0 && role === "model") continue;
        if (contents.length > 0 && contents[contents.length - 1].role === role) continue;
        contents.push({
          role,
          parts: [{ text: msg.content }],
        });
      }

      if (contents.length > 0 && contents[contents.length - 1].role === "user") {
        contents.pop();
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
          },
        });

        if (response?.text) {
          return res.json({ reply: response.text });
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini Route] Model ${model} failed, trying next:`, err.message);
      }
    }

    throw lastError || new Error("All candidate Gemini models failed to generate a response");
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI response",
    });
  }
});

export default router;
