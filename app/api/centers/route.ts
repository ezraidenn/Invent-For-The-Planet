import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { centers } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { createCenterSchema } from "@/lib/validations";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const results = await db
      .select({
        id: centers.id,
        name: centers.name,
        description: centers.description,
        photoUrl: centers.photoUrl,
        latitude: centers.latitude,
        longitude: centers.longitude,
        address: centers.address,
        phone: centers.phone,
        openHours: centers.openHours,
        isVerified: centers.isVerified,
        totalKgReceived: centers.totalKgReceived,
        userId: centers.userId,
        createdAt: centers.createdAt,
      })
      .from(centers)
      .orderBy(desc(centers.createdAt));

    return NextResponse.json(results);
  } catch (error) {
    console.error("GET /api/centers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "center") {
      return NextResponse.json({ error: "Only center role can create centers" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createCenterSchema.parse(body);

    const [newCenter] = await db
      .insert(centers)
      .values({
        userId: session.user.id,
        name: parsed.name,
        description: parsed.description,
        photoUrl: parsed.photoUrl,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        address: parsed.address,
        phone: parsed.phone,
        openHours: parsed.openHours,
      })
      .returning();

    return NextResponse.json(newCenter, { status: 201 });
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("POST /api/centers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
