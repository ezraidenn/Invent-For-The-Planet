"use client";

import { useState, useCallback, useEffect } from "react";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
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
import type { MaterialType } from "@/types";

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
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [selectedListing, setSelectedListing] = useState<ListingMarker | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<CenterMarker | null>(null);
  const [showListings, setShowListings] = useState(true);
  const [showCenters, setShowCenters] = useState(true);
  const [materialFilter, setMaterialFilter] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState(DEFAULT_MAP_CENTER);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        () => {}
      );
    }
  }, []);

  const { data: listings, isLoading: listingsLoading, refetch: refetchListings } = useQuery({
    queryKey: ["map-listings"],
    queryFn: async () => {
      const res = await fetch("/api/listings?status=scheduled&limit=100");
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
      if (res.ok) {
        const data = await res.json();
        setCenterPrices(data);
      } else {
        setCenterPrices([]);
      }
    } catch {
      setCenterPrices([]);
    } finally {
      setLoadingPrices(false);
    }
  }, []);

  const isLoading = listingsLoading || centersLoading;

  const toggleMaterial = (mat: string) => {
    setMaterialFilter((prev) => {
      const next = new Set(prev);
      if (next.has(mat)) next.delete(mat);
      else next.add(mat);
      return next;
    });
  };

  const filteredListings = listings?.filter((l) =>
    materialFilter.size === 0 || materialFilter.has(l.materialType)
  );

  const materialCounts: Record<string, number> = {};
  listings?.forEach((l) => {
    materialCounts[l.materialType] = (materialCounts[l.materialType] || 0) + 1;
  });

  return (
    <div className="relative flex flex-col overflow-hidden" style={{ height: '100%', minHeight: 0, width: '100%', maxWidth: '100vw' }}>
      {/* Filter bar */}
      <div className="shrink-0 border-b bg-background">
        <div className="flex items-center gap-2 px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {materialFilter.size > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1 text-[10px]">
                {materialFilter.size}
              </Badge>
            )}
          </Button>
          <Button
            variant={showListings ? "default" : "outline"}
            size="sm"
            onClick={() => setShowListings(!showListings)}
            className="gap-1.5"
          >
            <Package className="h-3.5 w-3.5" />
            Listings ({filteredListings?.length || 0})
          </Button>
          <Button
            variant={showCenters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowCenters(!showCenters)}
            className="gap-1.5"
          >
            <Factory className="h-3.5 w-3.5" />
            Centers ({centers?.length || 0})
          </Button>
          <div className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
            <span className="font-medium text-foreground">{formatKg((filteredListings || []).reduce((s, l) => s + (l.estimatedKg || 0), 0))}</span>
            available
          </div>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetchListings()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap gap-1.5 border-t px-4 py-2">
            {Object.entries(materialCounts).sort((a, b) => b[1] - a[1]).map(([mat, count]) => {
              const isActive = materialFilter.has(mat);
              return (
                <button
                  key={mat}
                  onClick={() => toggleMaterial(mat)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "ring-2 ring-primary shadow-sm"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                  }`}
                  style={isActive ? { backgroundColor: (MATERIAL_COLORS[mat] || "#64748b") + "20", color: MATERIAL_COLORS[mat] || "#64748b" } : undefined}
                >
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: MATERIAL_COLORS[mat] || "#64748b" }}
                  />
                  {MATERIAL_LABELS[mat] || mat}
                  <span className="text-[10px] opacity-70">({count})</span>
                </button>
              );
            })}
            {materialFilter.size > 0 && (
              <button
                onClick={() => setMaterialFilter(new Set())}
                className="flex items-center gap-1 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="relative flex-1" style={{ minHeight: 0, minWidth: 0 }}>
        {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/50">
            <MapPin className="h-12 w-12 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">Google Maps API key not configured</p>
            <p className="max-w-xs text-center text-xs text-muted-foreground/70">Set NEXT_PUBLIC_GOOGLE_MAPS_KEY in your environment variables to enable the map</p>
          </div>
        ) : (
        <APIProvider 
          apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY}
          onLoad={() => console.log('Google Maps API loaded successfully')}
        >
          <Map
            defaultCenter={userLocation}
            defaultZoom={DEFAULT_MAP_ZOOM}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, minHeight: '400px' }}
            onCameraChanged={(ev) => console.log('Map camera changed:', ev.detail)}
          >
            {/* Listing markers */}
            {showListings &&
              filteredListings?.map((listing) => (
                <Marker
                  key={listing.id}
                  position={{ lat: listing.latitude, lng: listing.longitude }}
                  onClick={() => handleListingClick(listing)}
                  title={`${MATERIAL_LABELS[listing.materialType] || listing.materialType} - ${listing.estimatedKg}kg`}
                />
              ))}

            {/* Center markers */}
            {showCenters &&
              centers?.map((center) => (
                <Marker
                  key={center.id}
                  position={{ lat: center.latitude, lng: center.longitude }}
                  onClick={() => handleCenterClick(center)}
                  title={center.name}
                  icon={{
                    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" rx="6" fill="%2316a34a"/><text x="16" y="22" text-anchor="middle" font-size="18" fill="white">♻</text></svg>'),
                    scaledSize: { width: 32, height: 32 } as any,
                  }}
                />
              ))}

            {/* User location */}
            <Marker
              position={userLocation}
              title="Your location"
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="%233b82f6" stroke="white" stroke-width="3"/></svg>'),
                scaledSize: { width: 24, height: 24 } as any,
                anchor: { x: 12, y: 12 } as any,
              }}
            />
          </Map>
        </APIProvider>
        )}
      </div>

      {/* Selected listing info panel */}
      {selectedListing && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <Card className="border-border/50 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm"
                    style={{
                      backgroundColor:
                        (MATERIAL_COLORS[selectedListing.materialType] || "#64748b") + "20",
                    }}
                  >
                    <Package
                      className="h-4 w-4"
                      style={{ color: MATERIAL_COLORS[selectedListing.materialType] || "#64748b" }}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {MATERIAL_LABELS[selectedListing.materialType] || selectedListing.materialType}
                    </CardTitle>
                    <p className="text-[11px] text-muted-foreground">by {selectedListing.userName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {selectedListing.pricingMode === "free" ? "Free" : "For Sale"}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedListing(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-muted/30 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Weight</p>
                  <p className="text-sm font-bold">{formatKg(selectedListing.estimatedKg)}</p>
                </div>
                <div className="rounded-lg bg-muted/30 px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">Price</p>
                  <p className="text-sm font-bold">
                    {selectedListing.pricePerKg
                      ? formatCurrency(selectedListing.pricePerKg) + "/kg"
                      : "Free"}
                  </p>
                </div>
              </div>
              {selectedListing.address && (
                <p className="text-xs text-muted-foreground">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {selectedListing.address}
                </p>
              )}
              <Button
                size="sm"
                className="w-full gap-1.5"
                onClick={() => {
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedListing.latitude},${selectedListing.longitude}`,
                    "_blank"
                  );
                }}
              >
                <Navigation className="h-3.5 w-3.5" />
                Get Directions
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected center info panel with prices */}
      {selectedCenter && (
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <Card className="border-border/50 shadow-2xl shadow-black/20 backdrop-blur-xl">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                    <Factory className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{selectedCenter.name}</CardTitle>
                    <p className="text-[11px] text-muted-foreground">{selectedCenter.address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {selectedCenter.isVerified && (
                    <Badge className="gap-1 bg-emerald-500/10 text-emerald-500">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedCenter(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Prices grid */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <DollarSign className="h-3 w-3" /> Buy Prices
                </p>
                {loadingPrices ? (
                  <div className="flex justify-center py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : centerPrices.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No prices published</p>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {centerPrices.filter((p: CenterPrice) => p.pricePerKg > 0).map((price: CenterPrice) => (
                      <div
                        key={price.materialType}
                        className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 px-2.5 py-1.5"
                      >
                        <div className="flex items-center gap-1.5">
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: MATERIAL_COLORS[price.materialType] || "#64748b" }}
                          />
                          <span className="text-[11px] font-medium">
                            {MATERIAL_LABELS[price.materialType] || price.materialType}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-500">
                          {formatCurrency(price.pricePerKg)}/kg
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 gap-1.5"
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${selectedCenter.latitude},${selectedCenter.longitude}`,
                      "_blank"
                    );
                  }}
                >
                  <Navigation className="h-3.5 w-3.5" />
                  Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
