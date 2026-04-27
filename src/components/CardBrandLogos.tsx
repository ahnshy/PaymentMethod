"use client";

import {useTranslations} from "next-intl";

type BrandItem = {
  name: string;
  src: string;
};

const brands: BrandItem[] = [
  {name: "Visa", src: "/brands/visa.svg"},
  {name: "Mastercard", src: "/brands/mastercard.svg"},
  {name: "JBL", src: "/brands/jbl.svg"},
  {name: "UnionPay", src: "/brands/unionpay.svg"},
  {name: "PayPal", src: "/brands/paypal.svg"}
];

export function CardBrandLogos() {
  const t = useTranslations("checkout");

  return (
    <div className="brand-logo-list" aria-label={t("supportedBrands")}>
      <div className="brand-logo-row">
        {brands.map((brand) => (
          <span className="brand-logo-item" key={brand.name}>
            <img src={brand.src} alt={brand.name} />
          </span>
        ))}
      </div>
    </div>
  );
}
