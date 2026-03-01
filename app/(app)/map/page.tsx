"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useQuery } from "@tanstack/react-query";
import {
  Package,
  Factory,
  MapPin,
  Filter,
  Loader2,
  RefreshCw,
  DollarSign,
  Navigation,
  ShieldCheck,
  X,
  Gift,
  Tag,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MATERIAL_COLORS, MATERIAL_LABELS, DEFAULT_MAP_CENTER, DEFAULT_MAP_ZOOM } from "@/lib/constants";
import { formatKg, formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { MaterialType } from "@/types";

// ─── SVG marker builders ─────────────────────────────────────
// Each material gets a unique colored pin with its initial letter
function listingMarkerSvg(color: string, letter: string, isFree: boolean): string {
  const border = isFree ? "%2322c55e" : "%23ffffff";
  const badge = isFree
    ? `<circle cx="22" cy="6" r="6" fill="%2322c55e" stroke="white" stroke-width="1.5"/><text x="22" y="9.5" text-anchor="middle" font-size="8" font-weight="bold" fill="white">F</text>`
    : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36"><path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="${encodeURIComponent(color)}" stroke="${border}" stroke-width="2"/><circle cx="14" cy="13" r="8" fill="white" fill-opacity="0.95"/><text x="14" y="17" text-anchor="middle" font-size="11" font-weight="bold" fill="${encodeURIComponent(color)}" font-family="sans-serif">${letter}</text>${badge}</svg>`;
}

function centerMarkerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><rect x="2" y="2" width="32" height="32" rx="8" fill="%2316a34a" stroke="white" stroke-width="2.5"/><text x="18" y="24" text-anchor="middle" font-size="20" fill="white">♻</text></svg>`;
}

function userMarkerSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="%233b82f6" stroke="white" stroke-width="3"/><circle cx="10" cy="10" r="3" fill="white"/></svg>`;
}

// Material first letter for pin label
const MAT_LETTER: Record<string, string> = {
  cardboard: "C", pet: "P", aluminum: "Al", glass: "G", paper: "Pa",
  cooking_oil: "O", electronics: "E", metal_scrap: "M", wood: "W", other: "?",
};

interface ListingMarker {
  id: string;
  materialType: MaterialType;
  estimatedKg: number;
  latitude: number;
  longitude: number;
  status: string;
  pricingMode: string;
  pricePerKg: number | null;
  address: string | null;
  userName: string;
}

interface CenterMarker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  isVerified: boolean;
}

interface CenterPrice {
  materialType: string;
  pricePerKg: number;
}

