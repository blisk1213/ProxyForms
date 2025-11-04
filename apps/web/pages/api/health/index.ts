import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@/lib/server/supabase";

type HealthStatus = {
  status: "healthy" | "unhealthy";
  timestamp: string;
  checks: {
    database?: "ok" | "error";
    redis?: "ok" | "error";
    storage?: "ok" | "error";
  };
  errors?: string[];
};

/**
 * Health Check Endpoint
 * Used by Docker healthcheck, load balancers, and monitoring systems
 *
 * GET /api/health
 * Returns 200 if all systems operational, 503 if any critical system is down
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthStatus>
) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      checks: {},
      errors: ["Method not allowed"],
    });
  }

  const errors: string[] = [];
  const checks: HealthStatus["checks"] = {};

  // Check database connectivity
  try {
    const supabase = createClient();
    const { error } = await supabase.from("blogs").select("id").limit(1);
    if (error) throw error;
    checks.database = "ok";
  } catch (error) {
    checks.database = "error";
    errors.push(`Database: ${error instanceof Error ? error.message : "Connection failed"}`);
  }

  // Check Redis (if configured)
  // TODO: Add Redis health check when Redis client is implemented

  // Check MinIO/S3 (if needed)
  // TODO: Add storage health check if critical

  // Determine overall health
  const isHealthy = errors.length === 0;

  const response: HealthStatus = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    checks,
    ...(errors.length > 0 && { errors }),
  };

  // Return 503 Service Unavailable if unhealthy
  const statusCode = isHealthy ? 200 : 503;

  return res.status(statusCode).json(response);
}
