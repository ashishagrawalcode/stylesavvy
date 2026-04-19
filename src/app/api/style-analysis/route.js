import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { styleDNA } = await request.json();

    if (!styleDNA || (!styleDNA.bodyType && !styleDNA.gender)) {
      return NextResponse.json(
        { success: false, error: "Insufficient style data provided" },
        { status: 400 }
      );
    }

    const prompt = `You are a world-class fashion editor, personal stylist, and colour theorist. Based on this style DNA profile, generate a deeply personalised, editorial-quality style analysis.

STYLE DNA:
- Gender: ${styleDNA.gender || "Not specified"}
- Body Build: ${styleDNA.bodyType || "Not specified"}
- Skin Undertone: ${styleDNA.skinTone || "Not specified"}
- Height: ${styleDNA.height ? styleDNA.height + "cm" : "Not specified"}
- Fit Preference: ${styleDNA.fitPreference || "Not specified"}
- Style Vibes: ${styleDNA.vibes?.join(", ") || "None selected"}
- Target Aesthetic: ${styleDNA.styleVibe || "Not specified"}
- Occasions: ${styleDNA.occasions?.join(", ") || "Not specified"}

Return ONLY valid JSON with this exact structure, no markdown fences, no extra text:
{
  "styleArchetype": "<evocative 2-4 word archetype name e.g. 'The Quiet Intellectual', 'Urban Romantic', 'The Sharp Minimalist'>",
  "summary": "<2 sentences — editorial summary of their aesthetic identity>",
  "editorialVerdict": "<1 punchy sentence editorial verdict e.g. what a Vogue editor would say>",
  "confidenceScore": <integer 70-99>,
  "colorPalette": {
    "hero": ["<hex1>", "<hex2>", "<hex3>"],
    "accent": ["<hex1>", "<hex2>"],
    "neutralBase": ["<hex1>", "<hex2>", "<hex3>"],
    "labels": ["<colour name 1>", "<colour name 2>", "<colour name 3>"]
  },
  "keyPieces": [
    { "item": "<piece name>", "why": "<1 sentence why this works for their build and vibe>" },
    { "item": "<piece name>", "why": "<1 sentence>" },
    { "item": "<piece name>", "why": "<1 sentence>" },
    { "item": "<piece name>", "why": "<1 sentence>" }
  ],
  "fitGuidance": "<2-3 sentences on proportional dressing for their specific build>",
  "seasonalAdvice": "<2 sentences on transitioning their wardrobe across seasons>",
  "avoidList": ["<thing to avoid 1>", "<thing to avoid 2>", "<thing to avoid 3>"],
  "fabricRecommendations": ["<fabric 1>", "<fabric 2>", "<fabric 3>", "<fabric 4>"],
  "inspirationKeywords": ["<keyword1>", "<keyword2>", "<keyword3>", "<keyword4>", "<keyword5>"],
  "brandAlignment": {
    "Investment Pieces": ["<brand1>", "<brand2>", "<brand3>"],
    "High Street": ["<brand1>", "<brand2>", "<brand3>"],
    "Online / Niche": ["<brand1>", "<brand2>"]
  },
  "outfitFormulas": [
    { "name": "<outfit name e.g. 'Everyday Edge'>", "formula": "<concise outfit description e.g. 'Slim black trousers + oversized ecru knit + white low trainers + minimal gold watch'>", "occasion": "<occasion>" },
    { "name": "<outfit name>", "formula": "<outfit description>", "occasion": "<occasion>" },
    { "name": "<outfit name>", "formula": "<outfit description>", "occasion": "<occasion>" }
  ],
  "styleEvolutionPath": "<2 sentences on where their style could evolve over the next 12 months>"
}

Be specific, editorial, and genuinely helpful. Reference their build and undertone when giving colour and fit advice.`;

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
        temperature: 0.7,
        /* No response_format needed for text-only — the prompt instructs JSON output */
      }),
    });

    if (!res.ok) {
      let errBody = {};
      try { errBody = await res.json(); } catch {}
      console.error("OpenAI style-analysis error:", JSON.stringify(errBody, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: errBody?.error?.message || "Analysis generation failed",
          code: errBody?.error?.code || null,
        },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;

    if (!raw) {
      return NextResponse.json(
        { success: false, error: "Empty response from AI" },
        { status: 500 }
      );
    }

    /* Strip markdown code fences if present */
    let result;
    try {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse failed:", parseErr.message, "\nRaw response:", raw);
      return NextResponse.json(
        { success: false, error: "AI returned malformed JSON — please retry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });

  } catch (err) {
    console.error("style-analysis unhandled error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}