import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key in environment variables" },
        { status: 500 }
      );
    }
    
    const openai = new OpenAI({ apiKey });

    const items = body.items || [];
    const itemList = items.map(i => `${i.name} (${i.cat}, ${i.tag} tag, styles: ${i.style?.join(",")})`).join("; ");

    const prompt = `You are a high-fashion editorial stylist with expertise in contemporary fashion. Analyse this outfit combination and provide a concise but incisive critique.

Outfit items: ${itemList}

Respond ONLY with valid JSON in this exact format (no markdown, no preamble):
{
  "score": <integer 60-98>,
  "headline": "<8-12 word editorial headline>",
  "analysis": "<2-3 sentences: colour harmony, silhouette, styling coherence, any tension or strength>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "tension": "<one honest critique or styling tension>",
  "aesthetic": "<2-3 word aesthetic label e.g. 'Quiet Luxury' or 'Dark Minimal'>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { score: 75, headline: "Analysis Complete", analysis: content, aesthetic: "Curated", tags: [] };
    }

    return NextResponse.json({
      success: true,
      result: parsed,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Server crashed", details: error.message },
      { status: 500 }
    );
  }
}