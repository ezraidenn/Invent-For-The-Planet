import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { batches, listings, transactions, transactionItems, users, centers, centerPrices, notifications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { publishEvent, channels } from "@/lib/ably";
import { ECO_POINTS_PER_KG } from "@/lib/constants";

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

      case "deliver": {
        // Full delivery to center: creates transaction, calculates payout, updates everything
        if (batch.recyclerId !== session.user.id) {
          return NextResponse.json({ error: "Not your batch" }, { status: 403 });
        }
        if (batch.status !== "in_progress") {
          return NextResponse.json({ error: "Batch must be in_progress" }, { status: 400 });
        }

        const { centerId, deliveryPhotoUrl } = body;
        if (!centerId) {
          return NextResponse.json({ error: "centerId required" }, { status: 400 });
        }

        // Verify all stops are confirmed
        const route: any[] = batch.optimizedRoute || [];
        const allConfirmed = route.every((s: any) => s.stopStatus === "confirmed");
        if (!allConfirmed && route.length > 0) {
          return NextResponse.json({ error: "All stops must be confirmed before delivery" }, { status: 400 });
        }

        // Load listings and center prices
        const batchListings = await db
          .select()
          .from(listings)
          .where(eq(listings.batchId, params.id));

        const cPrices = await db
          .select()
          .from(centerPrices)
          .where(eq(centerPrices.centerId, centerId));

        const priceMap: Record<string, number> = {};
        cPrices.forEach((p) => { priceMap[p.materialType] = p.pricePerKg; });

        // Calculate per-item payouts using actual weighed kg
        let totalKg = 0;
        let totalAmount = 0;
        let totalEcoPoints = 0;
        const txItems: { listingId: string; materialType: string; kg: number; pricePerKg: number; subtotal: number }[] = [];

        for (const listing of batchListings) {
          // Use actual kg from stop data or listing.actualKg, fallback to estimated
          const stopData = route.find((s: any) => s.listingId === listing.id);
          const kg = stopData?.actualKg || listing.actualKg || listing.estimatedKg;
          const price = priceMap[listing.materialType] || 0;
          const subtotal = kg * price;

          totalKg += kg;
          totalAmount += subtotal;
          totalEcoPoints += kg * (ECO_POINTS_PER_KG[listing.materialType as keyof typeof ECO_POINTS_PER_KG] || 5);

          txItems.push({
            listingId: listing.id,
            materialType: listing.materialType,
            kg,
            pricePerKg: price,
            subtotal,
          });
        }

        // Payout split: 60% transporter, 25% generators, 15% platform
        const transporterPayout = totalAmount * 0.60;
        const platformFee = totalAmount * 0.15;

        // Create transaction
        const [newTx] = await db
          .insert(transactions)
          .values({
            batchId: params.id,
            recyclerId: session.user.id,
            centerId,
            totalKg,
            totalAmount: transporterPayout, // transporter receives 60%
            ecoPointsAwarded: Math.round(totalEcoPoints),
            deliveryPhotoUrl: deliveryPhotoUrl || null,
            completedAt: new Date(),
          })
          .returning();

        // Insert transaction items
        for (const item of txItems) {
          await db.insert(transactionItems).values({
            transactionId: newTx.id,
            listingId: item.listingId,
            materialType: item.materialType as any,
            kg: item.kg,
            pricePerKg: item.pricePerKg,
            subtotal: item.subtotal,
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

        // Update all listings to delivered
        for (const listing of batchListings) {
          await db
            .update(listings)
            .set({ status: "delivered", updatedAt: new Date() })
            .where(eq(listings.id, listing.id));
        }

        // Notify each generator with their payout
        for (const item of txItems) {
          const listing = batchListings.find((l) => l.id === item.listingId);
          if (listing) {
            const generatorPayout = item.subtotal * 0.25;
            try {
              await db.insert(notifications).values({
                userId: listing.userId,
                type: "delivery_complete",
                title: "Material delivered & sold!",
                body: `Your ${item.kg}kg of ${item.materialType} was delivered to a center. You earned $${generatorPayout.toFixed(2)} MXN.`,
                data: {
                  transactionId: newTx.id,
                  listingId: item.listingId,
                  kg: String(item.kg),
                  payout: String(generatorPayout.toFixed(2)),
                  photoUrl: deliveryPhotoUrl || "",
                },
              });

              // Real-time push to generator
              await publishEvent(channels.user(listing.userId), "delivery:complete", {
                transactionId: newTx.id,
                listingId: item.listingId,
                kg: item.kg,
                generatorPayout,
                totalAmount: item.subtotal,
                photoUrl: deliveryPhotoUrl,
              });
            } catch {}
          }
        }

        updateData = {
          status: "completed",
          completedAt: new Date(),
          totalActualKg: totalKg,
          actualEarnings: transporterPayout,
        };

        // After updating batch, return enriched response
        const [deliveredBatch] = await db
          .update(batches)
          .set(updateData)
          .where(eq(batches.id, params.id))
          .returning();

        try {
          await publishEvent(channels.batch(params.id), "batch:delivered", {
            batchId: params.id,
            transactionId: newTx.id,
            totalKg,
            totalAmount,
            transporterPayout,
            platformFee,
          });
        } catch {}

        return NextResponse.json({
          ...deliveredBatch,
          transaction: {
            id: newTx.id,
            totalKg,
            grossAmount: totalAmount,
            transporterPayout,
            platformFee,
            generatorsPayout: totalAmount * 0.25,
            items: txItems,
          },
        });
      }

      case "rate": {
        // Rate the pickup experience
        const { rating, comment } = body;
        if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
          return NextResponse.json({ error: "Rating 1-5 required" }, { status: 400 });
        }

        // Update the transaction rating
        const [tx] = await db
          .select()
          .from(transactions)
          .where(eq(transactions.batchId, params.id))
          .limit(1);

        if (tx) {
          const role = (session.user as any).role;
          const ratingField = role === "recycler" ? { centerRating: rating } : { recyclerRating: rating };
          await db
            .update(transactions)
            .set(ratingField)
            .where(eq(transactions.id, tx.id));

          // Update the rated user's average rating
          const ratedUserId = role === "recycler" ? null : batch.recyclerId;
          if (ratedUserId) {
            await db
              .update(users)
              .set({
                rating: sql`(${users.rating} * ${users.totalRatings} + ${rating}) / (${users.totalRatings} + 1)`,
                totalRatings: sql`${users.totalRatings} + 1`,
              })
              .where(eq(users.id, ratedUserId));
          }
        }

        return NextResponse.json({ success: true, rating });
      }

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
