const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;

if (!XENDIT_SECRET_KEY) {
  console.warn("XENDIT_SECRET_KEY is not set");
}

const BASE_URL = "https://api.xendit.co";

export interface CreateInvoiceParams {
  external_id: string;
  amount: number;
  payer_email: string;
  description: string;
  invoice_duration?: number;
  success_redirect_url?: string;
  failure_redirect_url?: string;
  should_send_email?: boolean;
  currency?: string;
  items?: {
    name: string;
    quantity: number;
    price: number;
    category?: string;
  }[];
  fees?: {
    type: string;
    value: number;
  }[];
  customer?: {
    given_names: string;
    surname?: string;
    email: string;
    mobile_number?: string;
  };
}

export async function createInvoice(params: CreateInvoiceParams) {
  if (!XENDIT_SECRET_KEY) {
    throw new Error("Xendit API key is missing");
  }

  const response = await fetch(`${BASE_URL}/v2/invoices`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(XENDIT_SECRET_KEY + ":").toString(
        "base64"
      )}`,
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Xendit API Error: ${JSON.stringify(error)}`);
  }

  return response.json();
}

export function verifyCallbackToken(
  token: string | null,
  configuredToken: string
): boolean {
  if (!token || !configuredToken) return false;
  return token === configuredToken;
}
