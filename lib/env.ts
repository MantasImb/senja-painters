import { z } from "zod";

const serverEnvSchema = z.object({
  ADMIN_PASSWORD: z.string().min(1),
  DATABASE_URL: z.string().min(1),
  IP_HASH_SECRET: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
