import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { batches, listings, notifications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { publishEvent, channels } from "@/lib/ably";

/**
 * PATCH /api/batches/[id]/stops
 * Per-stop actions during an in_progress batch.
 *
 * Body: { stopIndex: number, action: "arrive"|"weigh"|"photo"|"confirm", data?: { actualKg?, photoUrl? } }
 *
 * Flow per stop:
 *   arrive → weigh (enter actual kg) → photo (upload proof) → confirm (mark picked up)
 *
 * Each stop's progress is stored in batch.optimizedRoute[i].stopStatus
 * Listing status is updated to match.
 */
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
    const { stopIndex, action, data } = body;

    if (typeof stopIndex !== "number" || !action) {
      return NextResponse.json({ error: "stopIndex and action required" }, { status: 400 });
    }

    // Load batch
    const [batch] = await db
      .select()
      .from(batches)
      .where(eq(batches.id, params.id))
      .limit(1);

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    if (batch.recyclerId !== session.user.id) {
      return NextResponse.json({ error: "Not your batch" }, { status: 403 });
    }

    if (batch.status !== "in_progress") {
      return NextResponse.json({ error: "Batch is not in progress" }, { status: 400 });
    }

    // Get route and load listings
    const route: any[] = batch.optimizedRoute || [];
    if (stopIndex < 0 || stopIndex >= route.length) {
      return NextResponse.json({ error: "Invalid stop index" }, { status: 400 });
    }

    const batchListings = await db
      .select()
      .from(listings)
      .where(eq(listings.batchId, params.id));

    const stop = route[stopIndex];
    const listingId = stop.listingId;
    const listing = batchListings.find((l) => l.id === listingId);

    // Initialize stop status if missing
    if (!stop.stopStatus) {
      stop.stopStatus = "pending"; // pending → arrived → weighed → photographed → confirmed
    }

    let listingUpdate: Record<string, any> = {};
    const eventData: Record<string, any> = {
      batchId: params.id,
      stopIndex,
      listingId,
      recyclerId: session.user.id,
    };

    switch (action) {
      case "arrive": {
        if (stop.stopStatus !== "pending") {
          return NextResponse.json({ error: "Already arrived at this stop" }, { status: 400 });
        }
        stop.stopStatus = "arrived";
        stop.arrivedAt = new Date().toISOString();
        listingUpdate = { status: "en_route" };
        eventData.action = "arrived";
        eventData.arrivedAt = stop.arrivedAt;
        break;
      }

      case "weigh": {
        if (stop.stopStatus !== "arrived") {
          return NextResponse.json({ error: "Must arrive first" }, { status: 400 });
        }
        const actualKg = data?.actualKg;
        if (typeof actualKg !== "number" || actualKg <= 0) {
          return NextResponse.json({ error: "Valid actualKg required" }, { status: 400 });
        }
        stop.stopStatus = "weighed";
        stop.actualKg = actualKg;
        stop.weighedAt = new Date().toISOString();
        listingUpdate = { actualKg };
        eventData.action = "weighed";
        eventData.actualKg = actualKg;
        eventData.estimatedKg = listing?.estimatedKg;
        break;
      }

      case "photo": {
        if (stop.stopStatus !== "weighed") {
          return NextResponse.json({ error: "Must weigh first" }, { status: 400 });
        }
        const photoUrl = data?.photoUrl;
        if (!photoUrl || typeof photoUrl !== "string") {
          return NextResponse.json({ error: "photoUrl required" }, { status: 400 });
        }
        stop.stopStatus = "photographed";
        stop.photoUrl = photoUrl;
        stop.photographedAt = new Date().toISOString();
        listingUpdate = { pickupPhotoUrl: photoUrl };
        eventData.action = "photographed";
        eventData.photoUrl = photoUrl;
        eventData.actualKg = stop.actualKg;
        break;
      }

      case "confirm": {
        if (stop.stopStatus !== "photographed") {
          return NextResponse.json({ error: "Must upload photo first" }, { status: 400 });
        }
        stop.stopStatus = "confirmed";
        stop.confirmedAt = new Date().toISOString();
        listingUpdate = { status: "picked_up" };
        eventData.action = "confirmed";
        eventData.actualKg = stop.actualKg;
        eventData.photoUrl = stop.photoUrl;
        eventData.confirmedAt = stop.confirmedAt;
        break;
      }

      default:
        return NextResponse.json({ error: "Invalid action. Use: arrive, weigh, photo, confirm" }, { status: 400 });
    }

    // Update route in batch
    route[stopIndex] = stop;
    await db
      .update(batches)
      .set({ optimizedRoute: route })
      .where(eq(batches.id, params.id));

    // Update listing if needed
    if (listingId && Object.keys(listingUpdate).length > 0) {
      await db
        .update(listings)
        .set({ ...listingUpdate, updatedAt: new Date() })
        .where(eq(listings.id, listingId));
    }

    // Calculate overall progress
    const totalStops = route.length;
    const confirmedStops = route.filter((s: any) => s.stopStatus === "confirmed").length;
    const allConfirmed = confirmedStops === totalStops;

    // If all stops confirmed, update batch status to signal ready for delivery
    if (allConfirmed) {
      const totalActualKg = route.reduce((sum: number, s: any) => sum + (s.actualKg || 0), 0);
      await db
        .update(batches)
        .set({ totalActualKg })
        .where(eq(batches.id, params.id));
    }

    // Publish real-time event to batch channel (recycler UI)
    try {
      await publishEvent(channels.batch(params.id), `stop:${action}`, {
        ...eventData,
        progress: { confirmed: confirmedStops, total: totalStops, allConfirmed },
      });
    } catch {}

    // Publish to the listing owner so they see real-time updates
    if (listing?.userId) {
      try {
        await publishEvent(channels.user(listing.userId), `pickup:${action}`, {
          ...eventData,
          progress: { confirmed: confirmedStops, total: totalStops },
        });

        // Send notification to generator for key events
        if (action === "arrive" || action === "confirm") {
          const notifTitle = action === "arrive"
            ? "Recycler has arrived!"
            : "Pickup confirmed!";
          const notifBody = action === "arrive"
            ? `A recycler has arrived to pick up your ${listing.materialType} (${listing.estimatedKg}kg).`
            : `Your ${listing.materialType} pickup is confirmed: ${stop.actualKg}kg weighed. Photo proof attached.`;

          await db.insert(notifications).values({
            userId: listing.userId,
            type: action === "arrive" ? "pickup_arrived" : "pickup_confirmed",
            title: notifTitle,
            body: notifBody,
            data: {
              batchId: params.id,
              listingId: listingId || "",
              photoUrl: stop.photoUrl || "",
              actualKg: String(stop.actualKg || ""),
            },
          });
        }
      } catch {}
    }

    return NextResponse.json({
      stop: route[stopIndex],
      progress: { confirmed: confirmedStops, total: totalStops, allConfirmed },
    });
  } catch (error) {
    console.error("PATCH /api/batches/[id]/stops error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
