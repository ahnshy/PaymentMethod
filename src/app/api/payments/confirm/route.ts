import { NextRequest, NextResponse } from "next/server";
import { sendKakaoPaymentMessage } from "../../../../lib/kakao";

export const runtime = "nodejs";

type ConfirmPaymentRequestBody = {
  paymentKey?: string;
  orderId?: string;
  amount?: number;
  customerName?: string;
  phoneNumber?: string;
  selectedCardLabel?: string;
};

function isValidAmount(amount: unknown): amount is number {
  return typeof amount === "number" && Number.isInteger(amount) && amount > 0;
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as ConfirmPaymentRequestBody | null;

  if (!body?.paymentKey || !body.orderId || !isValidAmount(body.amount)) {
    return NextResponse.json(
      { message: "paymentKey, orderId, amount 값이 필요합니다." },
      { status: 400 }
    );
  }

  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey || secretKey.includes("여기에")) {
    return NextResponse.json(
      { message: "TOSS_SECRET_KEY 환경변수를 먼저 설정하세요." },
      { status: 500 }
    );
  }

  const encodedSecretKey = Buffer.from(`${secretKey}:`, "utf8").toString("base64");

  const tossResponse = await fetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedSecretKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": body.orderId
    },
    body: JSON.stringify({
      paymentKey: body.paymentKey,
      orderId: body.orderId,
      amount: body.amount
    })
  });

  const payment = await tossResponse.json().catch(() => null);

  if (!tossResponse.ok) {
    return NextResponse.json(
      {
        message: "토스페이먼츠 결제 승인에 실패했습니다.",
        payment
      },
      { status: tossResponse.status }
    );
  }

  const kakao = await sendKakaoPaymentMessage({
    phoneNumber: body.phoneNumber ?? "",
    customerName: body.customerName || "고객",
    selectedCardLabel: body.selectedCardLabel || payment?.method || "카드",
    payment: {
      orderId: payment?.orderId,
      orderName: payment?.orderName,
      method: payment?.method,
      status: payment?.status,
      totalAmount: payment?.totalAmount,
      approvedAt: payment?.approvedAt
    }
  });

  return NextResponse.json({
    payment,
    kakao
  });
}
