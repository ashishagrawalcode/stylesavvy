import { NextResponse } from "next/server";

export const maxDuration = 55;
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const { outfitFormula, styleArchetype, colorPalette, occasion, quality } =
      await request.json();

    if (!outfitFormula) {
      return NextResponse.json(
        { success: false, error: "No outfit formula provided" },
        { status: 400 }
      );
    }

    const heroColors =
      colorPalette?.labels?.slice(0, 3).join(", ") || "neutral tones";

    const prompt = [
      "Editorial fashion photography, full-body lookbook shot.",
      outfitFormula + ".",
      `Style: ${styleArchetype || "contemporary minimal"}.`,
      `Colour palette: ${heroColors}.`,
      "Clean studio backdrop, professional lighting, fashion week aesthetic.",
      `Mood: ${occasion || "sophisticated everyday"}.`,
      "Photorealistic, sharp fabric detail, no text, no watermarks.",
    ].join(" ");

    /* Server-side 50s abort */
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    let res;
    try {
      res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1024x1792",
          /* "standard" generates in ~8-15s vs "hd" which takes 20-35s.
             Pass quality:"hd" from the client only when the user requests it. */
          quality: quality === "hd" ? "hd" : "standard",
          style: "natural",
        }),
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!res.ok) {
      let err = {};
      try { err = await res.json(); } catch {}
      console.error("DALL-E error:", JSON.stringify(err, null, 2));

      if (err.error?.code === "content_policy_violation") {
        return NextResponse.json(
          { success: false, error: "Content policy declined — try rephrasing the outfit description", code: "policy" },
          { status: 422 }
        );
      }
      if (err.error?.code === "rate_limit_exceeded") {
        return NextResponse.json(
          { success: false, error: "Rate limit hit — wait a moment then retry", code: "rate_limit" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { success: false, error: err.error?.message || "Image generation failed" },
        { status: 502 }
      );
    }

    const data = await res.json();
    const imageUrl = data.data?.[0]?.url;

    if (!imageUrl) {
      return NextResponse.json(
        { success: false, error: "No image returned from DALL-E" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imageUrl,
      revisedPrompt: data.data?.[0]?.revised_prompt,
    });

  } catch (err) {
    if (err.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Timed out waiting for DALL-E — please retry" },
        { status: 504 }
      );
    }
    console.error("generate-outfit-image error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}