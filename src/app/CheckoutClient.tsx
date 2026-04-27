"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {useFormatter, useLocale, useTranslations} from "next-intl";
import {useCallback, useMemo, useState} from "react";
import {LanguageSelector} from "../components/LanguageSelector";
import {ThemeSelector} from "../components/ThemeSelector";
import {CardBrandLogos} from "../components/CardBrandLogos";
import {createOrderId, getAppUrl, loadTossPaymentsScript} from "../lib/toss";
import {PayPalCheckoutButton} from "../components/PayPalCheckoutButton";
import {routing, type AppLocale} from "../i18n/routing";

type PaymentPreset = "general-card" | "toss-bank-card" | "kakao-bank-card";
type PaymentMethod = "card" | "paypal";

function normalizePhone(phone: string) {
  return phone.replaceAll("-", "").replaceAll(" ", "").trim();
}

function buildCardOption(_preset: PaymentPreset): NonNullable<TossPaymentRequest["card"]> {
  return {
    flowMode: "DEFAULT"
  };
}

function buildLocalizedPath(locale: AppLocale, path: string) {
  return `/${locale}${path}`;
}

function CardTypeLabel({
  iconSrc,
  emoji,
  text,
  imageWidth = 72,
  imageHeight = 28,
  iconSlotWidth
}: {
  iconSrc?: string;
  emoji?: string;
  text: string;
  imageWidth?: number;
  imageHeight?: number;
  iconSlotWidth?: number;
}) {
  const slotWidth = iconSlotWidth ?? imageWidth;

  return (
    <Box component="span" sx={{display: "inline-flex", alignItems: "center", justifyContent: "flex-start", gap: 1.5}}>
      <Box
        component="span"
        sx={{
          width: slotWidth,
          minWidth: slotWidth,
          height: imageHeight,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "flex-start",
          alignSelf: "center"
        }}
      >
        {iconSrc ? (
          <Box
            component="img"
            src={iconSrc}
            alt=""
            aria-hidden="true"
            sx={{
              width: imageWidth,
              height: imageHeight,
              objectFit: "contain",
              objectPosition: "left center",
              display: "block"
            }}
          />
        ) : (
          <Box component="span" aria-hidden="true" sx={{fontSize: 22, lineHeight: 1, display: "inline-flex", alignItems: "center"}}>
            {emoji}
          </Box>
        )}
      </Box>
      <Box component="span">{text}</Box>
    </Box>
  );
}

