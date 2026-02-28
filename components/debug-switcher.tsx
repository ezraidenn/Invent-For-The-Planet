"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Bug,
  Building2,
  Home,
  Truck,
  Factory,
  Loader2,
  ChevronDown,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const DEMO_USERS = [
  { email: "restaurant@demo.com", name: "Taquería El Sol", role: "business", icon: Building2, color: "bg-blue-500" },
  { email: "hotel@demo.com", name: "Hotel Mérida Palace", role: "business", icon: Building2, color: "bg-blue-600" },
  { email: "maria@demo.com", name: "María García", role: "household", icon: Home, color: "bg-green-500" },
  { email: "carlos@demo.com", name: "Carlos López", role: "household", icon: Home, color: "bg-green-600" },
  { email: "recycler@demo.com", name: "Juan Recolector", role: "recycler", icon: Truck, color: "bg-amber-500" },
  { email: "recycler2@demo.com", name: "Luis Hernández", role: "recycler", icon: Truck, color: "bg-amber-600" },
  { email: "center@demo.com", name: "EcoRecicla Yucatán", role: "center", icon: Factory, color: "bg-purple-500" },
  { email: "center2@demo.com", name: "ReciYuc Sur", role: "center", icon: Factory, color: "bg-purple-600" },
];

const ROLE_COLORS: Record<string, string> = {
  business: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  household: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  recycler: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  center: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

export function DebugSwitcher() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function switchUser(email: string) {
    setLoading(email);
    try {
      const result = await signIn("credentials", {
        email,
        password: "demo123",
        redirect: false,
      });

      if (result?.error) {
        toast.error("Failed to switch: " + result.error);
      } else {
        toast.success(`Switched to ${DEMO_USERS.find((u) => u.email === email)?.name}`);
        router.push("/map");
        router.refresh();
      }
    } catch {
      toast.error("Switch failed");
    } finally {
      setLoading(null);
    }
  }

  const currentUser = DEMO_USERS.find((u) => u.email === session?.user?.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 border-dashed border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-700 dark:bg-orange-950/50 dark:text-orange-300 dark:hover:bg-orange-900/50"
        >
          <Bug className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Debug</span>
          {currentUser && (
            <Badge variant="secondary" className={`ml-1 text-[10px] ${ROLE_COLORS[currentUser.role]}`}>
              {currentUser.role}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 text-xs">
          <Bug className="h-3 w-3" />
          Quick User Switch (Debug)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DEMO_USERS.map((user) => {
          const Icon = user.icon;
          const isCurrent = session?.user?.email === user.email;
          const isLoading = loading === user.email;
          return (
            <DropdownMenuItem
              key={user.email}
              onClick={() => !isCurrent && switchUser(user.email)}
              disabled={isLoading}
              className={`cursor-pointer gap-3 ${isCurrent ? "bg-accent" : ""}`}
            >
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${user.color} text-white`}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  {isCurrent && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">
                      current
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] px-1 py-0 ${ROLE_COLORS[user.role]}`}
                  >
                    {user.role}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            signOut({ redirect: false }).then(() => {
              router.push("/login");
              router.refresh();
            });
          }}
          className="cursor-pointer text-destructive"
        >
          <User className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
