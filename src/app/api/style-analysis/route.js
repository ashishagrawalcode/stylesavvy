import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const { styleDNA } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `You are a world-class fashion stylist and image consultant. Based on the following style profile, generate a highly personalised style analysis.

STYLE PROFILE:
- Gender: ${styleDNA.gender || "Not specified"}
- Body Build: ${styleDNA.bodyType || "Not specified"}
- Height: ${styleDNA.height ? styleDNA.height + " cm" : "Not specified"}
- Skin Undertone: ${styleDNA.skinTone || "Not specified"}
- Fit Preference: ${styleDNA.fitPreference || "Not specified"}
- Target Aesthetic: ${styleDNA.styleVibe || "Not specified"}
- Style Vibes: ${styleDNA.vibes?.join(", ") || "Not specified"}
- Occasions: ${styleDNA.occasions?.join(", ") || "Not specified"}

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "styleArchetype": "<2-3 word style archetype label e.g. 'Dark Academic Minimalist' or 'Quiet Luxury Essentialist'>",
  "summary": "<2-3 sentences: a personalised editorial analysis of this person's style identity, strengths, and what makes their aesthetic distinctive>",
  "colorPalette": {
    "hero": ["<hex1>", "<hex2>", "<hex3>"],
    "accent": ["<hex1>", "<hex2>"],
    "avoid": ["<hex1>", "<hex2>"],
    "labels": ["<color name 1>", "<color name 2>", "<color name 3>"]
  },
  "keyPieces": [
    { "item": "<garment name>", "why": "<one sentence why it works for this profile>" },
    { "item": "<garment name>", "why": "<one sentence why it works for this profile>" },
    { "item": "<garment name>", "why": "<one sentence why it works for this profile>" },
    { "item": "<garment name>", "why": "<one sentence why it works for this profile>" }
  ],
  "fabricRecommendations": ["<fabric1>", "<fabric2>", "<fabric3>"],
  "fitGuidance": "<2 sentences of specific fit advice for this body type and style>",
  "seasonalAdvice": "<1-2 sentences on how to adapt this style across seasons>",
  "avoidList": ["<thing to avoid 1>", "<thing to avoid 2>", "<thing to avoid 3>"],
  "inspirationKeywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const content = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: parsed });
  } catch (error) {
    console.error("Style analysis error:", error);
    return NextResponse.json({ error: "Analysis failed", details: error.message }, { status: 500 });
  }
}