export function CheckoutClient() {
  const t = useTranslations("checkout");
  const validation = useTranslations("validation");
  const format = useFormatter();
  const locale = useLocale() as AppLocale;
  const [amount, setAmount] = useState(15000);
  const [customerName, setCustomerName] = useState("HoSeong,Ahn");
  const [customerEmail, setCustomerEmail] = useState("ahnshy@gmail.com");
  const [phoneNumber, setPhoneNumber] = useState("01012345678");
  const [preset, setPreset] = useState<PaymentPreset>("kakao-bank-card");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [payPalMessage, setPayPalMessage] = useState("");

  const formattedAmount = useMemo(() => format.number(amount), [amount, format]);
  const cleanPhoneNumber = normalizePhone(phoneNumber);
  const paymentPresetLabels: Record<PaymentPreset, string> = {
    "general-card": t("generalCard"),
    "toss-bank-card": t("tossBank"),
    "kakao-bank-card": t("kakaoBank")
  };
  const selectedCardLabel = paymentMethod === "paypal" ? "PayPal" : paymentPresetLabels[preset];

  const handlePayPalCompleted = useCallback((message: string) => {
    setErrorMessage("");
    setPayPalMessage(message);
  }, []);

  const validateBasicInput = () => {
    if (!Number.isInteger(amount) || amount < 1000) {
      return validation("amountMin");
    }

    if (!/^01\d{8,9}$/.test(cleanPhoneNumber)) {
      return validation("phoneInvalid");
    }

    return "";
  };

  const handlePayment = async () => {
    setErrorMessage("");
    setPayPalMessage("");

    const validationMessage = validateBasicInput();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;
    if (!clientKey || clientKey.includes("?")) {
      setErrorMessage(validation("missingTossKey"));
      return;
    }

    setIsSubmitting(true);
    try {
      const TossPayments = await loadTossPaymentsScript();
      const tossPayments = TossPayments(clientKey);
      const payment = tossPayments.payment({
        customerKey: crypto.randomUUID()
      });

      const orderId = createOrderId();
      const orderName = t("orderName", {amount: formattedAmount});
      const appUrl = getAppUrl();

      window.localStorage.setItem(
        `payment-order-${orderId}`,
        JSON.stringify({
          amount,
          orderName,
          customerName,
          customerEmail,
          phoneNumber: cleanPhoneNumber,
          selectedCardLabel
        })
      );

      await payment.requestPayment({
        method: "CARD",
        amount: {
          currency: "KRW",
          value: amount
        },
        orderId,
        orderName,
        successUrl: `${appUrl}${buildLocalizedPath(locale, "/payment/success")}`,
        failUrl: `${appUrl}${buildLocalizedPath(locale, "/payment/fail")}`,
        customerName,
        customerEmail,
        customerMobilePhone: cleanPhoneNumber,
        card: buildCardOption(preset)
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : validation("paymentWindowError");
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        py: {xs: 2.5, md: 4},
        background:
          "radial-gradient(circle at top left, rgba(25, 118, 210, 0.16), transparent 30%), radial-gradient(circle at bottom right, rgba(255, 165, 0, 0.14), transparent 28%)"
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3}>
          <Card elevation={0} sx={{border: 1, borderColor: "divider"}}>
            <CardContent sx={{p: {xs: 3, md: 4}}}>
              <Stack spacing={3}>
                <div className="top-toolbar">
                  <div className="top-logo-area">
                    <CardBrandLogos />
                  </div>
                  <div className="top-controls-area">
                    <LanguageSelector />
                    <ThemeSelector />
                  </div>
                </div>

                <Box>
                  <Typography variant="h4" component="h1" gutterBottom sx={{fontWeight: 800}}>
                    {t("headline")}
                  </Typography>
                  <Typography color="text.secondary">{t("subheadline")}</Typography>
                </Box>

                <Alert severity="info">{t("info")}</Alert>

                <Divider />

                <Stack spacing={2.5}>
                  <TextField
                    label={t("amountLabel")}
                    type="number"
                    value={amount}
                    onChange={(event) => setAmount(Number(event.target.value))}
                    slotProps={{htmlInput: {min: 1000, step: 1000}}}
                    helperText={t("amountHelper", {amount: formattedAmount})}
                    fullWidth
                  />

                  <FormControl>
                    <FormLabel>{t("billingMethod")}</FormLabel>
                    <RadioGroup
                      row
                      value={paymentMethod}
                      onChange={(event) => {
                        setPaymentMethod(event.target.value as PaymentMethod);
                        setErrorMessage("");
                        setPayPalMessage("");
                      }}
                      sx={{mt: 1}}
                    >
                      <FormControlLabel value="card" control={<Radio />} label={t("cardMethod")} />
                      <FormControlLabel value="paypal" control={<Radio />} label={t("paypalMethod")} />
                    </RadioGroup>
                  </FormControl>

                  {paymentMethod === "card" ? (
                    <FormControl>
                      <FormLabel>{t("cardType")}</FormLabel>
                      <RadioGroup
                        value={preset}
                        onChange={(event) => setPreset(event.target.value as PaymentPreset)}
                        sx={{mt: 1}}
                      >
                        <FormControlLabel
                          value="kakao-bank-card"
                          control={<Radio />}
                          label={
                            <CardTypeLabel
                              iconSrc="/brands/kakaobank.svg"
                              text={t("kakaoBank")}
                              imageWidth={78}
                              imageHeight={30}
                              iconSlotWidth={96}
                            />
                          }
                          sx={{
                            m: 0,
                            alignItems: "center",
                            "& .MuiFormControlLabel-label": {
                              width: "100%"
                            }
                          }}
                        />
                        <FormControlLabel
                          value="toss-bank-card"
                          control={<Radio />}
                          label={
                            <CardTypeLabel
                              iconSrc="/brands/tossbank.svg"
                              text={t("tossBank")}
                              imageWidth={96}
                              imageHeight={34}
                              iconSlotWidth={96}
                            />
                          }
                          sx={{
                            m: 0,
                            alignItems: "center",
                            "& .MuiFormControlLabel-label": {
                              width: "100%"
                            }
                          }}
                        />
                        <FormControlLabel
                          value="general-card"
                          control={<Radio />}
                          label={<CardTypeLabel emoji="💳" text={t("generalCard")} imageHeight={34} iconSlotWidth={96} />}
                          sx={{
                            m: 0,
                            alignItems: "center",
                            "& .MuiFormControlLabel-label": {
                              width: "100%"
                            }
                          }}
                        />
                      </RadioGroup>
                    </FormControl>
                  ) : null}

                  <Box sx={{display: "grid", gridTemplateColumns: {xs: "1fr", sm: "1fr 1fr"}, gap: 2}}>
                    <TextField
                      label={t("customerName")}
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label={t("customerEmail")}
                      value={customerEmail}
                      onChange={(event) => setCustomerEmail(event.target.value)}
                      fullWidth
                    />
                  </Box>

                  <TextField
                    label={t("phoneNumber")}
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="01012345678"
                    helperText={t("phoneHelper")}
                    fullWidth
                  />

                  {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
                  {payPalMessage ? <Alert severity="success">{payPalMessage}</Alert> : null}

                  {paymentMethod === "card" ? (
                    <Button size="large" variant="contained" onClick={handlePayment} disabled={isSubmitting} sx={{py: 1.5}}>
                      {isSubmitting ? t("submitting") : t("payNow", {amount: formattedAmount})}
                    </Button>
                  ) : (
                    <PayPalCheckoutButton
                      amount={amount}
                      currency="KRW"
                      customerName={customerName}
                      customerEmail={customerEmail}
                      phoneNumber={cleanPhoneNumber}
                      disabledMessage={validateBasicInput()}
                      onError={setErrorMessage}
                      onCompleted={handlePayPalCompleted}
                    />
                  )}

                  {paymentMethod === "paypal" ? (
                    <Typography variant="caption" color="text.secondary">
                      {t("paypalSandboxHint")}
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
