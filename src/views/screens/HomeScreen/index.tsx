import React, { useState } from "react";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import Card from "@/views/components/Card";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import TransactionListItem from "@/views/components/TransactionListItem";
import { formatCurrency, formatMonthLabel } from "@/utils/format";
import { FinanceCalculator } from "@/models/FinanceCalculator";
import * as S from "./styles";

const HIDDEN_MASK = "••••••";

export default function HomeScreen() {
  const theme = useTheme();
  const { transactions, balance, commitment } = useFinanceController();
  const navigation = useNavigation<any>();
  const [hideBalance, setHideBalance] = useState(false);

  const now = new Date();
  const monthTx = FinanceCalculator.transactionsInMonth(transactions, now);
  const monthIncome = FinanceCalculator.sumByKind(monthTx, "income");
  const monthExpense = FinanceCalculator.sumByKind(monthTx, "expense");
  const recent = transactions.slice(0, 5);

  return (
    <S.Container edges={["top"]}>
      <S.Scroll>
        <FadeSlideIn>
          <S.BalanceCard>
            <S.BalanceHeader>
              <S.Greeting>Saldo atual</S.Greeting>
              <AnimatedPressable onPress={() => setHideBalance((prev) => !prev)} hitSlop={8}>
                <Ionicons
                  name={hideBalance ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="rgba(255, 255, 255, 0.85)"
                />
              </AnimatedPressable>
            </S.BalanceHeader>
            <S.Balance>{hideBalance ? HIDDEN_MASK : formatCurrency(balance)}</S.Balance>

            <S.QuickActions>
              <AnimatedPressable
                style={{ flex: 1 }}
                onPress={() => navigation.navigate("AddTransaction", { kind: "income" })}
              >
                <S.QuickBtn tone="primary">
                  <Ionicons name="add-circle-outline" size={18} color={theme.primary} />
                  <S.QuickBtnText tone="primary">Adicionar saldo</S.QuickBtnText>
                 </S.QuickBtn>
              </AnimatedPressable>
              <AnimatedPressable
                style={{ flex: 1 }}
                onPress={() => navigation.navigate("AddTransaction", { kind: "expense" })}
              >
                <S.QuickBtn tone="alt">
                  <Ionicons name="remove-circle-outline" size={18} color="#fff" />
                  <S.QuickBtnText tone="alt">Registrar saída</S.QuickBtnText>
                </S.QuickBtn>
              </AnimatedPressable>
            </S.QuickActions>
          </S.BalanceCard>
        </FadeSlideIn>

        <FadeSlideIn delay={60}>
          <Card style={{ marginBottom: 24 }}>
            <S.CommitmentRow>
              <Ionicons name="alert-circle-outline" size={20} color={theme.warning} />
              <S.CommitmentTitle>Comprometido no próximo mês</S.CommitmentTitle>
            </S.CommitmentRow>
            <S.CommitmentValue>{formatCurrency(commitment)}</S.CommitmentValue>
            <S.CommitmentHint>Assinaturas e parcelas em aberto</S.CommitmentHint>
          </Card>
        </FadeSlideIn>

        <FadeSlideIn delay={110}>
          <S.SectionTitle>{formatMonthLabel(now)}</S.SectionTitle>
          <S.MonthRow>
            <S.MonthCard>
              <S.MonthLabel>Entradas</S.MonthLabel>
              <S.MonthValue tone="income">{hideBalance ? HIDDEN_MASK : formatCurrency(monthIncome)}</S.MonthValue>
            </S.MonthCard>
            <S.MonthCard>
              <S.MonthLabel>Saídas</S.MonthLabel>
              <S.MonthValue tone="expense">{hideBalance ? HIDDEN_MASK : formatCurrency(monthExpense)}</S.MonthValue>
            </S.MonthCard>
          </S.MonthRow>
        </FadeSlideIn>

        <FadeSlideIn delay={160}>
          <S.RecentHeader>
            <S.SectionTitle style={{ marginBottom: 0 }}>Últimas movimentações</S.SectionTitle>
            <AnimatedPressable onPress={() => navigation.navigate("Transações")}>
              <S.LinkText>Ver todas</S.LinkText>
            </AnimatedPressable>
          </S.RecentHeader>
          <Card>
            {recent.length === 0 ? (
              <S.EmptyText>Nenhuma movimentação ainda</S.EmptyText>
            ) : (
              recent.map((t) => (
                <TransactionListItem
                  key={t.id}
                  transaction={t}
                  onPress={() => navigation.navigate("AddTransaction", { id: t.id })}
                />
              ))
            )}
          </Card>
        </FadeSlideIn>
      </S.Scroll>
    </S.Container>
  );
}
