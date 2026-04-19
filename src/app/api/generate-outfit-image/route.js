import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { outfitFormula, styleArchetype, colorPalette, occasion } = await request.json();

    if (!outfitFormula) {
      return NextResponse.json({ success: false, error: "No outfit formula provided" }, { status: 400 });
    }

    // Build a precise, fashion-editorial DALL-E prompt
    const heroColors = colorPalette?.labels?.slice(0, 3).join(", ") || "neutral tones";
    const prompt = `Editorial fashion photography, full-body lookbook shot. ${outfitFormula}. 
Style direction: ${styleArchetype || "contemporary minimal"}. 
Color palette: ${heroColors}. 
Setting: Clean studio with subtle gradient backdrop, professional fashion magazine quality. 
Lighting: Soft directional studio light, slight rim light. 
Shot: Full body, straight-on composition, fashion week aesthetic. 
Mood: ${occasion || "sophisticated everyday"}.
Technical: 4K sharp, highly detailed fabric textures, no text, no watermarks, photorealistic fashion campaign quality.`;

    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1792",
        quality: "hd",
        style: "natural",
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      console.error("DALL-E error:", err);

      // DALL-E can refuse some prompts — graceful fallback
      if (err.error?.code === "content_policy_violation") {
        return NextResponse.json(
          { success: false, error: "Image generation declined by content policy", code: "policy" },
          { status: 422 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Image generation failed", detail: err.error?.message },
        { status: 502 }
      );
    }

    const data = await res.json();
    const imageUrl = data.data?.[0]?.url;
    const revisedPrompt = data.data?.[0]?.revised_prompt;

    if (!imageUrl) {
      return NextResponse.json({ success: false, error: "No image returned" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      revisedPrompt,
    });
  } catch (err) {
    console.error("generate-outfit-image error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}