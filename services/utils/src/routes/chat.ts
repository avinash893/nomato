import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_INSTRUCTION = `You are "Nomato AI", a friendly, enthusiastic, and knowledgeable food guide and assistant for Nomato (a premium food delivery and dining app like Zomato).

Your responsibilities:
1. Food & Restaurant Recommendations: Suggest appetizing dishes, popular cuisines (Indian, Chinese, Italian, Mexican, street food, etc.), meal ideas for different occasions (party, quick lunch, romantic dinner, late night craving), and dietary options (Pure Veg, Vegan, Keto, High-protein, Jain).
2. Nomato App Assistance: Answer user questions about ordering food, tracking live orders, refund policies, applying coupons/discounts, and guide restaurant partners on how to register and list their menus.
3. Tone: Cheerful, polite, appetizing, and helpful. Use relevant food emojis (🍕, 🍛, 🍜, 🥗, 🍰) and clean bullet points for readability.
4. Boundaries: If a user asks about topics completely unrelated to food, restaurants, or the Nomato platform, warmly steer the conversation back to food and dining.`;

router.post("/", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build multi-turn contents if chat history is provided
    let contents: any = [];

    if (Array.isArray(history) && history.length > 0) {
      // Map user & assistant messages to Gemini's expected role format
      contents = history.map((msg: { role: string; content: string }) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const reply =
      response.text ||
      "Sorry, I couldn't cook up a response right now. Please try again!";

    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Chat Error:", error);
    res.status(500).json({
      error: error.message || "Failed to generate AI response",
    });
  }
});

export default router;
