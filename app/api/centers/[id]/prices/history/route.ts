import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { priceHistory } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const history = await db
      .select()
      .from(priceHistory)
      .where(eq(priceHistory.centerId, params.id))
      .orderBy(desc(priceHistory.recordedAt))
      .limit(200);

    return NextResponse.json(history);
  } catch (error) {
    console.error("GET /api/centers/[id]/prices/history error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
