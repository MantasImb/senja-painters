import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { getServerEnv, isDevelopmentEnvironment } from "@/lib/env";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export function getDb() {
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma;
  }

  const adapter = new PrismaPg({
    connectionString: getServerEnv().DATABASE_URL,
  });

  const prisma = new PrismaClient({
    adapter,
    log: isDevelopmentEnvironment() ? ["query", "error", "warn"] : ["error"],
  });

  globalForPrisma.prisma = prisma;

  return prisma;
}
