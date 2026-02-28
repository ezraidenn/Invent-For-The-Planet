export type UserRole = "business" | "household" | "recycler" | "center";

export type MaterialType =
  | "cardboard"
  | "pet"
  | "aluminum"
  | "glass"
  | "paper"
  | "cooking_oil"
  | "electronics"
  | "metal_scrap"
  | "wood"
  | "other";

export type ListingStatus =
  | "scheduled"
  | "batched"
  | "assigned"
  | "en_route"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "verified"
  | "cancelled";

export type BatchStatus =
  | "available"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PricingMode = "free" | "for_sale";

export type Level = "bronze" | "silver" | "gold" | "platinum";

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  type: "listing" | "center" | "recycler";
  materialType?: MaterialType;
  status?: ListingStatus;
  kg?: number;
  name?: string;
}

export interface RouteStop {
  lat: number;
  lng: number;
  listingId: string;
  order: number;
}

export interface AblyPresenceData {
  userId: string;
  lat: number;
  lng: number;
  activeBatchId: string | null;
}

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
      role: UserRole;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
