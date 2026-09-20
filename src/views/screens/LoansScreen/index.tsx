import React, { useMemo, useState } from "react";
import { FlatList, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import LoanListItem from "@/views/components/LoanListItem";
import SegmentedControl from "@/views/components/SegmentedControl";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { LoanKind } from "@/models/types";
import { formatCurrency } from "@/utils/format";
import * as S from "./styles";

type FilterKind = "all" | LoanKind;

export default function LoansScreen() {
  const { loans, removeLoan, toggleLoanPaid } = useFinanceController();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterKind>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return loans;
    return loans.filter((l) => l.kind === filter);
  }, [loans, filter]);

  const totalLent = loans.filter((l) => l.kind === "lent" && !l.paid).reduce((s, l) => s + l.amount, 0);
  const totalBorrowed = loans
    .filter((l) => l.kind === "borrowed" && !l.paid)
    .reduce((s, l) => s + l.amount, 0);

  const handleLongPress = (id: string) => {
    Alert.alert("Excluir empréstimo", "Deseja remover este registro?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => removeLoan(id) },
    ]);
  };

  return (
    <S.Container edges={["top"]}>
      <S.Header>
        <S.Title>Empréstimos</S.Title>
        <AnimatedPressable onPress={() => navigation.navigate("AddLoan")}>
          <S.AddBtn>
            <Ionicons name="add" size={22} color="#fff" />
          </S.AddBtn>
        </AnimatedPressable>
      </S.Header>

      <FadeSlideIn>
        <S.SummaryRow>
          <S.SummaryCard>
            <S.SummaryLabel>A receber</S.SummaryLabel>
            <S.SummaryValue tone="income">{formatCurrency(totalLent)}</S.SummaryValue>
          </S.SummaryCard>
          <S.SummaryCard>
            <S.SummaryLabel>A pagar</S.SummaryLabel>
            <S.SummaryValue tone="expense">{formatCurrency(totalBorrowed)}</S.SummaryValue>
          </S.SummaryCard>
        </S.SummaryRow>
      </FadeSlideIn>

      <S.FilterWrap>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { label: "Todos", value: "all" },
            { label: "Emprestei", value: "lent" },
            { label: "Peguei", value: "borrowed" },
          ]}
        />
      </S.FilterWrap>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <FadeSlideIn delay={Math.min(index, 8) * 30}>
            <LoanListItem
              loan={item}
              onTogglePaid={() => toggleLoanPaid(item.id)}
              onLongPress={() => handleLongPress(item.id)}
            />
          </FadeSlideIn>
        )}
        ListEmptyComponent={<S.EmptyText>Nenhum empréstimo registrado</S.EmptyText>}
      />
    </S.Container>
  );
}
