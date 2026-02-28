"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Scale,
  Clock,
  DollarSign,
  CalendarDays,
  CheckCircle2,
  Circle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MATERIAL_LABELS, MATERIAL_COLORS, STATUS_COLORS } from "@/lib/constants";
import { formatKg, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LISTING_STATUSES = [
  "scheduled",
  "batched",
  "assigned",
  "en_route",
  "picked_up",
  "in_transit",
  "delivered",
  "verified",
] as const;

const STATUS_DESCRIPTIONS: Record<string, string> = {
  scheduled: "Your listing is visible on the map and waiting to be grouped into a batch.",
  batched: "Your listing has been grouped with nearby listings into a collection batch.",
  assigned: "A recycler has claimed the batch containing your listing.",
  en_route: "The recycler is on their way to your location.",
  picked_up: "Your materials have been picked up by the recycler.",
  in_transit: "Your materials are being transported to a collection center.",
  delivered: "Materials delivered to the collection center, awaiting verification.",
  verified: "Materials verified and weighed. EcoPoints awarded!",
  cancelled: "This listing has been cancelled.",
};

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data: listing, isLoading } = useQuery({
    queryKey: ["listing", id],
    queryFn: async () => {
      const res = await fetch(`/api/listings/${id}`);
      if (!res.ok) throw new Error("Failed to load listing");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Listing not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const currentStatusIndex = listing.status === "cancelled"
    ? -1
    : LISTING_STATUSES.indexOf(listing.status);

  const materialColor = MATERIAL_COLORS[listing.materialType] || "#64748b";

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-background px-4 py-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-display text-base font-bold">
            {MATERIAL_LABELS[listing.materialType] || listing.materialType}
          </h1>
          <p className="text-xs text-muted-foreground">
            #{listing.id.slice(0, 8)}
          </p>
        </div>
        <Badge
          className={cn("text-xs", STATUS_COLORS[listing.status] || "")}
          variant="secondary"
        >
          {listing.status}
        </Badge>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-4 p-4">
          {/* Material badge + info */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${materialColor}20` }}
                >
                  <Package className="h-7 w-7" style={{ color: materialColor }} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold">
                    {MATERIAL_LABELS[listing.materialType]}
                  </h2>
                  {listing.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {listing.description}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <Scale className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Estimated</p>
                  <p className="text-sm font-bold">{formatKg(listing.estimatedKg)}</p>
                </div>
              </CardContent>
            </Card>
            {listing.actualKg && (
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Scale className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Actual</p>
                    <p className="text-sm font-bold">{formatKg(listing.actualKg)}</p>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Pricing</p>
                  <p className="text-sm font-bold">
                    {listing.pricingMode === "free"
                      ? "Free"
                      : `${formatCurrency(listing.pricePerKg || 0)}/kg`}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <CalendarDays className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm font-bold">
                    {new Date(listing.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Location */}
          {listing.address && (
            <Card>
              <CardContent className="flex items-center gap-3 p-4">
                <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Pickup location</p>
                  <p className="truncate text-sm font-medium">{listing.address}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Status timeline */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              {listing.status === "cancelled" ? (
                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                    <Circle className="h-4 w-4 text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-700 dark:text-red-300">
                      Cancelled
                    </p>
                    <p className="text-xs text-red-500/70">
                      {STATUS_DESCRIPTIONS.cancelled}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative space-y-0">
                  {LISTING_STATUSES.map((status, i) => {
                    const isCompleted = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    const isLast = i === LISTING_STATUSES.length - 1;

                    return (
                      <div key={status} className="flex gap-3">
                        {/* Line + dot */}
                        <div className="flex flex-col items-center">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                              isCompleted
                                ? "border-primary bg-primary text-white"
                                : "border-muted-foreground/20 bg-background text-muted-foreground/40"
                            )}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Circle className="h-3 w-3" />
                            )}
                          </div>
                          {!isLast && (
                            <div
                              className={cn(
                                "w-0.5 flex-1 min-h-[20px]",
                                i < currentStatusIndex
                                  ? "bg-primary"
                                  : "bg-muted-foreground/15"
                              )}
                            />
                          )}
                        </div>

                        {/* Content */}
                        <div className={cn("pb-4", isLast && "pb-0")}>
                          <p
                            className={cn(
                              "text-sm font-medium capitalize",
                              isCurrent
                                ? "text-primary"
                                : isCompleted
                                ? "text-foreground"
                                : "text-muted-foreground/50"
                            )}
                          >
                            {status.replace("_", " ")}
                          </p>
                          {isCurrent && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {STATUS_DESCRIPTIONS[status]}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
