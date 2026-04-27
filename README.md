# Payment-Method

[한국어](#payment-method) | [English](#english)

`Payment-Method`는 **Next.js (App Router)**, **Material UI**, **next-intl** 기반으로 만든 카드 결제 / PayPal 결제 데모 애플리케이션입니다.  
사용자는 **토스페이먼츠 카드 결제**, **PayPal 결제**, **결제 완료 후 카카오 알림톡 연동 예시**, **영문/한글 UI 전환**, **테마 전환**을 하나의 화면에서 확인할 수 있습니다.

---

## 주요 기능

- **결제 수단 데모**
  - `토스페이먼츠 카드 결제`
  - `PayPal Sandbox 결제`
- **다국어 UI**
  - `영문 / 한글` 전환
  - 기본 언어 `영문`
  - 마지막 선택 언어 `localStorage` 저장
- **테마 설정**
  - `Light`
  - `Dark`
  - `Night`
  - `System`
  - 기본 테마 `Light`
- **결제 후처리**
  - 토스 결제 승인 API 확인
  - PayPal 주문 생성 / 캡처
  - 결제 완료 후 카카오 알림톡 Provider 호출 예시
  - 카카오 환경변수 미설정 시 mock 전송 처리
- **UX**
  - 브랜드 카드 아이콘 선택 UI
  - 다국어 라우팅(`/en`, `/ko`)
  - 결제 성공 / 실패 결과 페이지
  - App Router favicon 적용

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![App Router](https://img.shields.io/badge/App%20Router-enabled-blue?style=flat-square)
![Material UI](https://img.shields.io/badge/MUI-9-007FFF?logo=mui&logoColor=white)
![next-intl](https://img.shields.io/badge/next--intl-4.4.0-0F172A?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![PayPal](https://img.shields.io/badge/PayPal-SDK-003087?logo=paypal&logoColor=white)
![Toss Payments](https://img.shields.io/badge/Toss%20Payments-v2-0064FF?style=flat-square)

- **Next.js** App Router
- **React 19**
- **TypeScript**
- **Material UI** + **Emotion**
- **next-intl**
- **Toss Payments JavaScript SDK**
- **PayPal Orders / Capture API**

---

## Environment

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 설정합니다.

```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_your_client_key
TOSS_SECRET_KEY=test_sk_your_secret_key

NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_ENV=sandbox
PAYPAL_CURRENCY=KRW

NEXT_PUBLIC_APP_URL=http://localhost:3000

KAKAO_ALIMTALK_API_URL=
KAKAO_ALIMTALK_API_TOKEN=
KAKAO_ALIMTALK_SENDER_KEY=
KAKAO_ALIMTALK_TEMPLATE_CODE=
```

> `NEXT_PUBLIC_APP_URL`은 토스 결제 성공 / 실패 리다이렉트 URL 생성에 사용됩니다.  
> 로컬에서는 `http://localhost:3000`, 배포 환경에서는 실제 HTTPS 도메인을 사용합니다.  
> 카카오 알림톡 관련 환경변수가 없으면 결제 후 알림 전송은 mock 로그 처리로 동작합니다.

---

## Getting Started

```bash
npm install
copy .env.example .env.local
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 `/en` 또는 저장된 언어 경로로 이동합니다.

프로덕션 빌드:

```bash
npm run build
npm start
```

타입 검사:

```bash
npm run typecheck
```

---

## Application Flow

이 프로젝트는 별도 DB 없이 **클라이언트 입력 + 외부 결제 API + 서버 검증 API** 흐름으로 동작합니다.

- **카드 결제**
  - 사용자가 카드 타입과 금액을 선택
  - 토스 SDK 로딩
  - 토스 결제창 오픈
  - `/[locale]/payment/success` 또는 `/[locale]/payment/fail`로 리다이렉트
  - 서버에서 `/api/payments/confirm`으로 최종 승인 검증
  - 필요 시 카카오 알림톡 Provider 호출
- **PayPal 결제**
  - 사용자가 PayPal 선택
  - PayPal JS SDK 버튼 렌더링
  - `/api/paypal/orders`에서 주문 생성
  - PayPal 승인 후 `/api/paypal/capture`에서 캡처
  - 필요 시 카카오 알림톡 Provider 호출
- **다국어 라우팅**
  - `/` 진입 시 저장된 언어를 읽어 `/en` 또는 `/ko`로 이동
  - `next-intl` 미들웨어와 App Router locale segment 사용

---

## Project Structure

```text
messages/
  en.json
  ko.json
public/
  brands/
src/
  app/
    icon.png
    layout.tsx
    page.tsx
    LocaleRedirect.tsx
    CheckoutClient.tsx
    providers.tsx
    globals.css
    api/
      payments/
        confirm/route.ts
      paypal/
        orders/route.ts
        capture/route.ts
    [locale]/
      layout.tsx
      page.tsx
      payment/
        fail/page.tsx
        success/
          page.tsx
          SuccessClient.tsx
  components/
    CardBrandLogos.tsx
    LanguageSelector.tsx
    PayPalCheckoutButton.tsx
    ThemeSelector.tsx
  i18n/
    navigation.ts
    request.ts
    routing.ts
  lib/
    kakao.ts
    paypal.ts
    toss.ts
next.config.ts
proxy.ts
README.md
README_cf.md
```

---

## RESTful API Specification

### Toss Payments

- `POST /api/payments/confirm`
  - 토스 결제 승인 결과를 서버에서 최종 검증합니다.
  - 요청 예시:
  ```json
  {
    "paymentKey": "pay_...",
    "orderId": "order_...",
    "amount": 15000,
    "customerName": "Ahn",
    "phoneNumber": "01012345678",
    "selectedCardLabel": "KakaoBank"
  }
  ```
  - 응답 예시:
  ```json
  {
    "payment": {
      "orderId": "order_...",
      "orderName": "Sample payment 15,000 KRW",
      "method": "CARD",
      "status": "DONE",
      "totalAmount": 15000,
      "approvedAt": "2026-04-27T09:00:00+09:00"
    },
    "kakao": {
      "mode": "mock",
      "ok": true,
      "message": "Mock delivery processed."
    }
  }
  ```

### PayPal

- `POST /api/paypal/orders`
  - PayPal 주문을 생성합니다.
  - 요청 예시:
  ```json
  {
    "amount": 15000,
    "currency": "KRW",
    "customerName": "Ahn",
    "customerEmail": "ahnshy@gmail.com",
    "phoneNumber": "01012345678"
  }
  ```
  - 응답 예시:
  ```json
  {
    "id": "PAYPAL_ORDER_ID",
    "status": "CREATED",
    "merchantOrderId": "PAYPAL-...",
    "orderName": "PayPal sample payment 15,000 KRW"
  }
  ```

- `POST /api/paypal/capture`
  - 승인된 PayPal 주문을 캡처합니다.
  - 요청 예시:
  ```json
  {
    "orderId": "PAYPAL_ORDER_ID",
    "amount": 15000,
    "currency": "KRW",
    "customerName": "Ahn",
    "customerEmail": "ahnshy@gmail.com",
    "phoneNumber": "01012345678"
  }
  ```
  - 응답 예시:
  ```json
  {
    "payment": {
      "orderId": "PAYPAL_ORDER_ID",
      "orderName": "PayPal sample payment",
      "method": "PayPal",
      "status": "COMPLETED",
      "totalAmount": 15000,
      "approvedAt": "2026-04-27T09:10:00Z"
    },
    "kakao": {
      "mode": "mock",
      "ok": true,
      "message": "Mock delivery processed."
    }
  }
  ```

### Common Error Response

```json
{
  "message": "Invalid request."
}
```

주요 상태 코드:

- `200 OK`
- `400 Bad Request`
- `500 Internal Server Error`

---

## Core Logic

### Data flow

- **로케일 진입**
  - `/`에서 `LocaleRedirect`가 저장된 언어를 읽음
  - `/en` 또는 `/ko`로 리다이렉트
- **카드 결제**
  - `CheckoutClient`에서 입력 검증
  - `loadTossPaymentsScript()`로 SDK 로딩
  - 토스 결제창 호출
  - 성공 시 `SuccessClient`에서 `/api/payments/confirm` 호출
- **PayPal 결제**
  - `PayPalCheckoutButton`이 SDK 렌더링
  - `/api/paypal/orders` 주문 생성
  - 승인 후 `/api/paypal/capture` 캡처
- **알림 전송**
  - `sendKakaoPaymentMessage()`가 Provider API 호출
  - 필수 환경변수가 없으면 mock 모드로 성공 응답 반환

### UI state

- `ThemeSelector`
  - 라이트 / 다크 / 나이트 / 시스템 전환
  - 마지막 선택값 `localStorage` 저장
- `LanguageSelector`
  - 영어 / 한국어 전환
  - 마지막 선택값 `localStorage` 저장
  - locale cookie 및 URL 경로 동기화

### Payment composition

- `CARD`
  - 카드 브랜드 선택 UI
  - 토스 hosted payment window 사용
- `PAYPAL`
  - PayPal button 기반 승인 / 캡처 흐름

---

## i18n Routing Setup

이 프로젝트는 `next-intl`을 사용하며 아래 규칙으로 동작합니다.

1. 지원 언어는 `en`, `ko`
2. 기본 언어는 `en`
3. URL prefix는 항상 포함
   - `/en`
   - `/ko`
4. `proxy.ts`에서 locale 미들웨어 처리
5. 번역 메시지는 `messages/en.json`, `messages/ko.json`에 저장

---

## Troubleshooting

- **루트 `/`에서 404가 발생함**
  - `src/app/page.tsx`와 `src/app/LocaleRedirect.tsx`가 존재하는지 확인합니다.
- **토스 결제 승인 실패**
  - `NEXT_PUBLIC_TOSS_CLIENT_KEY`, `TOSS_SECRET_KEY`가 올바른지 확인합니다.
- **PayPal 버튼이 보이지 않음**
  - `NEXT_PUBLIC_PAYPAL_CLIENT_ID`가 설정되어 있는지 확인합니다.
- **PayPal 캡처 실패**
  - `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `PAYPAL_CURRENCY` 값을 확인합니다.
- **카카오 알림이 실제 발송되지 않음**
  - `KAKAO_ALIMTALK_*` 환경변수가 비어 있으면 mock 전송이 정상 동작입니다.
- **언어 전환 후 원하는 언어가 유지되지 않음**
  - 브라우저 `localStorage`의 `sample-locale` 값과 쿠키를 확인합니다.

---

## License

Internal / demo use. Replace with your own license if needed.

---

## English

[Back to Korean](#payment-method)

`Payment-Method` is a **card and PayPal payment demo** built with **Next.js (App Router)**, **Material UI**, and **next-intl**.  
It demonstrates **Toss Payments card checkout**, **PayPal checkout**, **post-payment Kakao AlimTalk integration**, **English/Korean UI switching**, and **theme selection** in a single app.

---

## Features

- **Payment method demos**
  - `Toss Payments card checkout`
  - `PayPal Sandbox checkout`
- **Multilingual UI**
  - `English / Korean` switching
  - default locale `English`
  - last selected locale persisted in `localStorage`
- **Theme settings**
  - `Light`
  - `Dark`
  - `Night`
  - `System`
  - default theme `Light`
- **Post-payment processing**
  - server-side Toss payment confirmation
  - PayPal order creation / capture
  - Kakao AlimTalk provider integration example
  - mock notification behavior when Kakao variables are missing
- **UX**
  - branded card option selector
  - locale routing with `/en` and `/ko`
  - payment success / failure result pages
  - App Router favicon support

---

## Tech Stack

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![App Router](https://img.shields.io/badge/App%20Router-enabled-blue?style=flat-square)
![Material UI](https://img.shields.io/badge/MUI-9-007FFF?logo=mui&logoColor=white)
![next-intl](https://img.shields.io/badge/next--intl-4.4.0-0F172A?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![PayPal](https://img.shields.io/badge/PayPal-SDK-003087?logo=paypal&logoColor=white)
![Toss Payments](https://img.shields.io/badge/Toss%20Payments-v2-0064FF?style=flat-square)

- **Next.js** App Router
- **React 19**
- **TypeScript**
- **Material UI** + **Emotion**
- **next-intl**
- **Toss Payments JavaScript SDK**
- **PayPal Orders / Capture API**

---

## Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_TOSS_CLIENT_KEY=test_ck_your_client_key
TOSS_SECRET_KEY=test_sk_your_secret_key

NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_ENV=sandbox
PAYPAL_CURRENCY=KRW

NEXT_PUBLIC_APP_URL=http://localhost:3000

KAKAO_ALIMTALK_API_URL=
KAKAO_ALIMTALK_API_TOKEN=
KAKAO_ALIMTALK_SENDER_KEY=
KAKAO_ALIMTALK_TEMPLATE_CODE=
```

> `NEXT_PUBLIC_APP_URL` is used to build Toss success / failure redirect URLs.  
> Use `http://localhost:3000` locally and your real HTTPS domain in production.  
> If the Kakao AlimTalk variables are omitted, the app falls back to mock notification delivery.

---

## Getting Started

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. The app redirects to `/en` or the last saved locale route.

Production:

```bash
npm run build
npm start
```

Type check:

```bash
npm run typecheck
```

---

## Application Flow

This project uses a **client form + external payment API + server verification API** flow without a database.

- **Card checkout**
  - user selects a card type and amount
  - Toss SDK is loaded
  - hosted Toss checkout window opens
  - user is redirected to `/[locale]/payment/success` or `/[locale]/payment/fail`
  - server verifies the payment through `/api/payments/confirm`
  - Kakao notification provider can be triggered afterward
- **PayPal checkout**
  - user selects PayPal
  - PayPal JS SDK button renders
  - `/api/paypal/orders` creates the order
  - `/api/paypal/capture` captures the approved order
  - Kakao notification provider can be triggered afterward
- **Locale routing**
  - `/` reads the saved locale and redirects to `/en` or `/ko`
  - implemented with `next-intl` middleware and locale segments

---

## Project Structure

```text
messages/
  en.json
  ko.json
public/
  brands/
src/
  app/
    icon.png
    layout.tsx
    page.tsx
    LocaleRedirect.tsx
    CheckoutClient.tsx
    providers.tsx
    globals.css
    api/
      payments/
        confirm/route.ts
      paypal/
        orders/route.ts
        capture/route.ts
    [locale]/
      layout.tsx
      page.tsx
      payment/
        fail/page.tsx
        success/
          page.tsx
          SuccessClient.tsx
  components/
    CardBrandLogos.tsx
    LanguageSelector.tsx
    PayPalCheckoutButton.tsx
    ThemeSelector.tsx
  i18n/
    navigation.ts
    request.ts
    routing.ts
  lib/
    kakao.ts
    paypal.ts
    toss.ts
next.config.ts
proxy.ts
README.md
README_cf.md
```

---

## RESTful API Specification

### Toss Payments

- `POST /api/payments/confirm`
  - Verifies Toss payment approval on the server.
  - Example request:
  ```json
  {
    "paymentKey": "pay_...",
    "orderId": "order_...",
    "amount": 15000,
    "customerName": "Ahn",
    "phoneNumber": "01012345678",
    "selectedCardLabel": "KakaoBank"
  }
  ```
  - Example response:
  ```json
  {
    "payment": {
      "orderId": "order_...",
      "orderName": "Sample payment 15,000 KRW",
      "method": "CARD",
      "status": "DONE",
      "totalAmount": 15000,
      "approvedAt": "2026-04-27T09:00:00+09:00"
    },
    "kakao": {
      "mode": "mock",
      "ok": true,
      "message": "Mock delivery processed."
    }
  }
  ```

### PayPal

- `POST /api/paypal/orders`
  - Creates a PayPal order.
  - Example request:
  ```json
  {
    "amount": 15000,
    "currency": "KRW",
    "customerName": "Ahn",
    "customerEmail": "ahnshy@gmail.com",
    "phoneNumber": "01012345678"
  }
  ```
  - Example response:
  ```json
  {
    "id": "PAYPAL_ORDER_ID",
    "status": "CREATED",
    "merchantOrderId": "PAYPAL-...",
    "orderName": "PayPal sample payment 15,000 KRW"
  }
  ```

- `POST /api/paypal/capture`
  - Captures an approved PayPal order.
  - Example request:
  ```json
  {
    "orderId": "PAYPAL_ORDER_ID",
    "amount": 15000,
    "currency": "KRW",
    "customerName": "Ahn",
    "customerEmail": "ahnshy@gmail.com",
    "phoneNumber": "01012345678"
  }
  ```
  - Example response:
  ```json
  {
    "payment": {
      "orderId": "PAYPAL_ORDER_ID",
      "orderName": "PayPal sample payment",
      "method": "PayPal",
      "status": "COMPLETED",
      "totalAmount": 15000,
      "approvedAt": "2026-04-27T09:10:00Z"
    },
    "kakao": {
      "mode": "mock",
      "ok": true,
      "message": "Mock delivery processed."
    }
  }
  ```

### Common Error Response

```json
{
  "message": "Invalid request."
}
```

Common status codes:

- `200 OK`
- `400 Bad Request`
- `500 Internal Server Error`

---

## Core Logic

### Data flow

- **Locale entry**
  - `/` reads the stored locale through `LocaleRedirect`
  - redirects to `/en` or `/ko`
- **Card payment**
  - `CheckoutClient` validates form input
  - `loadTossPaymentsScript()` loads the SDK
  - hosted Toss checkout opens
  - `SuccessClient` calls `/api/payments/confirm`
- **PayPal payment**
  - `PayPalCheckoutButton` renders the SDK button
  - `/api/paypal/orders` creates the order
  - `/api/paypal/capture` captures it after approval
- **Notification delivery**
  - `sendKakaoPaymentMessage()` calls the provider API
  - if required env vars are missing, it returns a successful mock response

### UI state

- `ThemeSelector`
  - switches between light / dark / night / system
  - persists the last choice in `localStorage`
- `LanguageSelector`
  - switches between English / Korean
  - persists the last choice in `localStorage`
  - syncs locale cookie and URL path

### Payment composition

- `CARD`
  - brand selection UI
  - Toss hosted payment window
- `PAYPAL`
  - PayPal button based approval / capture flow

---

## i18n Routing Setup

This project uses `next-intl` with the following rules:

1. Supported locales are `en` and `ko`
2. Default locale is `en`
3. Locale prefixes are always included
   - `/en`
   - `/ko`
4. `proxy.ts` handles locale middleware
5. Translations live in `messages/en.json` and `messages/ko.json`

---

## Troubleshooting

- **404 at the root `/`**
  - Ensure `src/app/page.tsx` and `src/app/LocaleRedirect.tsx` exist.
- **Toss payment confirmation fails**
  - Verify `NEXT_PUBLIC_TOSS_CLIENT_KEY` and `TOSS_SECRET_KEY`.
- **PayPal button does not render**
  - Verify `NEXT_PUBLIC_PAYPAL_CLIENT_ID`.
- **PayPal capture fails**
  - Check `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, and `PAYPAL_CURRENCY`.
- **Kakao notifications are not actually sent**
  - Empty `KAKAO_ALIMTALK_*` variables intentionally trigger mock delivery.
- **Selected locale does not persist**
  - Check the browser `localStorage` value for `sample-locale` and the locale cookie.

---

## License

Internal / demo use. Replace with your own license if needed.
