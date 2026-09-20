import React from "react";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeController } from "@/controllers/ThemeController";
import { ThemeMode } from "@/models/types";
import Card from "@/views/components/Card";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import * as S from "./styles";

const OPTIONS: { mode: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { mode: "light", label: "Claro", icon: "sunny-outline" },
  { mode: "dark", label: "Escuro", icon: "moon-outline" },
  { mode: "system", label: "Automático (sistema)", icon: "phone-portrait-outline" },
];

export default function SettingsScreen() {
  const theme = useTheme();
  const { mode, setMode } = useThemeController();

  return (
    <S.Container edges={["top"]}>
      <S.Title>Configurações</S.Title>

      <S.SectionLabel>Aparência</S.SectionLabel>
      <FadeSlideIn>
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
      </FadeSlideIn>

      <S.Footer>Meu Dinheiro · seus dados ficam salvos apenas neste aparelho</S.Footer>
    </S.Container>
  );
}
