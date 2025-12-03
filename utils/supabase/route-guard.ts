"use server";

import {notFound} from "next/navigation";
import {getCurrentUserPlanType} from "./dal";

/**
 * Show 404 for free users trying to access paid routes
 * Use this at the top of paid user pages
 */
export async function requirePaidPlan() {
  const planType = await getCurrentUserPlanType();
  if (planType === "FREE") {
    notFound();
  }
}
