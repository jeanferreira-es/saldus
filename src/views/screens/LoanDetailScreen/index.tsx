import React, { useMemo } from "react";
import { FlatList } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import LoanEntryListItem from "@/views/components/LoanEntryListItem";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { LoanCalculator } from "@/models/LoanCalculator";
import { LoanKind } from "@/models/types";
import { formatCurrency } from "@/utils/format";
import { showRecordActions } from "@/utils/recordActions";
import * as S from "./styles";

export default function LoanDetailScreen() {
  const theme = useTheme();
  const { loans, removeLoan } = useFinanceController();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const person: string = route.params.person;
  const kind: LoanKind = route.params.kind;
  const isLent = kind === "lent";

  const group = useMemo(() => {
    const groups = LoanCalculator.groupByPerson(loans);
    return groups.find(
      (g) => g.kind === kind && g.person.trim().toLowerCase() === person.trim().toLowerCase()
    );
  }, [loans, person, kind]);

  const entries = group?.entries ?? [];
  const total = group?.total ?? 0;
  const settled = total <= 0;
  const tone = settled ? "neutral" : isLent ? "income" : "expense";

  const handlePress = (id: string) =>
    showRecordActions({
      onEdit: () => navigation.navigate("AddLoan", { id }),
      onDelete: () => removeLoan(id),
    });

  return (
    <S.Container edges={["top"]}>
      <S.Header>
        <AnimatedPressable onPress={() => navigation.goBack()}>
          <S.BackBtn>
            <Ionicons name="chevron-back" size={20} color={theme.text} />
          </S.BackBtn>
        </AnimatedPressable>
        <S.HeaderInfo>
          <S.Person numberOfLines={1}>{person}</S.Person>
          <S.KindLabel>{isLent ? "Você emprestou" : "Você pegou emprestado"}</S.KindLabel>
        </S.HeaderInfo>
      </S.Header>

      <FadeSlideIn>
        <S.TotalCard tone={tone}>
          <S.TotalLabel tone={tone}>{settled ? "Quitado" : isLent ? "Em aberto para receber" : "Em aberto para pagar"}</S.TotalLabel>
          <S.TotalValue tone={tone}>{formatCurrency(Math.abs(total))}</S.TotalValue>
        </S.TotalCard>
      </FadeSlideIn>

      <S.ActionsRow>
        <AnimatedPressable
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("AddLoan", { kind, person, type: "loan" })}
        >
          <S.ActionBtn tone="primary">
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <S.ActionBtnText tone="primary">Novo empréstimo</S.ActionBtnText>
          </S.ActionBtn>
        </AnimatedPressable>
        <AnimatedPressable
          style={{ flex: 1 }}
          onPress={() => navigation.navigate("AddLoan", { kind, person, type: "payment" })}
        >
          <S.ActionBtn tone="alt">
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.text} />
            <S.ActionBtnText tone="alt">{isLent ? "Registrar recebimento" : "Registrar pagamento"}</S.ActionBtnText>
          </S.ActionBtn>
        </AnimatedPressable>
      </S.ActionsRow>

      <S.SectionTitle>Histórico</S.SectionTitle>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        renderItem={({ item, index }) => (
          <FadeSlideIn delay={Math.min(index, 8) * 30}>
            <LoanEntryListItem
              loan={item}
              onPress={() => handlePress(item.id)}
              onLongPress={() => handlePress(item.id)}
            />
          </FadeSlideIn>
        )}
        ListEmptyComponent={<S.EmptyText>Nenhum lançamento registrado</S.EmptyText>}
      />
    </S.Container>
  );
}
