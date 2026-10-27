import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useThemeController } from "@/controllers/ThemeController";
import { useBankDepositController } from "@/controllers/BankDepositController";
import { fonts } from "@/views/theme/fonts";

import HomeScreen from "@/views/screens/HomeScreen";
import TransactionsScreen from "@/views/screens/TransactionsScreen";
import AddTransactionScreen from "@/views/screens/AddTransactionScreen";
import LoansScreen from "@/views/screens/LoansScreen";
import LoanDetailScreen from "@/views/screens/LoanDetailScreen";
import AddLoanScreen from "@/views/screens/AddLoanScreen";
import SettingsScreen from "@/views/screens/SettingsScreen";
import RecurrencesScreen from "@/views/screens/RecurrencesScreen";
import AddRecurrenceScreen from "@/views/screens/AddRecurrenceScreen";
import BankDepositsScreen from "@/views/screens/BankDepositsScreen";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const TransactionsStack = createNativeStackNavigator();
const LoansStack = createNativeStackNavigator();
const SettingsStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ presentation: "modal" }} />
      <HomeStack.Screen name="Recurrences" component={RecurrencesScreen} />
      <HomeStack.Screen name="AddRecurrence" component={AddRecurrenceScreen} options={{ presentation: "modal" }} />
    </HomeStack.Navigator>
  );
}

function TransactionsStackNavigator() {
  return (
    <TransactionsStack.Navigator screenOptions={{ headerShown: false }}>
      <TransactionsStack.Screen name="TransactionsMain" component={TransactionsScreen} />
      <TransactionsStack.Screen
        name="AddTransaction"
        component={AddTransactionScreen}
        options={{ presentation: "modal" }}
      />
    </TransactionsStack.Navigator>
  );
}

function LoansStackNavigator() {
  return (
    <LoansStack.Navigator screenOptions={{ headerShown: false }}>
      <LoansStack.Screen name="LoansMain" component={LoansScreen} />
      <LoansStack.Screen name="LoanDetail" component={LoanDetailScreen} />
      <LoansStack.Screen name="AddLoan" component={AddLoanScreen} options={{ presentation: "modal" }} />
    </LoansStack.Navigator>
  );
}

function SettingsStackNavigator() {
  return (
    <SettingsStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingsStack.Screen name="SettingsMain" component={SettingsScreen} />
      <SettingsStack.Screen name="BankDeposits" component={BankDepositsScreen} />
    </SettingsStack.Navigator>
  );
}

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Início: "home",
  "Transações": "swap-horizontal",
  "Empréstimos": "people",
  Ajustes: "settings",
};

export default function RootNavigator() {
  const { colors, isDark } = useThemeController();
  const { pending } = useBankDepositController();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.surface,
      primary: colors.primary,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          tabBarLabelStyle: { fontFamily: fonts.semiBold },
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={(focused ? ICONS[route.name] : `${ICONS[route.name]}-outline`) as any}
              size={size}
              color={color}
            />
          ),
        })}
      >
        <Tab.Screen name="Início" component={HomeStackNavigator} />
        <Tab.Screen name="Transações" component={TransactionsStackNavigator} />
        <Tab.Screen name="Empréstimos" component={LoansStackNavigator} />
        <Tab.Screen
          name="Ajustes"
          component={SettingsStackNavigator}
          options={{ tabBarBadge: pending.length > 0 ? pending.length : undefined }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
