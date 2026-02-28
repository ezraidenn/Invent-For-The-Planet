"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Loader2,
  Scale,
  Truck,
  CheckCircle2,
  Package,
  DollarSign,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatKg, formatCurrency } from "@/lib/utils";
import { MATERIAL_LABELS } from "@/lib/constants";

export default function CenterDashboardPage() {
  const { data: centers, isLoading: loadingCenters } = useQuery({
    queryKey: ["my-centers"],
    queryFn: async () => {
      const res = await fetch("/api/centers");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const { data: transactions, isLoading: loadingTx } = useQuery({
    queryKey: ["center-transactions"],
    queryFn: async () => {
      const res = await fetch("/api/transactions");
      if (!res.ok) return [];
      return res.json();
    },
  });

  const isLoading = loadingCenters || loadingTx;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalKgReceived = centers?.reduce(
    (sum: number, c: any) => sum + (c.totalKgReceived || 0),
    0
  ) || 0;

  const totalTx = transactions?.length || 0;
  const totalRevenue =
    transactions?.reduce((sum: number, tx: any) => sum + (tx.totalAmount || 0), 0) || 0;
  const totalKgFromTx =
    transactions?.reduce((sum: number, tx: any) => sum + (tx.totalKg || 0), 0) || 0;

  // Material breakdown from transaction items
  const materialBreakdown: Record<string, { kg: number; amount: number }> = {};
  transactions?.forEach((tx: any) => {
    tx.items?.forEach((item: any) => {
      if (!materialBreakdown[item.materialType]) {
        materialBreakdown[item.materialType] = { kg: 0, amount: 0 };
      }
      materialBreakdown[item.materialType].kg += item.kg || 0;
      materialBreakdown[item.materialType].amount += item.subtotal || 0;
    });
  });

  const dashStats = [
    { label: "Total Received", value: formatKg(totalKgReceived), icon: Scale, gradient: "from-emerald-500 to-teal-500" },
    { label: "Total Paid", value: formatCurrency(totalRevenue), icon: DollarSign, gradient: "from-amber-500 to-orange-500" },
    { label: "Deliveries", value: String(totalTx), icon: Truck, gradient: "from-blue-500 to-cyan-500" },
    { label: "Centers", value: String(centers?.length || 0), icon: Package, gradient: "from-violet-500 to-purple-500" },
  ];

  return (
    <div className="container max-w-6xl space-y-6 py-6 lg:py-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-bold lg:text-3xl">Center Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your collection center operations
        </p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {dashStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-4 lg:p-6">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground lg:text-xs">{stat.label}</p>
                    <p className="font-display text-xl font-bold lg:text-2xl">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="w-full">
          <TabsTrigger value="transactions" className="flex-1">
            Transactions
          </TabsTrigger>
          <TabsTrigger value="materials" className="flex-1">
            Materials
          </TabsTrigger>
          <TabsTrigger value="centers" className="flex-1">
            Centers
          </TabsTrigger>
        </TabsList>

        {/* Transactions tab */}
        <TabsContent value="transactions" className="space-y-4">
          {!transactions || transactions.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Truck className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No deliveries yet</h3>
              <p className="text-sm text-muted-foreground">
                Incoming deliveries from recyclers will appear here
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {transactions.map((tx: any) => (
                    <div key={tx.id}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                            <ArrowUpRight className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {formatKg(tx.totalKg)} received
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {tx.completedAt
                                ? new Date(tx.completedAt).toLocaleDateString("en-US", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Pending"}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatCurrency(tx.totalAmount)}
                          </p>
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                          >
                            <CheckCircle2 className="mr-1 h-2.5 w-2.5" />
                            verified
                          </Badge>
                        </div>
                      </div>
                      {tx.items && tx.items.length > 0 && (
                        <div className="mt-2 ml-12 flex flex-wrap gap-1">
                          {tx.items.map((item: any, i: number) => (
                            <Badge key={i} variant="outline" className="text-[10px]">
                              {MATERIAL_LABELS[item.materialType] || item.materialType}:{" "}
                              {formatKg(item.kg)}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <Separator className="mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Materials breakdown tab */}
        <TabsContent value="materials" className="space-y-4">
          {Object.keys(materialBreakdown).length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No material data</h3>
              <p className="text-sm text-muted-foreground">
                Material breakdown will appear after receiving deliveries
              </p>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {Object.entries(materialBreakdown)
                    .sort(([, a], [, b]) => b.kg - a.kg)
                    .map(([mat, data]) => (
                      <div key={mat}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {MATERIAL_LABELS[mat] || mat}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatKg(data.kg)} received
                            </p>
                          </div>
                          <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                            {formatCurrency(data.amount)}
                          </p>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                (data.kg /
                                  Math.max(
                                    ...Object.values(materialBreakdown).map(
                                      (d) => d.kg
                                    )
                                  )) *
                                  100
                              )}%`,
                            }}
                          />
                        </div>
                        <Separator className="mt-3" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Centers tab */}
        <TabsContent value="centers" className="space-y-4">
          {!centers || centers.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Package className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="text-lg font-medium">No centers registered</h3>
              <p className="text-sm text-muted-foreground">
                Register your collection center to get started
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {centers.map((center: any) => (
                <Card key={center.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{center.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className={
                          center.isVerified
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                        }
                      >
                        {center.isVerified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      {center.address}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total received</span>
                      <span className="font-medium">
                        {formatKg(center.totalKgReceived || 0)}
                      </span>
                    </div>
                    {center.phone && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{center.phone}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
