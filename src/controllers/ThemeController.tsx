/**
 * CONTROLLER LAYER
 * Controla a preferência de aparência do app, delegando a persistência
 * ao ThemeRepository (Model) e informando as Views qual paleta usar.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { ThemeMode } from "@/models/types";
import { ThemeRepository } from "@/models/ThemeRepository";
import { lightPalette, darkPalette, AppPalette } from "@/views/theme/palette";

interface ThemeControllerValue {
  mode: ThemeMode;
  isDark: boolean;
  colors: AppPalette;
  setMode: (mode: ThemeMode) => void;
}

const ThemeControllerContext = createContext<ThemeControllerValue | undefined>(undefined);

export function ThemeControllerProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await ThemeRepository.get();
      if (stored) setModeState(stored);
      setLoaded(true);
    })();
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    ThemeRepository.set(newMode).catch(() => {});
  };

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const colors = isDark ? darkPalette : lightPalette;

  const value = useMemo(() => ({ mode, isDark, colors, setMode }), [mode, isDark, colors]);

  if (!loaded) return null;

  return <ThemeControllerContext.Provider value={value}>{children}</ThemeControllerContext.Provider>;
}

export function useThemeController() {
  const ctx = useContext(ThemeControllerContext);
  if (!ctx) throw new Error("useThemeController deve ser usado dentro de ThemeControllerProvider");
  return ctx;
}
