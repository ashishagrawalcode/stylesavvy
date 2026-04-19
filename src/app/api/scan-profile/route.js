import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const { imageBase64, mimeType } = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey });

    const prompt = `You are a professional fashion stylist and body analyst. Carefully look at this photo and extract the following information with high accuracy.

Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{
  "gender": "<Male / Female / Androgynous>",
  "bodyType": "<Slim / Lean | Athletic | Average | Broad / Muscular | Plus Size | Petite>",
  "skinTone": "<Cool (Pink / Blue hues) | Warm (Yellow / Golden hues) | Neutral (Mix)>",
  "height": "<Short Frame | Average Frame | Long / Tall Frame>",
  "fitPreference": "<inferred best fit: Tailored / Form-fitting | Oversized / Relaxed | Draped / Flowing | Boxy / Structured>",
  "vibes": ["<vibe1>", "<vibe2>"],
  "styleObservation": "<1-2 sentences describing the person's likely style personality based on visual cues>",
  "colorRecommendations": ["<color1>", "<color2>", "<color3>"],
  "confidence": <integer 60-99>
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.5,
    });

    const text = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = {
        gender: "Not detected",
        bodyType: "Average",
        skinTone: "Neutral (Mix)",
        height: "Average Frame",
        fitPreference: "Tailored / Form-fitting",
        vibes: ["Minimalist"],
        styleObservation: "Could not fully analyse the image. Please try a clearer full-body photo.",
        colorRecommendations: ["Navy", "White", "Charcoal"],
        confidence: 60,
      };
    }

    return NextResponse.json({ success: true, result: parsed });
  } catch (error) {
    console.error("Profile scan error:", error);
    return NextResponse.json({ error: "AI scan failed", details: error.message }, { status: 500 });
  }
}
