import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider as StyledThemeProvider } from "styled-components/native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from "@expo-google-fonts/poppins";
import { ThemeControllerProvider, useThemeController } from "@/controllers/ThemeController";
import { FinanceControllerProvider } from "@/controllers/FinanceController";
import RootNavigator from "@/views/navigation/RootNavigator";
import { initDatabase } from "@/database";

function AppContent() {
  const { colors, isDark } = useThemeController();
  return (
    <StyledThemeProvider theme={colors}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <FinanceControllerProvider>
        <RootNavigator />
      </FinanceControllerProvider>
    </StyledThemeProvider>
  );
}

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  useEffect(() => {
    initDatabase().then(() => setDbReady(true));
  }, []);

  if (!dbReady || !fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeControllerProvider>
          <AppContent />
        </ThemeControllerProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
