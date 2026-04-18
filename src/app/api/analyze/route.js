// src/app/api/analyze/route.js

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request) {
  try {
    const body = await request.json();

    // 🔒 Check API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Missing GEMINI_API_KEY in environment variables" },
        { status: 500 }
      );
    }
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    // 🌐 Call Gemini
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const content = response.text || "No response from AI";

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