import React from "react";
import { Platform } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useThemeController } from "@/controllers/ThemeController";
import { useBankDepositController } from "@/controllers/BankDepositController";
import { ThemeMode } from "@/models/types";
import Card from "@/views/components/Card";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import * as S from "./styles";

const OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: "light", label: "Claro", icon: "sunny-outline" },
  { mode: "dark", label: "Escuro", icon: "moon-outline" },
  { mode: "system", label: "Automático (sistema)", icon: "phone-portrait-outline" },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { mode, setMode } = useThemeController();
  const { pending } = useBankDepositController();
  const navigation = useNavigation<any>();

  return (
    <S.Container edges={["top"]}>
      <S.Title>Configurações</S.Title>

      <S.SectionLabel>Aparência</S.SectionLabel>
      <Card style={{ padding: 0, overflow: "hidden" }}>
        {OPTIONS.map((opt, idx) => {
          const active = mode === opt.mode;
          return (
            <AnimatedPressable key={opt.mode} onPress={() => setMode(opt.mode)}>
              <S.Row divider={idx < OPTIONS.length - 1}>
                <Ionicons name={opt.icon} size={20} color={active ? theme.primary : theme.textSecondary} />
                <S.RowLabel>{opt.label}</S.RowLabel>
                {active && <Ionicons name="checkmark" size={20} color={theme.primary} />}
              </S.Row>
            </AnimatedPressable>
          );
        })}
      </Card>

      {Platform.OS === "android" && (
        <>
          <S.SectionLabel style={{ marginTop: 24 }}>Automação</S.SectionLabel>
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <AnimatedPressable onPress={() => navigation.navigate("BankDeposits")}>
              <S.Row divider={false}>
                <Ionicons name="notifications-outline" size={20} color={theme.primary} />
                <S.RowLabel>Depósitos pelo banco</S.RowLabel>
                {pending.length > 0 && <S.Counter>{pending.length}</S.Counter>}
                <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
              </S.Row>
            </AnimatedPressable>
          </Card>
        </>
      )}

      <S.Footer>Meu Dinheiro · seus dados ficam salvos apenas neste aparelho</S.Footer>
    </S.Container>
  );
}
