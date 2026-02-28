import { z } from "zod/v4";

export const registerSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["business", "household", "recycler", "center"]),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
});

export const createListingSchema = z.object({
  materialType: z.enum([
    "cardboard", "pet", "aluminum", "glass", "paper",
    "cooking_oil", "electronics", "metal_scrap", "wood", "other",
  ]),
  estimatedKg: z.number().positive("Weight must be positive"),
  photoUrl: z.string().optional(),
  description: z.string().optional(),
  pricingMode: z.enum(["free", "for_sale"]),
  pricePerKg: z.number().positive().optional(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
  scheduledAt: z.string().optional(),
  isRecurring: z.boolean().optional(),
  recurringDays: z.array(z.string()).optional(),
  recurringTime: z.string().optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const createCenterSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().min(1, "Address is required"),
  phone: z.string().optional(),
  openHours: z.record(z.string(), z.string()).optional(),
});

export const updatePricesSchema = z.object({
  prices: z.array(
    z.object({
      materialType: z.enum([
        "cardboard", "pet", "aluminum", "glass", "paper",
        "cooking_oil", "electronics", "metal_scrap", "wood", "other",
      ]),
      pricePerKg: z.number().nonnegative(),
    })
  ),
});

export const verifyTransactionSchema = z.object({
  items: z.array(
    z.object({
      materialType: z.enum([
        "cardboard", "pet", "aluminum", "glass", "paper",
        "cooking_oil", "electronics", "metal_scrap", "wood", "other",
      ]),
      kg: z.number().positive(),
      pricePerKg: z.number().nonnegative(),
    })
  ),
});

export const rateSchema = z.object({
  rating: z.number().int().min(1).max(5),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type CreateCenterInput = z.infer<typeof createCenterSchema>;
export type UpdatePricesInput = z.infer<typeof updatePricesSchema>;
export type VerifyTransactionInput = z.infer<typeof verifyTransactionSchema>;
