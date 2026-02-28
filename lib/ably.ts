import Ably from "ably";

// Server-side: used in API routes to publish events
export const ablyServer = new Ably.Rest(process.env.ABLY_API_KEY!);

export async function publishEvent(
  channel: string,
  event: string,
  data: unknown
) {
  const ch = ablyServer.channels.get(channel);
  await ch.publish(event, data);
}

// Channel name helpers
export const channels = {
  listingsMap: "listings:map",
  batch: (batchId: string) => `batch:${batchId}`,
  prices: (materialType: string) => `prices:${materialType}`,
  user: (userId: string) => `user:${userId}`,
  recyclersLive: "recyclers:live",
  center: (centerId: string) => `center:${centerId}`,
} as const;
