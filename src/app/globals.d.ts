declare global {
  type TossPaymentFlowMode = "DEFAULT" | "DIRECT";
  type TossPaymentMethod = "CARD";

  type TossPaymentRequest = {
    method: TossPaymentMethod;
    amount: {
      currency: "KRW";
      value: number;
    };
    orderId: string;
    orderName: string;
    successUrl: string;
    failUrl: string;
    customerName?: string;
    customerEmail?: string;
    customerMobilePhone?: string;
    card?: {
      flowMode?: TossPaymentFlowMode;
      cardCompany?: string;
      easyPay?: string;
    };
  };

  type TossPayment = {
    requestPayment: (request: TossPaymentRequest) => Promise<void>;
  };

  type TossPaymentsInstance = {
    payment: (params: { customerKey: string }) => TossPayment;
  };

  type PayPalButtonsInstance = {
    render: (container: HTMLElement | string) => Promise<void>;
    close?: () => void;
  };

  type PayPalButtonsOptions = {
    style?: {
      layout?: "vertical" | "horizontal";
      shape?: "rect" | "pill";
      label?: "paypal" | "checkout" | "buynow" | "pay" | "installment";
    };
    createOrder: () => Promise<string> | string;
    onApprove: (data: { orderID?: string }) => Promise<void> | void;
    onError?: (error: unknown) => void;
    onCancel?: () => void;
  };

  type PayPalNamespace = {
    Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance;
  };

  interface Window {
    TossPayments?: (clientKey: string) => TossPaymentsInstance;
    paypal?: PayPalNamespace;
  }
}

export {};
