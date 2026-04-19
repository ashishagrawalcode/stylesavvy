import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 500 });
    }
    
    const openai = new OpenAI({ apiKey });
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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    let parsed;
    try { parsed = JSON.parse(content); } catch { parsed = {}; }

    return NextResponse.json({ success: true, result: parsed });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json(
      { error: "Server crashed", details: error.message },
      { status: 500 }
    );
  }
}
