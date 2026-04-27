"use client";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, {type SelectChangeEvent} from "@mui/material/Select";
import {alpha, useTheme} from "@mui/material/styles";
import {useTranslations} from "next-intl";
import {useThemeMode} from "../app/providers";

export function ThemeSelector() {
  const {choice, setChoice} = useThemeMode();
  const t = useTranslations("theme");
  const theme = useTheme();
  const primary = theme.palette.primary.main;

  const handleChange = (event: SelectChangeEvent) => {
    const value = event.target.value;
    if (value === "light" || value === "dark" || value === "night" || value === "system") {
      setChoice(value);
    }
  };

  return (
    <FormControl
      size="small"
      sx={{
        width: 184,
        minWidth: 184,
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
      <InputLabel id="theme-select-label">{t("label")}</InputLabel>
      <Select labelId="theme-select-label" label={t("label")} value={choice} onChange={handleChange}>
        <MenuItem value="light">{t("light")}</MenuItem>
        <MenuItem value="dark">{t("dark")}</MenuItem>
        <MenuItem value="night">{t("night")}</MenuItem>
        <MenuItem value="system">{t("system")}</MenuItem>
      </Select>
    </FormControl>
  );
}
