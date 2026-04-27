"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {useFormatter, useTranslations} from "next-intl";
import {useSearchParams} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {Link} from "../../../../i18n/navigation";

type LocalOrder = {
  amount: number;
  orderName: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  selectedCardLabel: string;
};

type ConfirmResult = {
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

function readLocalOrder(orderId: string) {
  const raw = window.localStorage.getItem(`payment-order-${orderId}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as LocalOrder;
  } catch {
    return null;
  }
}

export function SuccessClient() {
  const t = useTranslations("success");
  const common = useTranslations("common");
  const format = useFormatter();
  const searchParams = useSearchParams();
  const calledRef = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<ConfirmResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const paymentKey = searchParams.get("paymentKey");
    const orderId = searchParams.get("orderId");
    const amountText = searchParams.get("amount");
    const amount = amountText ? Number(amountText) : NaN;

    async function confirmPayment() {
      if (!paymentKey || !orderId || !Number.isInteger(amount)) {
        setErrorMessage(t("missingParams"));
        setIsLoading(false);
        return;
      }

      const order = readLocalOrder(orderId);
      if (!order) {
        setErrorMessage(t("missingLocalOrder"));
        setIsLoading(false);
        return;
      }

      if (order.amount !== amount) {
        setErrorMessage(t("amountMismatch"));
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/payments/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          paymentKey,
          orderId,
          amount,
          customerName: order.customerName,
          phoneNumber: order.phoneNumber,
          selectedCardLabel: order.selectedCardLabel
        })
      });

      const data = (await response.json().catch(() => null)) as ConfirmResult | null;

      if (!response.ok) {
        setErrorMessage(data?.message ?? t("apiError"));
      } else {
        setResult(data);
        window.localStorage.removeItem(`payment-order-${orderId}`);
      }
      setIsLoading(false);
    }

    confirmPayment().catch((error) => {
      setErrorMessage(error instanceof Error ? error.message : t("unknownError"));
      setIsLoading(false);
    });
  }, [searchParams, t]);

  return (
    <Box component="main" sx={{minHeight: "100vh", py: {xs: 4, md: 8}}}>
      <Container maxWidth="sm">
        <Card elevation={0} sx={{border: 1, borderColor: "divider"}}>
          <CardContent sx={{p: {xs: 3, md: 4}}}>
            <Stack spacing={3} sx={{alignItems: "stretch"}}>
              <Typography variant="h4" component="h1" sx={{fontWeight: 800}}>
                {t("title")}
              </Typography>

              {isLoading ? (
                <Stack spacing={2} sx={{py: 5, alignItems: "center"}}>
                  <CircularProgress />
                  <Typography color="text.secondary">{t("loading")}</Typography>
                </Stack>
              ) : null}

              {!isLoading && errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

              {!isLoading && result?.payment ? (
                <Stack spacing={1.2}>
                  <Alert severity="success">{t("confirmed")}</Alert>
                  <Typography>{t("orderId", {value: result.payment.orderId ?? "-"})}</Typography>
                  <Typography>{t("orderName", {value: result.payment.orderName ?? "-"})}</Typography>
                  <Typography>{t("method", {value: result.payment.method ?? "-"})}</Typography>
                  <Typography>
                    {t("amount", {
                      value: format.number(result.payment.totalAmount ?? 0)
                    })}
                  </Typography>
                  <Typography>{t("approvedAt", {value: result.payment.approvedAt ?? "-"})}</Typography>
                  {result.kakao ? (
                    <Alert severity={result.kakao.ok ? "info" : "warning"}>
                      {t("kakaoResult", {message: result.kakao.message, mode: result.kakao.mode})}
                    </Alert>
                  ) : null}
                </Stack>
              ) : null}

              <Button component={Link} href="/" variant="contained">
                {common("home")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
