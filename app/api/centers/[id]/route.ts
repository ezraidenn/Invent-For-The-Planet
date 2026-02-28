import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { centers, centerPrices } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [center] = await db
      .select()
      .from(centers)
      .where(eq(centers.id, params.id))
      .limit(1);

    if (!center) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const prices = await db
      .select()
      .from(centerPrices)
      .where(eq(centerPrices.centerId, params.id));

    return NextResponse.json({ ...center, prices });
  } catch (error) {
    console.error("GET /api/centers/[id] error:", error);
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

    const [updated] = await db
      .update(centers)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(centers.id, params.id), eq(centers.userId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/centers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [deleted] = await db
      .delete(centers)
      .where(and(eq(centers.id, params.id), eq(centers.userId, session.user.id)))
      .returning({ id: centers.id });

    if (!deleted) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/centers/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
