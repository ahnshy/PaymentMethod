import { NextRequest, NextResponse } from "next/server";
import { sendKakaoPaymentMessage } from "../../../../lib/kakao";
import { capturePayPalOrder, toKoreanWonAmount } from "../../../../lib/paypal";

export const runtime = "nodejs";

type CapturePayPalOrderRequestBody = {
  orderId?: string;
  amount?: number;
  currency?: string;
  customerName?: string;
  customerEmail?: string;
  phoneNumber?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as CapturePayPalOrderRequestBody | null;

  if (!body?.orderId) {
    return NextResponse.json({ message: "PayPal orderId 값이 필요합니다." }, { status: 400 });
  }

  try {
    const capture = await capturePayPalOrder(body.orderId);
    if (!capture) {
      throw new Error("PayPal capture response is empty.");
    }

    const captureInfo = capture.purchase_units?.[0]?.payments?.captures?.[0];
    const currency = captureInfo?.amount?.currency_code || body.currency || "KRW";
    const capturedAmount = toKoreanWonAmount(captureInfo?.amount?.value) ?? body.amount ?? 0;
    const approvedAt = captureInfo?.update_time || captureInfo?.create_time || new Date().toISOString();

    const payment = {
      orderId: capture.id || body.orderId,
      orderName: "PayPal 샘플 결제",
      method: "PayPal",
      status: capture.status || captureInfo?.status || "COMPLETED",
      totalAmount: capturedAmount,
      approvedAt
    };

    const kakao = await sendKakaoPaymentMessage({
      phoneNumber: body.phoneNumber ?? "",
      customerName: body.customerName || "고객",
      selectedCardLabel: `PayPal (${currency})`,
      payment
    });

    return NextResponse.json({
      payment,
      kakao,
      paypal: capture
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "PayPal 결제 Capture 중 오류가 발생했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
