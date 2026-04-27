import type {Metadata} from "next";
import {hasLocale, NextIntlClientProvider} from "next-intl";
import {getMessages, getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import type {ReactNode} from "react";
import {AppProviders} from "../providers";
import {routing} from "../../i18n/routing";

type LocaleLayoutProps = Readonly<{
  children: ReactNode;
  params: Promise<{locale: string}>;
}>;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: Omit<LocaleLayoutProps, "children">): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: "common"});

  return {
    title: t("appTitle"),
    description: t("appDescription")
  };
}

export default async function LocaleLayout({children, params}: LocaleLayoutProps) {
  const {locale} = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AppProviders>{children}</AppProviders>
    </NextIntlClientProvider>
  );
}
