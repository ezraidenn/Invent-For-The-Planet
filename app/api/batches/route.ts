import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { batches, listings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, desc, and, isNull } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const conditions = [];
    const role = (session.user as any).role;

    if (role === "recycler") {
      if (status === "available") {
        conditions.push(eq(batches.status, "available"));
        conditions.push(isNull(batches.recyclerId));
      } else {
        conditions.push(eq(batches.recyclerId, session.user.id));
        if (status) conditions.push(eq(batches.status, status as any));
      }
    } else if (status) {
      conditions.push(eq(batches.status, status as any));
    }

    const results = await db
      .select()
      .from(batches)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(batches.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/batches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      listingIds,
      zone,
      scheduledDate,
      scheduledTime,
      optimizedRoute,  // From smart route generator
      autoClaim,       // If true, auto-assign to current recycler
      estimatedEarnings,
    } = body;

    if (!listingIds || !Array.isArray(listingIds) || listingIds.length === 0) {
      return NextResponse.json({ error: "listingIds required" }, { status: 400 });
    }

    // Get listings to compute totals
    const listingData = [];
    let totalKg = 0;
    for (const id of listingIds) {
      const [l] = await db.select().from(listings).where(eq(listings.id, id)).limit(1);
      if (l && l.status === "scheduled") {
        listingData.push(l);
        totalKg += l.estimatedKg;
      }
    }

    if (listingData.length === 0) {
      return NextResponse.json({ error: "No valid listings found" }, { status: 400 });
    }

    const isRecycler = (session.user as any).role === "recycler";

    const [newBatch] = await db
      .insert(batches)
      .values({
        zone: zone || null,
        totalEstimatedKg: totalKg,
        stopsCount: listingData.length,
        scheduledDate: scheduledDate || null,
        scheduledTime: scheduledTime || null,
        optimizedRoute: optimizedRoute || null,
        estimatedEarnings: estimatedEarnings || null,
        // Auto-claim: recycler who generates the route gets it assigned immediately
        ...(autoClaim && isRecycler
          ? { recyclerId: session.user.id, status: "assigned" as const }
          : {}),
      })
      .returning();

    // Update listings: if auto-claimed, go straight to "assigned", else "batched"
    const newListingStatus = autoClaim && isRecycler ? "assigned" : "batched";
    for (const l of listingData) {
      await db
        .update(listings)
        .set({ batchId: newBatch.id, status: newListingStatus as any, updatedAt: new Date() })
        .where(eq(listings.id, l.id));
    }

    return NextResponse.json(newBatch, { status: 201 });
  } catch (error) {
    console.error("POST /api/batches error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
