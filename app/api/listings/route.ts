import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listings, users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { createListingSchema } from "@/lib/validations";
import { eq, desc, and } from "drizzle-orm";
import { publishEvent, channels } from "@/lib/ably";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const materialType = searchParams.get("materialType");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    const conditions = [];
    if (status) conditions.push(eq(listings.status, status as any));
    if (materialType)
      conditions.push(eq(listings.materialType, materialType as any));
    if (userId) conditions.push(eq(listings.userId, userId));

    const results = await db
      .select({
        id: listings.id,
        materialType: listings.materialType,
        estimatedKg: listings.estimatedKg,
        actualKg: listings.actualKg,
        photoUrl: listings.photoUrl,
        description: listings.description,
        pricingMode: listings.pricingMode,
        pricePerKg: listings.pricePerKg,
        latitude: listings.latitude,
        longitude: listings.longitude,
        address: listings.address,
        status: listings.status,
        batchId: listings.batchId,
        scheduledAt: listings.scheduledAt,
        isRecurring: listings.isRecurring,
        createdAt: listings.createdAt,
        userName: users.name,
        userId: listings.userId,
      })
      .from(listings)
      .leftJoin(users, eq(listings.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(listings.createdAt))
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/listings error:", error);
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
    const parsed = createListingSchema.parse(body);

    const [newListing] = await db
      .insert(listings)
      .values({
        userId: session.user.id,
        materialType: parsed.materialType,
        estimatedKg: parsed.estimatedKg,
        photoUrl: parsed.photoUrl,
        description: parsed.description,
        pricingMode: parsed.pricingMode,
        pricePerKg: parsed.pricePerKg,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        address: parsed.address,
        scheduledAt: parsed.scheduledAt ? new Date(parsed.scheduledAt) : null,
        isRecurring: parsed.isRecurring,
        recurringDays: parsed.recurringDays,
        recurringTime: parsed.recurringTime,
      })
      .returning();

    // Publish real-time event to map channel
    try {
      await publishEvent(channels.listingsMap, "listing:new", {
        id: newListing.id,
        materialType: newListing.materialType,
        estimatedKg: newListing.estimatedKg,
        latitude: newListing.latitude,
        longitude: newListing.longitude,
        pricingMode: newListing.pricingMode,
        pricePerKg: newListing.pricePerKg,
      });
    } catch {}

    return NextResponse.json(newListing, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json(
        { error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("POST /api/listings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
