import { NextResponse } from "next/server";
import Ably from "ably";

export async function GET() {
  try {
    const client = new Ably.Rest(process.env.ABLY_API_KEY!);
    const tokenRequest = await client.auth.createTokenRequest({
      capability: { "*": ["subscribe", "presence"] },
    });
    return NextResponse.json(tokenRequest);
  } catch (error) {
    console.error("Ably auth error:", error);
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    );
  }
}
