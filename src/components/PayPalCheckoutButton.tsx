"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {useTranslations} from "next-intl";
import {useEffect, useRef, useState} from "react";

type PayPalCheckoutButtonProps = {
  amount: number;
  currency: "KRW" | "USD";
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  disabledMessage: string;
  onError: (message: string) => void;
  onCompleted: (message: string) => void;
};

type PayPalCreateOrderResponse = {
  id?: string;
  message?: string;
};

type PayPalCaptureResponse = {
  payment?: {
    orderId?: string;
    orderName?: string;
    method?: string;
    status?: string;
    totalAmount?: number;
    approvedAt?: string;
  };
  kakao?: {
    mode: string;
    ok: boolean;
    message: string;
  };
  message?: string;
};

let payPalScriptPromise: Promise<void> | null = null;
let loadedScriptKey = "";

function loadPayPalScript(clientId: string, currency: string, sdkLoadError: string) {
  const scriptKey = `${clientId}:${currency}`;

  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  if (window.paypal && loadedScriptKey === scriptKey) {
    return Promise.resolve();
  }

  const oldScript = document.querySelector<HTMLScriptElement>('script[data-paypal-sdk="true"]');
  if (oldScript && loadedScriptKey !== scriptKey) {
    oldScript.remove();
    window.paypal = undefined;
    payPalScriptPromise = null;
  }

  if (payPalScriptPromise) {
    return payPalScriptPromise;
  }

  payPalScriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      "client-id": clientId,
      currency,
      intent: "capture",
      components: "buttons"
    });

    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => {
      loadedScriptKey = scriptKey;
      resolve();
    };
    script.onerror = () => reject(new Error(sdkLoadError));
    document.body.appendChild(script);
  });

  return payPalScriptPromise;
}

export function PayPalCheckoutButton({
  amount,
  currency,
  customerName,
  customerEmail,
  phoneNumber,
  disabledMessage,
  onError,
  onCompleted
}: PayPalCheckoutButtonProps) {
  const t = useTranslations("paypal");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonsRef = useRef<PayPalButtonsInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localMessage, setLocalMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

    async function renderButtons() {
      setLocalMessage("");
      setIsLoading(true);

      if (!clientId || clientId.includes("?")) {
        setLocalMessage(t("missingClientId"));
        setIsLoading(false);
        return;
      }

      if (disabledMessage) {
        setLocalMessage(disabledMessage);
        setIsLoading(false);
        return;
      }

      try {
        await loadPayPalScript(clientId, currency, t("sdkLoadError"));

        if (!isMounted || !containerRef.current || !window.paypal) {
          return;
        }

        if (buttonsRef.current) {
          buttonsRef.current.close?.();
          buttonsRef.current = null;
        }

        containerRef.current.innerHTML = "";

        const buttons = window.paypal.Buttons({
          style: {
            layout: "vertical",
            shape: "rect",
            label: "paypal"
          },
          createOrder: async () => {
            const response = await fetch("/api/paypal/orders", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                amount,
                currency,
                customerName,
                customerEmail,
                phoneNumber
              })
            });

            const data = (await response.json().catch(() => null)) as PayPalCreateOrderResponse | null;
            if (!response.ok || !data?.id) {
              throw new Error(data?.message ?? t("createOrderError"));
            }

            return data.id;
          },
          onApprove: async (data) => {
            const orderId = data.orderID;
            if (!orderId) {
              throw new Error(t("missingOrderId"));
            }

            const response = await fetch("/api/paypal/capture", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                orderId,
                amount,
                currency,
                customerName,
                customerEmail,
                phoneNumber
              })
            });

            const result = (await response.json().catch(() => null)) as PayPalCaptureResponse | null;
            if (!response.ok) {
              throw new Error(result?.message ?? t("captureError"));
            }

            const kakaoText = result?.kakao?.message ? ` / ${t("kakaoSuffix", {message: result.kakao.message})}` : "";
            onCompleted(`${t("completed")}${kakaoText}`);
          },
          onError: (error) => {
            const message = error instanceof Error ? error.message : t("paymentError");
            onError(message);
          },
          onCancel: () => {
            onError(t("cancelled"));
          }
        });

        buttonsRef.current = buttons;
        await buttons.render(containerRef.current);
      } catch (error) {
        const message = error instanceof Error ? error.message : t("renderError");
        setLocalMessage(message);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    renderButtons();

    return () => {
      isMounted = false;
      if (buttonsRef.current) {
        buttonsRef.current.close?.();
        buttonsRef.current = null;
      }
    };
  }, [amount, currency, customerName, customerEmail, phoneNumber, disabledMessage, onError, onCompleted, t]);

  return (
    <Stack spacing={1.5}>
      {isLoading ? (
        <Stack direction="row" spacing={1.5} sx={{alignItems: "center"}}>
          <CircularProgress size={20} />
          <Typography variant="body2" color="text.secondary">
            {t("buttonLoading")}
          </Typography>
        </Stack>
      ) : null}

      {localMessage ? <Alert severity="warning">{localMessage}</Alert> : null}

      <Box
        ref={containerRef}
        sx={{
          minHeight: 48,
          opacity: isLoading || localMessage ? 0.45 : 1,
          pointerEvents: localMessage ? "none" : "auto"
        }}
      />
    </Stack>
  );
}
