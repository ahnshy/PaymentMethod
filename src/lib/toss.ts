const TOSS_SCRIPT_ID = "tosspayments-v2-sdk";
const TOSS_SCRIPT_SRC = "https://js.tosspayments.com/v2/standard";
type TossPaymentsLoader = NonNullable<Window["TossPayments"]>;

export function createOrderId() {
  const randomPart = crypto.randomUUID().replaceAll("-", "").slice(0, 20);
  return `order_${Date.now()}_${randomPart}`;
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
}

export function loadTossPaymentsScript(): Promise<TossPaymentsLoader> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Toss Payments SDK must run in the browser."));
  }

  if (window.TossPayments) {
    return Promise.resolve(window.TossPayments);
  }

  const existingScript = document.getElementById(TOSS_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) {
    return new Promise<TossPaymentsLoader>((resolve, reject) => {
      existingScript.addEventListener("load", () => {
        if (window.TossPayments) resolve(window.TossPayments);
        else reject(new Error("Toss Payments SDK loaded but global initializer was not found."));
      });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Toss Payments SDK.")));
    });
  }

  return new Promise<TossPaymentsLoader>((resolve, reject) => {
    const script = document.createElement("script");
    script.id = TOSS_SCRIPT_ID;
    script.src = TOSS_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.TossPayments) resolve(window.TossPayments);
      else reject(new Error("Toss Payments SDK loaded but global initializer was not found."));
    };
    script.onerror = () => reject(new Error("Failed to load Toss Payments SDK."));
    document.head.appendChild(script);
  });
}
