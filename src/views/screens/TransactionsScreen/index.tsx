import React, { useMemo, useState } from "react";
import { FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import TransactionListItem from "@/views/components/TransactionListItem";
import SegmentedControl from "@/views/components/SegmentedControl";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { TransactionKind } from "@/models/types";
import { FinanceCalculator } from "@/models/FinanceCalculator";
import { formatCurrency } from "@/utils/format";
import { showRecordActions } from "@/utils/recordActions";
import * as S from "./styles";

type FilterKind = "all" | TransactionKind;

export default function TransactionsScreen() {
  const { transactions, removeTransaction } = useFinanceController();
  const navigation = useNavigation<any>();
  const [filter, setFilter] = useState<FilterKind>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.kind === filter);
  }, [transactions, filter]);

  const categoryTotals = useMemo(() => {
    if (filter === "all") return [];
    return FinanceCalculator.totalsByCategory(transactions, filter);
  }, [transactions, filter]);

  const handlePress = (id: string) =>
    showRecordActions({
      onEdit: () => navigation.navigate("AddTransaction", { id }),
      onDelete: () => removeTransaction(id),
    });

  return (
    <S.Container edges={["top"]}>
      <S.Header>
        <S.Title>Transações</S.Title>
        <AnimatedPressable onPress={() => navigation.navigate("AddTransaction", {})}>
          <S.AddBtn>
            <Ionicons name="add" size={22} color="#fff" />
          </S.AddBtn>
        </AnimatedPressable>
      </S.Header>

      <S.FilterWrap>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { label: "Todas", value: "all" },
            { label: "Entradas", value: "income" },
            { label: "Saídas", value: "expense" },
          ]}
        />
      </S.FilterWrap>

      {categoryTotals.length > 0 && (
        <FlatList
          horizontal
          data={categoryTotals}
          keyExtractor={(item) => item.category}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12 }}
          renderItem={({ item }) => (
            <S.CategoryChip>
              <S.CategoryChipLabel>{item.category}</S.CategoryChipLabel>
              <S.CategoryChipValue>{formatCurrency(item.total)}</S.CategoryChipValue>
            </S.CategoryChip>
          )}
        />
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <FadeSlideIn delay={Math.min(index, 8) * 30}>
            <TransactionListItem
              transaction={item}
              onPress={() => handlePress(item.id)}
              onLongPress={() => handlePress(item.id)}
            />
          </FadeSlideIn>
        )}
        ListEmptyComponent={<S.EmptyText>Nenhuma movimentação por aqui ainda</S.EmptyText>}
      />
    </S.Container>
  );
}
