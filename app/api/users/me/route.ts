import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        role: users.role,
        latitude: users.latitude,
        longitude: users.longitude,
        address: users.address,
        isVerified: users.isVerified,
        rating: users.rating,
        totalRatings: users.totalRatings,
        ecoPoints: users.ecoPoints,
        totalKg: users.totalKg,
        level: users.level,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = updateProfileSchema.parse(body);

    const [updated] = await db
      .update(users)
      .set({ ...parsed, updatedAt: new Date() })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        avatarUrl: users.avatarUrl,
        role: users.role,
        address: users.address,
        ecoPoints: users.ecoPoints,
        totalKg: users.totalKg,
        level: users.level,
      });

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("PATCH /api/users/me error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
