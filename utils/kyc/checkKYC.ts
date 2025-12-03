"use client";

import {createClient} from "@/utils/supabase/client";

export type KYCStatus = "not_started" | "pending" | "approved" | "rejected";

export async function getKYCStatus(): Promise<KYCStatus> {
  // TODO: Replace with actual backend check
  // For now, check localStorage as mock
  if (typeof window === "undefined") return "not_started";
  
  const kycStatus = localStorage.getItem("kyc_status");
  const kycSubmitted = localStorage.getItem("kyc_submitted");
  
  if (kycStatus === "approved") return "approved";
  if (kycStatus === "rejected") return "rejected";
  if (kycSubmitted === "true" || kycStatus === "pending") return "pending";
  return "not_started";
}

export function setKYCStatus(status: KYCStatus) {
  if (typeof window === "undefined") return;
  localStorage.setItem("kyc_status", status);
  if (status === "pending" || status === "approved") {
    localStorage.setItem("kyc_submitted", "true");
  }
}

