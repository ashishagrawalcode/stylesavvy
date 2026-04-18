import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const body = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Missing GEMINI_API_KEY in environment variables" }, { status: 500 });
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const outfits = body.outfits || "";

    const prompt = `You are a fashion editor hosting a styling competition. Four participants have built their looks. Provide a brief room-level editorial observation.

Participants and their looks:
${outfits}

Respond ONLY with valid JSON (no markdown):
{
  "roomTheme": "<3-4 word theme that describes the room's collective energy>",
  "observation": "<2 sentences about the collective styling energy of the room>",
  "standout": "<name of the most editorially coherent look and brief why>"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const content = response.text || "{}";

    return NextResponse.json({
      success: true,
      result: content,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Server crashed", details: error.message },
      { status: 500 }
    );
  }
}
