"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import {
  Loader2,
  Save,
  Factory,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { MATERIAL_LABELS, MATERIAL_COLORS } from "@/lib/constants";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const materialKeys = Object.keys(MATERIAL_LABELS);

export default function PricesPage() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  const { data: centers, isLoading: loadingCenters } = useQuery({
    queryKey: ["my-centers"],
    queryFn: async () => {
      const res = await fetch("/api/centers");
      if (!res.ok) return [];
      const all = await res.json();
      return all.filter((c: any) => c.userId === session?.user?.id);
    },
    enabled: !!session?.user?.id,
  });

  const centerId = centers?.[0]?.id;

  const { data: currentPrices } = useQuery({
    queryKey: ["center-prices", centerId],
    queryFn: async () => {
      const res = await fetch(`/api/centers/${centerId}/prices`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!centerId,
  });

  const { data: historyData } = useQuery({
    queryKey: ["price-history", centerId],
    queryFn: async () => {
      const res = await fetch(`/api/centers/${centerId}/prices/history`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!centerId,
  });

  const [prices, setPrices] = useState<Record<string, string>>({});

  const saveMutation = useMutation({
    mutationFn: async () => {
      const priceEntries = materialKeys
        .filter((key) => prices[key] && parseFloat(prices[key]) > 0)
        .map((key) => ({
          materialType: key,
          pricePerKg: parseFloat(prices[key]),
        }));

      if (priceEntries.length === 0) {
        throw new Error("Please set at least one price");
      }

      const res = await fetch(`/api/centers/${centerId}/prices`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prices: priceEntries }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["center-prices"] });
      toast.success("Prices updated and published!");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // Initialize prices from current data
  if (currentPrices && Object.keys(prices).length === 0) {
    const initial: Record<string, string> = {};
    for (const p of currentPrices) {
      initial[p.materialType] = String(p.pricePerKg);
    }
    if (Object.keys(initial).length > 0) {
      setPrices(initial);
    }
  }

  if (loadingCenters) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!centerId) {
    return (
      <div className="container flex flex-col items-center py-20 text-center">
        <Factory className="mb-4 h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-lg font-medium">No collection center</h3>
        <p className="text-sm text-muted-foreground">
          You need to register a collection center first to manage prices.
        </p>
      </div>
    );
  }

  return (
    <div className="container space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Manage Prices</h1>
          <p className="text-sm text-muted-foreground">
            Set your buy prices per kg. Changes are published in real-time.
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Publish
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {materialKeys.map((key) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4 py-4">
              <div
                className="h-10 w-10 shrink-0 rounded-lg"
                style={{ backgroundColor: MATERIAL_COLORS[key] + "20" }}
              >
                <div className="flex h-full items-center justify-center">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: MATERIAL_COLORS[key] }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label className="text-sm font-medium">
                  {MATERIAL_LABELS[key]}
                </Label>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={prices[key] || ""}
                    onChange={(e) =>
                      setPrices((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className="h-8"
                  />
                  <span className="text-xs text-muted-foreground">/kg</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price history chart */}
      {historyData && historyData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" />
              Price History (30 days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={(() => {
                    // Group history data by date, with material prices as columns
                    const dateMap: Record<string, Record<string, number>> = {};
                    for (const h of historyData) {
                      const dateStr = new Date(h.recordedAt).toLocaleDateString("en-US", {
                        day: "2-digit",
                        month: "short",
                      });
                      if (!dateMap[dateStr]) dateMap[dateStr] = {};
                      dateMap[dateStr][h.materialType] = h.pricePerKg;
                    }
                    return Object.entries(dateMap)
                      .map(([date, materials]) => ({ date, ...materials }))
                      .reverse();
                  })()}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {(Array.from(
                    new Set(historyData.map((h: any) => h.materialType))
                  ) as string[]).map((mat) => (
                    <Line
                      key={mat}
                      type="monotone"
                      dataKey={mat}
                      name={MATERIAL_LABELS[mat] || mat}
                      stroke={MATERIAL_COLORS[mat] || "#64748b"}
                      strokeWidth={2}
                      dot={{ r: 3 }}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
