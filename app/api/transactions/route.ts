import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  transactions,
  transactionItems,
  listings,
  users,
  centers,
} from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { verifyTransactionSchema } from "@/lib/validations";
import { eq, desc, or, sql } from "drizzle-orm";
import { publishEvent, channels } from "@/lib/ably";
import { ECO_POINTS_PER_KG } from "@/lib/constants";

export async function GET(_req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    let results: any[] = [];

    if (role === "recycler") {
      results = await db
        .select()
        .from(transactions)
        .where(eq(transactions.recyclerId, session.user.id))
        .orderBy(desc(transactions.createdAt));
    } else if (role === "center") {
      const userCenters = await db
        .select({ id: centers.id })
        .from(centers)
        .where(eq(centers.userId, session.user.id));

      const centerIds = userCenters.map((c) => c.id);
      if (centerIds.length === 0) return NextResponse.json([]);

      results = await db
        .select()
        .from(transactions)
        .where(
          centerIds.length === 1
            ? eq(transactions.centerId, centerIds[0])
            : or(...centerIds.map((id) => eq(transactions.centerId, id)))
        )
        .orderBy(desc(transactions.createdAt));
    } else {
      results = [];
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { batchId, centerId, items, deliveryPhotoUrl } = body;

    if (!centerId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "centerId and items required" },
        { status: 400 }
      );
    }

    const parsed = verifyTransactionSchema.parse({ items });

    let totalKg = 0;
    let totalAmount = 0;
    let totalEcoPoints = 0;

    for (const item of parsed.items) {
      totalKg += item.kg;
      totalAmount += item.kg * item.pricePerKg;
      totalEcoPoints +=
        item.kg * (ECO_POINTS_PER_KG[item.materialType] || 5);
    }

    const [newTx] = await db
      .insert(transactions)
      .values({
        batchId: batchId || null,
        recyclerId: session.user.id,
        centerId,
        totalKg,
        totalAmount,
        ecoPointsAwarded: Math.round(totalEcoPoints),
        deliveryPhotoUrl: deliveryPhotoUrl || null,
        completedAt: new Date(),
      })
      .returning();

    // Insert transaction items
    for (const item of parsed.items) {
      await db.insert(transactionItems).values({
        transactionId: newTx.id,
        materialType: item.materialType,
        kg: item.kg,
        pricePerKg: item.pricePerKg,
        subtotal: item.kg * item.pricePerKg,
      });
    }

    // Update recycler stats
    await db
      .update(users)
      .set({
        ecoPoints: sql`${users.ecoPoints} + ${Math.round(totalEcoPoints)}`,
        totalKg: sql`${users.totalKg} + ${totalKg}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    // Update center stats
    await db
      .update(centers)
      .set({
        totalKgReceived: sql`${centers.totalKgReceived} + ${totalKg}`,
        updatedAt: new Date(),
      })
      .where(eq(centers.id, centerId));

    // If batch exists, mark relevant listings
    if (batchId) {
      await db
        .update(listings)
        .set({ status: "delivered", updatedAt: new Date() })
        .where(eq(listings.batchId, batchId));
    }

    // Publish real-time events
    try {
      await publishEvent(
        channels.user(session.user.id),
        "transaction:completed",
        {
          transactionId: newTx.id,
          totalKg,
          totalAmount,
          ecoPoints: Math.round(totalEcoPoints),
        }
      );
    } catch {}

    return NextResponse.json(newTx, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
