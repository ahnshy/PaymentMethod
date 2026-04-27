"use client";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ThemeChoice = "light" | "dark" | "night" | "system";
type EffectiveMode = "light" | "dark";

type ThemeModeContextValue = {
  choice: ThemeChoice;
  setChoice: (choice: ThemeChoice) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);
const STORAGE_KEY = "sample-theme-choice";

export function useThemeMode() {
  const value = useContext(ThemeModeContext);
  if (!value) {
    throw new Error("useThemeMode must be used inside AppProviders");
  }
  return value;
}

function resolveEffectiveMode(choice: ThemeChoice, prefersDark: boolean): EffectiveMode {
  if (choice === "system") return prefersDark ? "dark" : "light";
  if (choice === "night") return "dark";
  return choice;
}

type AppProvidersProps = Readonly<{
  children: ReactNode;
}>;

export function AppProviders({ children }: AppProvidersProps) {
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)", { noSsr: true });
  const [choice, setChoiceState] = useState<ThemeChoice>("light");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeChoice | null;
    if (stored === "light" || stored === "dark" || stored === "night" || stored === "system") {
      setChoiceState(stored);
    }
  }, []);

  const setChoice = (nextChoice: ThemeChoice) => {
    setChoiceState(nextChoice);
    window.localStorage.setItem(STORAGE_KEY, nextChoice);
  };

  const effectiveMode = resolveEffectiveMode(choice, prefersDark);

  const theme = useMemo(() => {
    const isNight = choice === "night";

    const background = isNight
      ? { default: "#060914", paper: "#111827" }
      : effectiveMode === "dark"
        ? { default: "#121212", paper: "#1E1E1E" }
        : { default: "#F7F9FC", paper: "#FFFFFF" };

    return createTheme({
      palette: {
        mode: effectiveMode,
        primary: {
          main: isNight ? "#FFA500" : "#1976D2",
          dark: isNight ? "#E59400" : "#1565C0"
        },
        background
      },
      shape: {
        borderRadius: 16
      },
      typography: {
        fontFamily: [
          "Inter",
          "Pretendard",
          "Apple SD Gothic Neo",
          "Malgun Gothic",
          "Arial",
          "sans-serif"
        ].join(",")
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: "none",
              fontWeight: 700
            }
          }
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: "none"
            }
          }
        }
      }
    });
  }, [choice, effectiveMode]);

  const contextValue = useMemo(() => ({ choice, setChoice }), [choice]);

  return (
    <ThemeModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
