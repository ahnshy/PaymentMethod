type KakaoPaymentMessageInput = {
  phoneNumber: string;
  customerName: string;
  selectedCardLabel: string;
  payment: {
    orderId?: string;
    orderName?: string;
    method?: string;
    status?: string;
    totalAmount?: number;
    approvedAt?: string;
  };
};

type KakaoMessageResult = {
  mode: "mock" | "alimtalk";
  ok: boolean;
  message: string;
  providerResponse?: unknown;
};

function formatCurrency(amount?: number) {
  if (typeof amount !== "number") return "-";
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}

function buildMessage(input: KakaoPaymentMessageInput) {
  return [
    `[결제 완료] ${input.customerName}님`,
    `주문명: ${input.payment.orderName ?? "샘플 결제"}`,
    `주문번호: ${input.payment.orderId ?? "-"}`,
    `결제수단: ${input.selectedCardLabel}`,
    `승인금액: ${formatCurrency(input.payment.totalAmount)}`,
    `승인시각: ${input.payment.approvedAt ?? "-"}`
  ].join("\n");
}

export async function sendKakaoPaymentMessage(input: KakaoPaymentMessageInput): Promise<KakaoMessageResult> {
  const apiUrl = process.env.KAKAO_ALIMTALK_API_URL;
  const apiToken = process.env.KAKAO_ALIMTALK_API_TOKEN;
  const senderKey = process.env.KAKAO_ALIMTALK_SENDER_KEY;
  const templateCode = process.env.KAKAO_ALIMTALK_TEMPLATE_CODE;
  const text = buildMessage(input);

  if (!apiUrl || !apiToken || !senderKey || !templateCode) {
    console.info("[mock-kakao-alimtalk]", {
      to: input.phoneNumber,
      text
    });
    return {
      mode: "mock",
      ok: true,
      message: "카카오 알림톡 환경변수가 없어 mock 전송으로 처리했습니다."
    };
  }

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiToken}`
    },
    body: JSON.stringify({
      senderKey,
      templateCode,
      recipient: input.phoneNumber,
      variables: {
        customerName: input.customerName,
        orderName: input.payment.orderName ?? "샘플 결제",
        orderId: input.payment.orderId ?? "-",
        paymentMethod: input.selectedCardLabel,
        amount: formatCurrency(input.payment.totalAmount),
        approvedAt: input.payment.approvedAt ?? "-"
      },
      text
    })
  });

  const providerResponse = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      mode: "alimtalk",
      ok: false,
      message: "카카오 알림톡 Provider API 호출에 실패했습니다.",
      providerResponse
    };
  }

  return {
    mode: "alimtalk",
    ok: true,
    message: "카카오 알림톡 Provider API 호출에 성공했습니다.",
    providerResponse
  };
}
