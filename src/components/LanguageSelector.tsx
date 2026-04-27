"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, {type SelectChangeEvent} from "@mui/material/Select";
import {alpha, useTheme} from "@mui/material/styles";
import {useLocale, useTranslations} from "next-intl";
import {useEffect} from "react";
import {usePathname, useRouter} from "../i18n/navigation";
import type {AppLocale} from "../i18n/routing";

const STORAGE_KEY = "sample-locale";

export function LanguageSelector() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("language");
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const primary = theme.palette.primary.main;

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale);
  }, [locale]);

  const handleChange = (event: SelectChangeEvent) => {
    const nextLocale = event.target.value as AppLocale;
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
    router.replace(pathname, {locale: nextLocale});
  };

  return (
    <FormControl
      size="small"
      sx={{
        width: 152,
        minWidth: 152,
        "& .MuiInputLabel-root": {
          color: "text.secondary"
        },
        "& .MuiInputLabel-root.Mui-focused": {
          color: primary
        },
        "& .MuiOutlinedInput-root": {
          color: "text.primary",
          borderRadius: 2.5,
          backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.6 : 0.92),
          "& fieldset": {
            borderColor: alpha(primary, 0.28)
          },
          "&:hover fieldset": {
            borderColor: alpha(primary, 0.48)
          },
          "&.Mui-focused fieldset": {
            borderColor: primary,
            borderWidth: 1.5
          }
        },
        "& .MuiSelect-icon": {
          color: "text.secondary"
        }
      }}
    >
      <InputLabel id="language-select-label">{t("label")}</InputLabel>
      <Select labelId="language-select-label" label={t("label")} value={locale} onChange={handleChange}>
        <MenuItem value="en">{t("english")}</MenuItem>
        <MenuItem value="ko">{t("korean")}</MenuItem>
      </Select>
    </FormControl>
  );
}
