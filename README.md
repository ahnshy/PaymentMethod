# Payment-Method

Payment via Credit and Debut Billing & PayPal Form Demo

- Next.js App Router based payment demo
- Material UI theme modes: light / dark / night / system
- Toss Payments hosted card billing flow
- PayPal JS SDK button flow with server-side capture
- KakaoTalk notification provider integration sample
- Relative import structure without `@/` alias

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Build

```bash
npm run build
```

## Environment

```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_...
TOSS_SECRET_KEY=test_sk_...

NEXT_PUBLIC_PAYPAL_CLIENT_ID=PayPal Sandbox Client ID
PAYPAL_CLIENT_SECRET=PayPal Sandbox Secret
PAYPAL_ENV=sandbox
PAYPAL_CURRENCY=KRW

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Payment Flow

### Card Billing

1. The user selects card billing.
2. Toss Payments opens the hosted secure payment window.
3. The app returns to `/payment/success` after approval.
4. The server confirms the payment through `/api/payments/confirm`.
5. A KakaoTalk notification provider API can be called after approval.

### PayPal

1. The user selects PayPal.
2. The PayPal JS SDK button is rendered.
3. The app creates a PayPal order through `/api/paypal/orders`.
4. The user approves the order in PayPal.
5. The server captures the payment through `/api/paypal/capture`.
6. A KakaoTalk notification provider API can be called after capture.

## Notes

- This project is a demo form and can run with mock notification behavior when Kakao provider variables are missing.
- The project is configured to use Webpack in Next.js 16 scripts.
