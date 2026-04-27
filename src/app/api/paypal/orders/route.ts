import { NextRequest, NextResponse } from "next/server";
import { createPayPalOrder } from "../../../../lib/paypal";

export const runtime = "nodejs";

type CreatePayPalOrderRequestBody = {
  amount?: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  phoneNumber?: string;
};

function isValidAmount(amount: unknown): amount is number {
  return typeof amount === "number" && Number.isInteger(amount) && amount >= 1000;
}

function createMerchantOrderId() {
  return `PAYPAL-${Date.now()}-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CreatePayPalOrderRequestBody | null;

  if (!body || !isValidAmount(body.amount)) {
    return NextResponse.json({ message: "PayPal 주문 생성을 위한 amount 값이 올바르지 않습니다." }, { status: 400 });
  }

  const currency = (body.currency || process.env.PAYPAL_CURRENCY || "KRW").toUpperCase();
  const merchantOrderId = createMerchantOrderId();
  const orderName = `PayPal 샘플 결제 ${new Intl.NumberFormat("ko-KR").format(body.amount)}원`;

  try {
    const order = await createPayPalOrder({
      amount: body.amount,
      currency,
      merchantOrderId,
      orderName,
      customerName: body.customerName || "고객",
      customerEmail: body.customerEmail || "tester@example.com"
    });

    return NextResponse.json({
      id: order.id,
      status: order.status,
      merchantOrderId,
      orderName
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PayPal 주문 생성 중 오류가 발생했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
