import {headers} from "next/headers";
import {prisma} from "@/utils/prisma";

export async function getClientIp(): Promise<string | null> {
  const headersList = await headers();
  const xForwardedFor = headersList.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") || null;
}

export async function isIpAllowed(): Promise<boolean> {
  const ip = await getClientIp();
  //   console.log(
  //     `[IP Check] Detected IP: ${ip}, Environment: ${process.env.NODE_ENV}`
  //   );

  // Allow localhost for development
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip === "::ffff:127.0.0.1") {
    if (process.env.NODE_ENV === "development") {
      return true;
    }
  }

  if (!ip) return false;

  const allowedIp = await prisma.allowedIP.findUnique({
    where: {ip_address: ip},
  });

  if (!allowedIp) {
    console.log(`[IP Check] Access denied for IP: ${ip}`);
  } else {
    console.log(`[IP Check] Access granted for IP: ${ip}`);
  }

  return !!allowedIp;
}
