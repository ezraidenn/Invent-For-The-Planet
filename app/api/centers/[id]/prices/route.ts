import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { centerPrices, priceHistory, centers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { updatePricesSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";
import { publishEvent, channels } from "@/lib/ably";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const prices = await db
      .select()
      .from(centerPrices)
      .where(eq(centerPrices.centerId, params.id));

    return NextResponse.json(prices);
  } catch (error) {
    console.error("GET /api/centers/[id]/prices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [center] = await db
      .select({ userId: centers.userId })
      .from(centers)
      .where(eq(centers.id, params.id))
      .limit(1);

    if (!center || center.userId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updatePricesSchema.parse(body);

    // Delete existing prices for this center
    await db.delete(centerPrices).where(eq(centerPrices.centerId, params.id));

    // Insert new prices and record history
    const newPrices = [];
    for (const price of parsed.prices) {
      const [inserted] = await db
        .insert(centerPrices)
        .values({
          centerId: params.id,
          materialType: price.materialType,
          pricePerKg: price.pricePerKg,
        })
        .returning();
      newPrices.push(inserted);

      // Record in price history
      await db.insert(priceHistory).values({
        centerId: params.id,
        materialType: price.materialType,
        pricePerKg: price.pricePerKg,
      });

      // Publish real-time price update
      try {
        await publishEvent(channels.prices(price.materialType), "price:update", {
          centerId: params.id,
          materialType: price.materialType,
          pricePerKg: price.pricePerKg,
        });
      } catch {}
    }

    return NextResponse.json(newPrices);
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("PUT /api/centers/[id]/prices error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
