import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageBase64, mimeType } = body;

    /* ── Guard 1: missing image ── */
    if (!imageBase64) {
      return NextResponse.json(
        { success: false, error: "No image provided" },
        { status: 400 }
      );
    }

    /* ── Guard 2: strip data-URI prefix if the frontend accidentally sent the full
       data:image/jpeg;base64,... string instead of just the base64 payload.
       This is the #1 cause of silent 400s from OpenAI. ── */
    const cleanBase64 = imageBase64.includes(",")
      ? imageBase64.split(",")[1]
      : imageBase64;

    /* ── Guard 3: normalise mimeType — drag-and-drop can leave it empty ── */
    const cleanMime =
      mimeType && mimeType.startsWith("image/")
        ? mimeType
        : "image/jpeg"; // safe fallback

    /* ── Guard 4: validate base64 string is not corrupted ── */
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(cleanBase64.slice(0, 100))) {
      return NextResponse.json(
        { success: false, error: "Invalid image encoding — please re-upload" },
        { status: 400 }
      );
    }

    const prompt = `You are a world-class fashion stylist and body analysis expert. Analyse this full-body photo with precision and extract style DNA for a fashion platform.

Return ONLY valid JSON in this exact structure, nothing else:
{
  "gender": "<Male / Masculine | Female / Feminine | Androgynous / Unisex>",
  "bodyType": "<Slim / Lean | Athletic | Average | Broad / Muscular | Plus Size | Petite>",
  "skinTone": "<Cool (Pink / Blue hues) | Warm (Yellow / Golden hues) | Neutral (Mix)>",
  "fitPreference": "<Tailored / Form-fitting | Oversized / Relaxed | Draped / Flowing | Boxy / Structured>",
  "height": "<estimated height as a single number e.g. 172>",
  "vibes": ["<vibe 1>", "<vibe 2>", "<vibe 3>"],
  "currentOutfitDescription": "<2-sentence editorial description of what they are currently wearing>",
  "detectedColors": ["<hex color 1>", "<hex color 2>", "<hex color 3>"],
  "confidence": <0.0 to 1.0>,
  "notes": "<1-2 sentences of expert stylist observation about their natural frame and how to dress it>"
}

Vibes must be chosen from: Old Money, Streetwear, Minimalist, Dark Academic, Y2K, Techwear, Preppy, Boho, Cottagecore, Avant-garde, Classic, Contemporary.

Be precise. If you cannot determine something from the photo, make your best educated guess based on visible signals.`;

    /* ── FIX: remove response_format: json_object when using vision content.
       OpenAI returns 400 when response_format is combined with multi-modal
       (image) message content on gpt-4o. We rely on prompt instruction instead. ── */
    const openAIBody = {
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${cleanMime};base64,${cleanBase64}`,
                detail: "high",
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      max_tokens: 900,
      temperature: 0.3,
      /* DO NOT include response_format here — it causes 400 with vision inputs */
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(openAIBody),
    });

    /* ── Capture the exact OpenAI error body for debugging ── */
    if (!res.ok) {
      let errBody = {};
      try { errBody = await res.json(); } catch {}
      console.error("OpenAI Vision 400 detail:", JSON.stringify(errBody, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: errBody?.error?.message || "Vision analysis failed",
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

    /* ── Safely parse JSON — strip markdown fences if model wraps in ```json ── */
    let result;
    try {
      const cleaned = raw
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```\s*$/i, "")
        .trim();
      result = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message, "\nRaw:", raw);
      return NextResponse.json(
        { success: false, error: "AI returned malformed JSON — please retry" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });

  } catch (err) {
    console.error("scan-profile unhandled error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}