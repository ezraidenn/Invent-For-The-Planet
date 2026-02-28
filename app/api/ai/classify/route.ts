import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const VALID_MATERIALS = [
  "cardboard",
  "pet",
  "aluminum",
  "glass",
  "paper",
  "cooking_oil",
  "electronics",
  "metal_scrap",
  "wood",
  "other",
];

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { imageUrl, imageBase64 } = body;

    if (!imageUrl && !imageBase64) {
      return NextResponse.json(
        { error: "imageUrl or imageBase64 required" },
        { status: 400 }
      );
    }

    const imageContent: any = imageUrl
      ? { type: "image_url", image_url: { url: imageUrl, detail: "low" } }
      : {
          type: "image_url",
          image_url: {
            url: `data:image/jpeg;base64,${imageBase64}`,
            detail: "low",
          },
        };

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a recycling material classifier. Analyze the image and respond with ONLY a JSON object with these fields:
- materialType: one of ${VALID_MATERIALS.join(", ")}
- confidence: number 0-100
- estimatedKg: estimated weight in kg (number)
- description: brief description of what you see (1 sentence)
Do NOT include any markdown formatting or code blocks. Return ONLY the raw JSON object.`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Classify this recyclable material:" },
            imageContent,
          ],
        },
      ],
      max_tokens: 200,
    });

    const text = response.choices[0]?.message?.content?.trim() || "";

    try {
      const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
      const result = JSON.parse(cleaned);

      if (!VALID_MATERIALS.includes(result.materialType)) {
        result.materialType = "other";
      }

      return NextResponse.json({
        materialType: result.materialType,
        confidence: Math.min(100, Math.max(0, result.confidence || 50)),
        estimatedKg: Math.max(0.1, result.estimatedKg || 1),
        description: result.description || "Recyclable material detected",
      });
    } catch {
      return NextResponse.json({
        materialType: "other",
        confidence: 30,
        estimatedKg: 1,
        description: "Could not classify material clearly",
        rawResponse: text,
      });
    }
  } catch (error: any) {
    console.error("AI classify error:", error);
    return NextResponse.json(
      { error: "Classification failed", details: error.message },
      { status: 500 }
    );
  }
}
