import {type EmailOtpType} from "@supabase/supabase-js";
import {type NextRequest} from "next/server";
import {NextResponse} from "next/server";
import {createClient} from "@/utils/supabase/server";
import {createReferralRecord} from "@/app/actions/referrals";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = "/app";

  // Prepare redirect URLs
  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  const errorRedirect = request.nextUrl.clone();
  errorRedirect.pathname = "/error";
  errorRedirect.searchParams.delete("token_hash");
  errorRedirect.searchParams.delete("type");
  errorRedirect.searchParams.delete("next");

  // Validate input - require both token_hash and type
  if (!token_hash || !type) {
    errorRedirect.searchParams.set(
      "message",
      "Invalid or missing confirmation parameters."
    );
    return NextResponse.redirect(errorRedirect);
  }

  // Attempt OTP verification
  try {
    const supabase = await createClient();
    const {error} = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error("Verify OTP error:", error);
      errorRedirect.searchParams.set(
        "message",
        error.message ||
          "Confirmation failed. Please try again or request a new confirmation link."
      );
      return NextResponse.redirect(errorRedirect);
    }

    // After successful email confirmation, create referral record if user was referred
    // This ensures both the new user and referrer have referral codes (now auto-generated)
    try {
      const {
        data: {user},
      } = await supabase.auth.getUser();
      if (user) {
        await createReferralRecord(user.id);
      }
    } catch (err) {
      // Don't block email confirmation if referral record creation fails
      console.error(
        "Error creating referral record after email confirmation:",
        err
      );
    }

    // Success: redirect to specified URL
    // Supabase session is automatically set via cookies
    return NextResponse.redirect(redirectTo);
  } catch (err) {
    console.error("Server error during confirmation:", err);
    errorRedirect.searchParams.set(
      "message",
      "Server error during confirmation. Please try again later."
    );
    return NextResponse.redirect(errorRedirect);
  }
}
