import { NextResponse } from "next/server";
import OpenAI from "openai";

const SYSTEM_PROMPT = `You are an expert AI Fashion Stylist for StyleSavvy — a premium, AI-driven fashion platform.
You have deep expertise in:
- Outfit curation for any occasion (work, events, casual, formal, travel, etc.)
- Body type and proportion advice (athletic, petite, curvy, tall, etc.)
- Color theory and seasonal palettes (deep winter, warm spring, cool summer, etc.)
- Fashion trends and editorial style
- Wardrobe capsule building and cost-per-wear optimization
- Brand recommendations across all price points (luxury to high street)

Your personality is: warm, confident, editorial, knowledgeable — like a personal stylist at a luxury boutique who also understands high street and streetwear.

Respond conversationally but with genuine expertise. Use bullet points sparingly — prefer flowing, insightful prose. Keep responses to 3-5 sentences unless the user asks for detailed breakdowns. Use occasional emojis (1-2 max) to feel warm but not juvenile. Never be generic. Always give specific, actionable advice.

When recommending outfits, be specific: name garment types, colors, silhouettes, and how to style them. Reference the user's wardrobe context if provided.`;

export async function POST(request) {
  try {
    const { messages, userContext } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    // Build context string from user's real data
    let contextBlock = "";
    if (userContext) {
      const { displayName, styleDNA, wardrobeCount, wardrobeItems } = userContext;
      contextBlock = `\n\n---\nUSER CONTEXT:\nName: ${displayName || "the user"}\n`;
      if (styleDNA) {
        contextBlock += `Style DNA: ${JSON.stringify(styleDNA)}\n`;
      }
      if (wardrobeCount !== undefined) {
        contextBlock += `Wardrobe size: ${wardrobeCount} items\n`;
      }
      if (wardrobeItems?.length) {
        contextBlock += `Recent wardrobe items: ${wardrobeItems.slice(0, 10).map(i => i.name || i.title || i.id).join(", ")}\n`;
      }
      contextBlock += "---\n";
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT + contextBlock },
        ...messages.map(m => ({
          role: m.role === "assistant" ? "assistant" : "user",
          content: m.content
        }))
      ],
      temperature: 0.8,
      max_tokens: 800,
    });

    const text = response.choices[0].message.content || "I couldn't generate a response. Please try again!";

    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "AI service error", details: error.message },
      { status: 500 }
    );
  }
}
