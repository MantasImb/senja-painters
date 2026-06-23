import { z } from "zod";

const serverEnvSchema = z.object({
  ADMIN_PASSWORD: z.string().min(8),
  DATABASE_URL: z.string().min(1),
  IP_HASH_SECRET: z.string().min(32),
  NEXT_PUBLIC_SITE_URL: z.url(),
  SESSION_SECRET: z.string().min(32),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type PublicEnv = z.infer<typeof publicEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}

export function getPublicEnv(): PublicEnv {
  return publicEnvSchema.parse(process.env);
}

export function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === "development";
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === "production";
}