export default function MapPage() {
  const [selectedListing, setSelectedListing] = useState<ListingMarker | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<CenterMarker | null>(null);
  const [showListings, setShowListings] = useState(true);
  const [showCenters, setShowCenters] = useState(true);
  const [materialFilter, setMaterialFilter] = useState<Set<string>>(new Set());
  const [pricingFilter, setPricingFilter] = useState<"all" | "free" | "for_sale">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_MAP_CENTER);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const { data: listings, isLoading: listingsLoading, refetch: refetchListings } = useQuery({
    queryKey: ["map-listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings?status=scheduled&limit=200");
      if (!res.ok) return [];
      return res.json() as Promise<ListingMarker[]>;
    },
  });

  const { data: centers, isLoading: centersLoading } = useQuery({
    queryKey: ["map-centers"],
    queryFn: async () => {
      const res = await fetch("/api/centers");
      if (!res.ok) return [];
      return res.json() as Promise<CenterMarker[]>;
    },
  });

  const handleListingClick = useCallback((listing: ListingMarker) => {
    setSelectedListing(listing);
    setSelectedCenter(null);
  }, []);

  const [centerPrices, setCenterPrices] = useState<CenterPrice[]>([]);
  const [loadingPrices, setLoadingPrices] = useState(false);

  const handleCenterClick = useCallback(async (center: CenterMarker) => {
    setSelectedCenter(center);
    setSelectedListing(null);
    setLoadingPrices(true);
    try {
      const res = await fetch(`/api/centers/${center.id}/prices`);
      if (res.ok) setCenterPrices(await res.json());
      else setCenterPrices([]);
    } catch { setCenterPrices([]); }
    finally { setLoadingPrices(false); }
  }, []);

  const isLoading = listingsLoading || centersLoading;

  const toggleMaterial = (mat: string) => {
    setMaterialFilter((prev) => {
      const next = new Set(prev);
      if (next.has(mat)) next.delete(mat); else next.add(mat);
      return next;
    });
  };

  const filteredListings = useMemo(() => {
    return listings?.filter((l) => {
      if (materialFilter.size > 0 && !materialFilter.has(l.materialType)) return false;
      if (pricingFilter === "free" && l.pricingMode !== "free") return false;
      if (pricingFilter === "for_sale" && l.pricingMode !== "for_sale") return false;
      return true;
    });
  }, [listings, materialFilter, pricingFilter]);

  const materialCounts: Record<string, number> = {};
  const freeCount = listings?.filter(l => l.pricingMode === "free").length || 0;
  const saleCount = listings?.filter(l => l.pricingMode === "for_sale").length || 0;
  listings?.forEach((l) => {
    materialCounts[l.materialType] = (materialCounts[l.materialType] || 0) + 1;
  });

  // Pre-build marker icons
  const markerIcons = useMemo(() => {
    const icons: Record<string, any> = {};
    for (const [mat, color] of Object.entries(MATERIAL_COLORS)) {
      const letter = MAT_LETTER[mat] || "?";
      icons[`${mat}_free`] = {
        url: "data:image/svg+xml;charset=UTF-8," + listingMarkerSvg(color, letter, true),
        scaledSize: { width: 28, height: 36 } as any,
        anchor: { x: 14, y: 36 } as any,
      };
      icons[`${mat}_sale`] = {
        url: "data:image/svg+xml;charset=UTF-8," + listingMarkerSvg(color, letter, false),
        scaledSize: { width: 28, height: 36 } as any,
        anchor: { x: 14, y: 36 } as any,
      };
    }
    icons.center = {
      url: "data:image/svg+xml;charset=UTF-8," + centerMarkerSvg(),
      scaledSize: { width: 36, height: 36 } as any,
    };
    icons.user = {
      url: "data:image/svg+xml;charset=UTF-8," + userMarkerSvg(),
      scaledSize: { width: 20, height: 20 } as any,
      anchor: { x: 10, y: 10 } as any,
    };
    return icons;
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      {/* ─── Filter bar ─── */}
      <div className="shrink-0 border-b bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto">
          <Button
            variant={showFilters ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1 shrink-0"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {(materialFilter.size > 0 || pricingFilter !== "all") && (
              <Badge variant="secondary" className="ml-0.5 h-4 min-w-[16px] px-1 text-[9px]">
                {materialFilter.size + (pricingFilter !== "all" ? 1 : 0)}
              </Badge>
            )}
          </Button>

          <div className="h-5 w-px bg-border shrink-0" />

          <Button
            variant={showListings ? "default" : "outline"}
            size="sm"
            onClick={() => setShowListings(!showListings)}
            className="gap-1 shrink-0"
          >
            {showListings ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Listings ({filteredListings?.length || 0})
          </Button>
          <Button
            variant={showCenters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCenters(!showCenters)}
            className="gap-1 shrink-0"
          >
            {showCenters ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            Centers ({centers?.length || 0})
          </Button>

          <div className="flex-1" />

          <span className="hidden sm:inline text-[11px] text-muted-foreground shrink-0">
            <strong className="text-foreground">{formatKg((filteredListings || []).reduce((s, l) => s + (l.estimatedKg || 0), 0))}</strong> available
          </span>

          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => refetchListings()} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>

        {/* ─── Expanded filters panel ─── */}
        {showFilters && (
          <div className="border-t px-3 py-2.5 space-y-2.5">
            {/* Pricing filter */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Pricing</p>
              <div className="flex gap-1.5">
                {([
                  { key: "all" as const, label: "All", icon: Package, count: listings?.length || 0 },
                  { key: "free" as const, label: "Free", icon: Gift, count: freeCount },
                  { key: "for_sale" as const, label: "For Sale", icon: Tag, count: saleCount },
                ] as const).map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setPricingFilter(opt.key)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all border",
                      pricingFilter === opt.key
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-background text-muted-foreground border-border/50 hover:bg-muted/50"
                    )}
                  >
                    <opt.icon className="h-3 w-3" />
                    {opt.label}
                    <span className="text-[9px] opacity-70">({opt.count})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Material checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Materials</p>
                {materialFilter.size > 0 && (
                  <button onClick={() => setMaterialFilter(new Set())} className="text-[10px] text-destructive hover:underline">
                    Clear all
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
                {Object.entries(materialCounts).sort((a, b) => b[1] - a[1]).map(([mat, count]) => {
                  const isActive = materialFilter.size === 0 || materialFilter.has(mat);
                  const color = MATERIAL_COLORS[mat] || "#64748b";
                  return (
                    <button
                      key={mat}
                      onClick={() => toggleMaterial(mat)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all text-left",
                        materialFilter.has(mat)
                          ? "border-current shadow-sm"
                          : materialFilter.size === 0
                          ? "border-border/50 bg-background hover:bg-muted/30"
                          : "border-border/30 bg-muted/20 text-muted-foreground/50 hover:bg-muted/40"
                      )}
                      style={materialFilter.has(mat) ? { borderColor: color, backgroundColor: color + "10", color } : undefined}
                    >
                      <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded border" style={{ borderColor: color, backgroundColor: materialFilter.has(mat) ? color : "transparent" }}>
                        {materialFilter.has(mat) && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color, opacity: isActive ? 1 : 0.3 }} />
                      <span className="truncate">{MATERIAL_LABELS[mat] || mat}</span>
                      <span className="ml-auto text-[9px] opacity-60">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-border/30">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Legend:</p>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-3 w-3 rounded-full border-2 border-emerald-500 bg-white" />
                <span>= Free</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-3 w-3 rounded-full border-2 border-white bg-amber-500 shadow-sm" />
                <span>= For Sale</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-3 w-3 rounded bg-emerald-600" />
                <span>= Center ♻</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="h-3 w-3 rounded-full bg-blue-500 border border-white" />
                <span>= You</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Map ─── */}
      <div className="relative flex-1" style={{ minHeight: 0, minWidth: 0 }}>
        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/50">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Google Maps API key not configured</p>
          </div>
        ) : (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}>
          <Map
            defaultCenter={userLocation}
            defaultZoom={DEFAULT_MAP_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, minHeight: '400px' }}
          >
            {/* Listing markers — color-coded by material */}
            {showListings &&
              filteredListings?.map((listing) => {
                const key = `${listing.materialType}_${listing.pricingMode === "free" ? "free" : "sale"}`;
                return (
                  <Marker
                    key={listing.id}
                    position={{ lat: listing.latitude, lng: listing.longitude }}
                    onClick={() => handleListingClick(listing)}
                    title={`${MATERIAL_LABELS[listing.materialType] || listing.materialType} · ${listing.estimatedKg}kg · ${listing.pricingMode === "free" ? "FREE" : formatCurrency(listing.pricePerKg || 0) + "/kg"}`}
                    icon={markerIcons[key] || undefined}
                  />
                );
              })}

            {/* Center markers — green recycling squares */}
            {showCenters &&
              centers?.map((center) => (
                <Marker
                  key={center.id}
                  position={{ lat: center.latitude, lng: center.longitude }}
                  onClick={() => handleCenterClick(center)}
                  title={`♻ ${center.name}`}
                  icon={markerIcons.center}
                />
              ))}

            {/* User location — blue dot */}
            <Marker position={userLocation} title="Your location" icon={markerIcons.user} />
          </Map>
        </APIProvider>
        )}
      </div>

      {/* ─── Selected listing panel ─── */}
      {selectedListing && (
        <div className="absolute bottom-14 left-2 right-2 z-20 sm:bottom-4 sm:left-4 sm:right-4">
          <Card className="border-border/50 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm"
                    style={{ backgroundColor: (MATERIAL_COLORS[selectedListing.materialType] || "#64748b") + "15" }}
                  >
                    <span className="text-sm font-bold" style={{ color: MATERIAL_COLORS[selectedListing.materialType] || "#64748b" }}>
                      {MAT_LETTER[selectedListing.materialType] || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{MATERIAL_LABELS[selectedListing.materialType] || selectedListing.materialType}</p>
                    <p className="text-[11px] text-muted-foreground">by {selectedListing.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge
                    className={cn("text-[10px]",
                      selectedListing.pricingMode === "free"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                    )}
                    variant="outline"
                  >
                    {selectedListing.pricingMode === "free" ? (
                      <><Gift className="mr-1 h-3 w-3" /> Free</>
                    ) : (
                      <><Tag className="mr-1 h-3 w-3" /> {formatCurrency(selectedListing.pricePerKg || 0)}/kg</>
                    )}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedListing(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <div className="rounded-lg bg-muted/40 px-2.5 py-1">
                  <p className="text-[9px] text-muted-foreground">Weight</p>
                  <p className="text-xs font-bold">{formatKg(selectedListing.estimatedKg)}</p>
                </div>
                {selectedListing.address && (
                  <p className="flex-1 truncate text-[11px] text-muted-foreground">
                    <MapPin className="mr-0.5 inline h-3 w-3" />
                    {selectedListing.address}
                  </p>
                )}
                <Button
                  size="sm"
                  className="gap-1 shrink-0"
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedListing.latitude},${selectedListing.longitude}`, "_blank")}
                >
                  <Navigation className="h-3 w-3" />
                  Go
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── Selected center panel ─── */}
      {selectedCenter && (
        <div className="absolute bottom-14 left-2 right-2 z-20 sm:bottom-4 sm:left-4 sm:right-4">
          <Card className="border-border/50 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                    <span className="text-lg">♻</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold">{selectedCenter.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{selectedCenter.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {selectedCenter.isVerified && (
                    <Badge className="gap-0.5 bg-emerald-500/10 text-emerald-500 text-[9px]" variant="outline">
                      <ShieldCheck className="h-2.5 w-2.5" /> Verified
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedCenter(null)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Buy prices */}
              <div className="mt-2">
                <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Buy Prices</p>
                {loadingPrices ? (
                  <Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" />
                ) : centerPrices.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">No prices published</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {centerPrices.filter((p: CenterPrice) => p.pricePerKg > 0).map((price: CenterPrice) => (
                      <div
                        key={price.materialType}
                        className="flex items-center gap-1 rounded-md border border-border/40 px-2 py-0.5"
                      >
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: MATERIAL_COLORS[price.materialType] || "#64748b" }} />
                        <span className="text-[10px] font-medium">{MATERIAL_LABELS[price.materialType] || price.materialType}</span>
                        <span className="text-[10px] font-bold text-emerald-600">{formatCurrency(price.pricePerKg)}/kg</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                size="sm"
                className="mt-2 w-full gap-1.5"
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}`, "_blank")}
              >
                <Navigation className="h-3 w-3" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
