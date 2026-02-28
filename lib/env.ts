import { z } from "zod/v4";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  ABLY_API_KEY: z.string().min(1),
  NEXT_PUBLIC_ABLY_KEY: z.string().min(1),
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  UPLOADTHING_TOKEN: z.string().optional(),
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  ABLY_API_KEY: process.env.ABLY_API_KEY,
  NEXT_PUBLIC_ABLY_KEY: process.env.NEXT_PUBLIC_ABLY_KEY,
  NEXT_PUBLIC_GOOGLE_MAPS_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  UPLOADTHING_TOKEN: process.env.UPLOADTHING_TOKEN,
});
