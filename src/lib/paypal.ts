type PayPalAccessTokenResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type PayPalOrderResponse = {
  id?: string;
  status?: string;
  message?: string;
  details?: unknown;
  purchase_units?: Array<{
    reference_id?: string;
    payments?: {
      captures?: Array<{
        id?: string;
        status?: string;
        amount?: {
          currency_code?: string;
          value?: string;
        };
        create_time?: string;
        update_time?: string;
      }>;
    };
  }>;
};

type CreatePayPalOrderInput = {
  amount: number;
  currency: string;
  merchantOrderId: string;
  orderName: string;
  customerName: string;
  customerEmail: string;
};

const zeroDecimalCurrencies = new Set(["BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA", "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"]);

function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENV === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

function assertPayPalCredentials() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || clientId.includes("여기에") || !clientSecret || clientSecret.includes("여기에")) {
    throw new Error("NEXT_PUBLIC_PAYPAL_CLIENT_ID와 PAYPAL_CLIENT_SECRET 환경변수를 먼저 설정하세요.");
  }

  return { clientId, clientSecret };
}

function formatPayPalAmount(amount: number, currency: string) {
  if (zeroDecimalCurrencies.has(currency.toUpperCase())) {
    return String(Math.round(amount));
  }

  return amount.toFixed(2);
}

async function getPayPalAccessToken() {
  const { clientId, clientSecret } = assertPayPalCredentials();
  const encodedCredentials = Buffer.from(`${clientId}:${clientSecret}`, "utf8").toString("base64");

  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  const data = (await response.json().catch(() => null)) as PayPalAccessTokenResponse | null;

  if (!response.ok || !data?.access_token) {
    throw new Error(data?.error_description ?? data?.error ?? "PayPal Access Token 발급에 실패했습니다.");
  }

  return data.access_token;
}

export async function createPayPalOrder(input: CreatePayPalOrderInput) {
  const accessToken = await getPayPalAccessToken();
  const currency = input.currency.toUpperCase();
  const value = formatPayPalAmount(input.amount, currency);

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.merchantOrderId,
          description: input.orderName,
          custom_id: input.merchantOrderId,
          amount: {
            currency_code: currency,
            value
          }
        }
      ],
      payer: {
        name: {
          given_name: input.customerName
        },
        email_address: input.customerEmail
      }
    })
  });

  const data = (await response.json().catch(() => null)) as PayPalOrderResponse | null;

  if (!response.ok || !data?.id) {
    throw new Error(data?.message ?? "PayPal 주문 생성에 실패했습니다.");
  }

  return data;
}

export async function capturePayPalOrder(orderId: string) {
  const accessToken = await getPayPalAccessToken();

  const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    }
  });

  const data = (await response.json().catch(() => null)) as PayPalOrderResponse | null;

  if (!response.ok) {
    throw new Error(data?.message ?? "PayPal 결제 Capture에 실패했습니다.");
  }

  return data;
}

export function toKoreanWonAmount(value?: string) {
  if (!value) return undefined;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return undefined;
  return Math.round(numberValue);
}
