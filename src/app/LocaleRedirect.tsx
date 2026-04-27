"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";

const STORAGE_KEY = "sample-locale";

export function LocaleRedirect() {
  const router = useRouter();

  useEffect(() => {
    const savedLocale = window.localStorage.getItem(STORAGE_KEY);
    router.replace(savedLocale === "ko" ? "/ko" : "/en");
  }, [router]);

  return null;
}
