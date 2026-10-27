import React from "react";
import { Alert } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { RecurrenceCalculator } from "@/models/RecurrenceCalculator";
import { Recurrence } from "@/models/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { confirmCancelRecurrence } from "@/utils/recordActions";
import * as S from "./styles";

function describe(recurrence: Recurrence): string {
  const day = `Todo dia ${RecurrenceCalculator.dueDay(recurrence)}`;
  const next = RecurrenceCalculator.nextDueDate(recurrence);
  const remaining = RecurrenceCalculator.remainingOccurrences(recurrence);

  if (!next) {
    if (recurrence.canceledAt) return `Interrompida em ${formatDate(recurrence.canceledAt)}`;
    return recurrence.installments ? `${recurrence.installments.total} parcelas · quitada` : "Período encerrado";
  }

  const parts = [day, `próximo em ${formatDate(next.toISOString())}`];
  if (recurrence.installments) {
    const number = RecurrenceCalculator.installmentNumber(recurrence, recurrence.generatedCount);
    parts.push(`parcela ${number} de ${recurrence.installments.total}`);
  } else if (remaining !== undefined) {
    parts.push(remaining === 1 ? "último mês" : `faltam ${remaining} meses`);
  }
  return parts.join(" · ");
}

export default function RecurrencesScreen() {
  const theme = useTheme();
  const { recurrences, commitment, cancelRecurrence, removeRecurrence } = useFinanceController();
  const navigation = useNavigation<any>();

  const now = new Date();
  const expenses = recurrences.filter((r) => r.kind === "expense");
  const active = expenses.filter((r) => RecurrenceCalculator.isActive(r));
  const bills = active.filter((r) => r.type === "recurring");
  const credit = active.filter((r) => r.type === "installment");
  const ended = expenses.filter((r) => !RecurrenceCalculator.isActive(r));
  const thisMonth = RecurrenceCalculator.remainingThisMonth(recurrences, now);

  const confirmRemove = (recurrence: Recurrence) =>
    Alert.alert("Excluir gasto futuro", "Nenhum desconto foi lançado ainda, então ele é apagado por completo.", [
      { text: "Voltar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => removeRecurrence(recurrence.id) },
    ]);

  const showActions = (recurrence: Recurrence) => {
    const title = recurrence.description || recurrence.category;
    if (!RecurrenceCalculator.isActive(recurrence)) {
      if (recurrence.generatedCount === 0) confirmRemove(recurrence);
      return;
    }
    Alert.alert(title, "O que deseja fazer?", [
      { text: "Voltar", style: "cancel" },
      { text: "Editar", onPress: () => navigation.navigate("AddRecurrence", { id: recurrence.id }) },
      recurrence.generatedCount === 0
        ? { text: "Excluir", style: "destructive", onPress: () => confirmRemove(recurrence) }
        : {
            text: "Interromper",
            style: "destructive",
            onPress: () => confirmCancelRecurrence(() => cancelRecurrence(recurrence.id)),
          },
    ]);
  };

  const renderItem = (recurrence: Recurrence, index: number, isActive: boolean) => {
    const tint = isActive ? theme.primary : theme.textSecondary;
    return (
      <FadeSlideIn key={recurrence.id} delay={Math.min(index, 8) * 30}>
        <AnimatedPressable onPress={() => showActions(recurrence)}>
          <S.Row>
            <S.IconWrap tint={`${tint}22`}>
              <Ionicons
                name={recurrence.type === "recurring" ? "repeat-outline" : "card-outline"}
                size={18}
                color={tint}
              />
            </S.IconWrap>
            <S.Info>
              <S.Description numberOfLines={1}>{recurrence.description || recurrence.category}</S.Description>
              <S.Subtitle numberOfLines={2}>{describe(recurrence)}</S.Subtitle>
            </S.Info>
            <S.Right>
              <S.Amount muted={!isActive}>{formatCurrency(recurrence.amount)}</S.Amount>
              {isActive && <Ionicons name="ellipsis-horizontal" size={16} color={theme.textSecondary} />}
            </S.Right>
          </S.Row>
        </AnimatedPressable>
      </FadeSlideIn>
    );
  };

  const section = (title: string, items: Recurrence[], empty: string) => (
    <>
      <S.SectionTitle>{title}</S.SectionTitle>
      {items.length === 0 ? <S.EmptyText>{empty}</S.EmptyText> : items.map((r, i) => renderItem(r, i, true))}
    </>
  );

  return (
    <S.Container edges={["top"]}>
      <S.Header>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <S.BackBtn>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </S.BackBtn>
        </AnimatedPressable>
        <S.Title>Gastos futuros</S.Title>
        <AnimatedPressable onPress={() => navigation.navigate("AddRecurrence")}>
          <S.AddBtn>
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <S.AddBtnText>Novo</S.AddBtnText>
          </S.AddBtn>
        </AnimatedPressable>
      </S.Header>

      <S.Scroll>
        <S.SummaryCard>
          <S.SummaryRow>
            <S.SummaryItem>
              <S.SummaryLabel>Ainda este mês</S.SummaryLabel>
              <S.SummaryValue>{formatCurrency(thisMonth)}</S.SummaryValue>
            </S.SummaryItem>
            <S.SummaryItem>
              <S.SummaryLabel>Próximo mês</S.SummaryLabel>
              <S.SummaryValue>{formatCurrency(commitment)}</S.SummaryValue>
            </S.SummaryItem>
          </S.SummaryRow>
          <S.SummaryHint>Descontado do saldo só no dia de cada conta ou parcela.</S.SummaryHint>
        </S.SummaryCard>

        {section("Contas recorrentes", bills, "Nenhuma conta recorrente cadastrada")}
        <S.Spacer />
        {section("Compras no crédito", credit, "Nenhuma compra parcelada em aberto")}

        {ended.length > 0 && (
          <>
            <S.Spacer />
            <S.SectionTitle>Encerrados</S.SectionTitle>
            {ended.map((r, i) => renderItem(r, i, false))}
          </>
        )}
      </S.Scroll>
    </S.Container>
  );
}
