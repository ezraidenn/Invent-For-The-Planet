import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, notifications } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";

// Rewards catalog — matches the client-side REWARDS_CATALOG
const REWARDS: Record<string, { cost: number; name: string }> = {
  "oxxo-50": { cost: 500, name: "OXXO Card $50 MXN" },
  "oxxo-100": { cost: 950, name: "OXXO Card $100 MXN" },
  "amazon-100": { cost: 1000, name: "Amazon Card $100 MXN" },
  "amazon-250": { cost: 2300, name: "Amazon Card $250 MXN" },
  "uber-50": { cost: 500, name: "Uber Coupon $50 MXN" },
  "coppel-200": { cost: 1800, name: "Coppel Card $200 MXN" },
  "tree-plant": { cost: 300, name: "Plant a Tree" },
  "ocean-cleanup": { cost: 750, name: "Clean 1kg of Ocean" },
  "school-donation": { cost: 400, name: "School Donation" },
  "recycler-badge": { cost: 200, name: "Eco-Hero Badge" },
  "premium-month": { cost: 1500, name: "ReciMap Premium (1 month)" },
  "priority-pickup": { cost: 100, name: "Priority Pickup" },
};

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rewardId } = await req.json();

    const reward = REWARDS[rewardId];
    if (!reward) {
      return NextResponse.json({ error: "Reward not found" }, { status: 404 });
    }

    // Get current user points
    const [user] = await db
      .select({ ecoPoints: users.ecoPoints })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentPoints = user.ecoPoints || 0;
    if (currentPoints < reward.cost) {
      return NextResponse.json(
        { error: "Insufficient points", required: reward.cost, current: currentPoints },
        { status: 400 }
      );
    }

    // Deduct points
    const [updated] = await db
      .update(users)
      .set({
        ecoPoints: sql`${users.ecoPoints} - ${reward.cost}`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({ ecoPoints: users.ecoPoints });

    // Create notification
    await db.insert(notifications).values({
      userId: session.user.id,
      type: "reward",
      title: "Reward Redeemed!",
      body: `You redeemed ${reward.cost} EcoPoints for: ${reward.name}`,
      data: { rewardId, rewardName: reward.name, pointsSpent: String(reward.cost) },
    });

    return NextResponse.json({
      success: true,
      reward: reward.name,
      pointsSpent: reward.cost,
      remainingPoints: updated.ecoPoints,
    });
  } catch (error) {
    console.error("POST /api/rewards/redeem error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
