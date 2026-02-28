import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { batches, listings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { publishEvent, channels } from "@/lib/ably";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [batch] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, params.id))
      .limit(1);

    if (!batch) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const batchListings = await db
      .select()
      .from(listings)
      .where(eq(listings.batchId, params.id));

    return NextResponse.json({ ...batch, listings: batchListings });
  } catch (error) {
    console.error("GET /api/batches/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    const [batch] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, params.id))
      .limit(1);

    if (!batch) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let updateData: Record<string, any> = {};

    switch (action) {
      case "claim":
        if (batch.status !== "available") {
          return NextResponse.json({ error: "Batch not available" }, { status: 400 });
        }
        updateData = {
          recyclerId: session.user.id,
          status: "assigned",
        };
        // Update listings status
        await db
          .update(listings)
          .set({ status: "assigned", updatedAt: new Date() })
          .where(eq(listings.batchId, params.id));
        break;

      case "start":
        if (batch.recyclerId !== session.user.id) {
          return NextResponse.json({ error: "Not your batch" }, { status: 403 });
        }
        updateData = { status: "in_progress", startedAt: new Date() };
        await db
          .update(listings)
          .set({ status: "en_route", updatedAt: new Date() })
          .where(eq(listings.batchId, params.id));
        break;

      case "complete":
        if (batch.recyclerId !== session.user.id) {
          return NextResponse.json({ error: "Not your batch" }, { status: 403 });
        }
        updateData = { status: "completed", completedAt: new Date() };
        break;

      case "cancel":
        updateData = { status: "cancelled" };
        await db
          .update(listings)
          .set({ status: "scheduled", batchId: null, updatedAt: new Date() })
          .where(eq(listings.batchId, params.id));
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const [updated] = await db
      .update(batches)
      .set(updateData)
      .where(eq(batches.id, params.id))
      .returning();

    // Publish real-time event
    try {
      await publishEvent(channels.batch(params.id), `batch:${action}`, {
        batchId: params.id,
        status: updated.status,
        recyclerId: updated.recyclerId,
      });
    } catch {}

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/batches/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
