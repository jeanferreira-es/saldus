import React from "react";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { RecurrenceCalculator } from "@/models/RecurrenceCalculator";
import { Recurrence } from "@/models/types";
import { formatCurrency, formatDate, formatMonthLabel } from "@/utils/format";
import { confirmCancelRecurrence } from "@/utils/recordActions";
import * as S from "./styles";

function describe(recurrence: Recurrence, now: Date, active: boolean): string {
  const start = new Date(recurrence.startDate);

  if (recurrence.type === "recurring") {
    const since = `desde ${formatMonthLabel(start).toLowerCase()}`;
    if (recurrence.canceledAt) return `Cancelada em ${formatDate(recurrence.canceledAt)} · ${since}`;
    return `Todo dia ${start.getDate()} · ${since}`;
  }

  const { start: first, total } = recurrence.installments ?? { start: 1, total: 1 };
  const lastDate = RecurrenceCalculator.occurrenceDate(recurrence, total - first);
  if (recurrence.canceledAt) return `${total} parcelas · cancelada em ${formatDate(recurrence.canceledAt)}`;
  if (!active) return `${total} parcelas · última em ${formatMonthLabel(lastDate).toLowerCase()}`;
  const current = Math.min(first + RecurrenceCalculator.monthsBetween(recurrence.startDate, now), total);
  return `Parcela ${current} de ${total} · termina em ${formatMonthLabel(lastDate).toLowerCase()}`;
}

export default function RecurrencesScreen() {
  const theme = useTheme();
  const { recurrences, commitment, cancelRecurrence } = useFinanceController();
  const navigation = useNavigation<any>();

  const now = new Date();
  const expenses = recurrences.filter((r) => r.kind === "expense");
  const active = expenses.filter((r) => RecurrenceCalculator.isActive(r, now));
  const ended = expenses.filter((r) => !RecurrenceCalculator.isActive(r, now));

  const renderItem = (recurrence: Recurrence, index: number, isActive: boolean) => {
    const canCancel = isActive && recurrence.type === "recurring";
    const tint = isActive ? theme.primary : theme.textSecondary;
    return (
      <FadeSlideIn key={recurrence.id} delay={Math.min(index, 8) * 30}>
        <S.Row>
          <S.IconWrap tint={`${tint}22`}>
            <Ionicons
              name={recurrence.type === "recurring" ? "repeat-outline" : "layers-outline"}
              size={18}
              color={tint}
            />
          </S.IconWrap>
          <S.Info>
            <S.Description numberOfLines={1}>{recurrence.description || recurrence.category}</S.Description>
            <S.Subtitle numberOfLines={2}>{describe(recurrence, now, isActive)}</S.Subtitle>
          </S.Info>
          <S.Right>
            <S.Amount muted={!isActive}>{formatCurrency(recurrence.amount)}</S.Amount>
            {canCancel && (
              <AnimatedPressable
                hitSlop={8}
                onPress={() => confirmCancelRecurrence(() => cancelRecurrence(recurrence.id))}
              >
                <S.CancelText>Cancelar</S.CancelText>
              </AnimatedPressable>
            )}
          </S.Right>
        </S.Row>
      </FadeSlideIn>
    );
  };

  return (
    <S.Container edges={["top"]}>
      <S.Header>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <S.BackBtn>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </S.BackBtn>
        </AnimatedPressable>
        <S.Title>Compras recorrentes</S.Title>
      </S.Header>

      <S.Scroll>
        <S.SummaryCard>
          <S.SummaryLabel>Comprometido no próximo mês</S.SummaryLabel>
          <S.SummaryValue>{formatCurrency(commitment)}</S.SummaryValue>
        </S.SummaryCard>

        <S.SectionTitle>Ativas</S.SectionTitle>
        {active.length === 0 ? (
          <S.EmptyText>Nenhuma assinatura ou parcela em aberto</S.EmptyText>
        ) : (
          active.map((r, i) => renderItem(r, i, true))
        )}

        {ended.length > 0 && (
          <>
            <S.SectionTitle style={{ marginTop: 24 }}>Encerradas</S.SectionTitle>
            {ended.map((r, i) => renderItem(r, i, false))}
          </>
        )}
      </S.Scroll>
    </S.Container>
  );
}
