export const MATERIAL_COLORS: Record<string, string> = {
  cardboard: "#b45309",
  pet: "#0891b2",
  aluminum: "#94a3b8",
  glass: "#16a34a",
  paper: "#7c3aed",
  cooking_oil: "#eab308",
  electronics: "#dc2626",
  metal_scrap: "#6b7280",
  wood: "#a16207",
  other: "#64748b",
} as const;

export const MATERIAL_LABELS: Record<string, string> = {
  cardboard: "Cardboard",
  pet: "PET Plastic",
  aluminum: "Aluminum",
  glass: "Glass",
  paper: "Paper",
  cooking_oil: "Cooking Oil",
  electronics: "Electronics",
  metal_scrap: "Metal Scrap",
  wood: "Wood",
  other: "Other",
} as const;

export const MATERIAL_ICONS: Record<string, string> = {
  cardboard: "Package",
  pet: "Droplets",
  aluminum: "Cylinder",
  glass: "Wine",
  paper: "FileText",
  cooking_oil: "Flame",
  electronics: "Cpu",
  metal_scrap: "Wrench",
  wood: "TreePine",
  other: "CircleDot",
} as const;

export const ECO_POINTS_PER_KG: Record<string, number> = {
  cardboard: 10,
  pet: 15,
  aluminum: 20,
  glass: 12,
  paper: 8,
  cooking_oil: 25,
  electronics: 30,
  metal_scrap: 18,
  wood: 6,
  other: 5,
} as const;

export const LEVELS = [
  { name: "Bronze", minPoints: 0, maxPoints: 500 },
  { name: "Silver", minPoints: 501, maxPoints: 2000 },
  { name: "Gold", minPoints: 2001, maxPoints: 5000 },
  { name: "Platinum", minPoints: 5001, maxPoints: Infinity },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  batched: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  assigned: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  en_route: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  picked_up: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  in_transit: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  delivered: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  verified: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  available: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
} as const;

export const DEFAULT_MAP_CENTER = { lat: 20.9674, lng: -89.6235 }; // Mérida, Yucatán
export const DEFAULT_MAP_ZOOM = 13;
