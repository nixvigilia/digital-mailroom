import {PrismaClient} from "../app/generated/prisma/client";
import {PrismaPg} from "@prisma/adapter-pg";
import {Pool} from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create a connection pool with proper configuration
// PrismaPg adapter can accept either a connection string or a Pool instance
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Connection pool settings
    max: 20, // Maximum number of clients in the pool
    min: 2, // Minimum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
    // Handle connection errors
    allowExitOnIdle: false,
    // Keep connections alive
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

// Handle pool errors gracefully
pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
  // Don't throw - let Prisma handle reconnection
});

pool.on("connect", () => {
  if (process.env.NODE_ENV === "development") {
    console.log("Database connection established");
  }
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

// PrismaPg adapter accepts a Pool instance
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
    await pool.end();
  });
}
