import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listings } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { updateListingSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, params.id))
      .limit(1);

    if (!listing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (error) {
    console.error("GET /api/listings/[id] error:", error);
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
    const parsed = updateListingSchema.parse(body);

    const updateData: Record<string, any> = { ...parsed, updatedAt: new Date() };
    if (parsed.scheduledAt) {
      updateData.scheduledAt = new Date(parsed.scheduledAt);
    }

    const [updated] = await db
      .update(listings)
      .set(updateData)
      .where(and(eq(listings.id, params.id), eq(listings.userId, session.user.id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    if (error?.issues) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("PATCH /api/listings/[id] error:", error);
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
      .delete(listings)
      .where(and(eq(listings.id, params.id), eq(listings.userId, session.user.id)))
      .returning({ id: listings.id });

    if (!deleted) {
      return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/listings/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
