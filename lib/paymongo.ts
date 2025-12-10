const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;

if (!PAYMONGO_SECRET_KEY) {
  console.warn("PAYMONGO_SECRET_KEY is not set");
}

if (!PAYMONGO_PUBLIC_KEY) {
  console.warn(
    "PAYMONGO_PUBLIC_KEY is not set (may be needed for client-side operations)"
  );
}

const BASE_URL = "https://api.paymongo.com";

export interface CreateCheckoutSessionParams {
  external_id: string;
  amount: number; // Amount in cents (PHP: multiply by 100)
  payer_email: string;
  description: string;
  success_url?: string;
  failure_url?: string;
  line_items: {
    name: string;
    quantity: number;
    amount: number; // Amount in cents
    currency?: string;
  }[];
  payment_method_types?: string[];
  billing?: {
    name?: string;
    email?: string;
    phone?: string;
  };
}

export interface PayMongoCheckoutSession {
  id: string;
  type: string;
  attributes: {
    checkout_url: string;
    reference_number: string;
    amount: number;
    currency: string;
    description: string;
    status: string;
    billing?: {
      name?: string;
      email?: string;
      phone?: string;
    };
    line_items: {
      data: Array<{
        id: string;
        type: string;
        attributes: {
          name: string;
          quantity: number;
          amount: number;
          currency: string;
        };
      }>;
    };
    payment_intent: {
      id: string;
      type: string;
      attributes: {
        amount: number;
        currency: string;
        status: string;
      };
    };
    created_at: number;
    updated_at: number;
  };
}

export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<PayMongoCheckoutSession> {
  if (!PAYMONGO_SECRET_KEY) {
    throw new Error("PayMongo API key is missing");
  }

  // Convert amount to cents (PHP)
  const amountInCents = Math.round(params.amount * 100);

  const payload = {
    data: {
      attributes: {
        send_email_receipt: true,
        show_description: true,
        show_line_items: true,
        description: params.description,
        reference_number: params.external_id,
        line_items: params.line_items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          amount: Math.round(item.amount * 100), // Convert to cents
          currency: item.currency || "PHP",
        })),
        payment_method_types: params.payment_method_types || [
          "card",
          "paymaya",
          "gcash",
        ],
        success_url: params.success_url,
        failure_url: params.failure_url,
        billing: params.billing,
      },
    },
  };

  const response = await fetch(`${BASE_URL}/v1/checkout_sessions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString(
        "base64"
      )}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`PayMongo API Error: ${JSON.stringify(error)}`);
  }

  const result = await response.json();
  return result.data;
}

export function verifyWebhookSignature(
  signature: string | null,
  payload: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.error("Missing signature or secret", {
      hasSignature: !!signature,
      hasSecret: !!secret,
      secretLength: secret?.length,
    });
    return false;
  }

  // PayMongo webhook signature format: t=<timestamp>,te=<test_signature>,li=<live_signature>
  // We need to extract these components and verify the signature
  try {
    const crypto = require("crypto");

    // Parse the signature header
    // Format: t=1234567890,te=test_signature,li=live_signature
    const parts: Record<string, string> = {};
    signature.split(",").forEach((part) => {
      const [key, value] = part.split("=");
      if (key && value) {
        parts[key.trim()] = value.trim();
      }
    });

    const timestamp = parts.t;
    const testSignature = parts.te;
    const liveSignature = parts.li;

    console.log("Parsed signature parts:", {
      timestamp,
      hasTestSig: !!testSignature,
      hasLiveSig: !!liveSignature,
      payloadLength: payload.length,
      secretPrefix: secret.substring(0, 10) + "...",
    });

    if (!timestamp) {
      console.error("Missing timestamp in PayMongo signature");
      return false;
    }

    // Create the signed payload: timestamp.rawBody
    // IMPORTANT: Use the raw payload exactly as received, no modifications
    const signedPayload = `${timestamp}.${payload}`;

    // Calculate expected hash using HMAC SHA256
    const expectedHash = crypto
      .createHmac("sha256", secret)
      .update(signedPayload, "utf8")
      .digest("hex");

    // Compare with both test and live signatures (one should match)
    // Convert hex strings to buffers for constant-time comparison
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    if (testSignature) {
      const testBuffer = Buffer.from(testSignature, "hex");
      if (crypto.timingSafeEqual(expectedBuffer, testBuffer)) {
        console.log("PayMongo webhook signature verified (test mode)");
        return true;
      }
    }

    if (liveSignature) {
      const liveBuffer = Buffer.from(liveSignature, "hex");
      if (crypto.timingSafeEqual(expectedBuffer, liveBuffer)) {
        console.log("PayMongo webhook signature verified (live mode)");
        return true;
      }
    }

    console.error("PayMongo webhook signature mismatch", {
      expected: expectedHash,
      test: testSignature,
      live: liveSignature,
      timestamp,
      signedPayloadLength: signedPayload.length,
      secretLength: secret.length,
      secretPrefix: secret.substring(0, 10),
    });

    // Additional debugging: try with different secret formats
    console.log("Debugging info:", {
      payloadFirst100: payload.substring(0, 100),
      payloadLast100: payload.substring(Math.max(0, payload.length - 100)),
    });

    return false;
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    return false;
  }
}
