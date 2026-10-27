import React, { useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import SegmentedControl from "@/views/components/SegmentedControl";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { TransactionKind, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/models/types";
import { digitsToMoneyMask, moneyMaskToNumber, numberToMoneyMask } from "@/utils/format";
import * as S from "./styles";

export default function AddTransactionScreen() {
  const { transactions, addTransaction, updateTransaction } = useFinanceController();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Com `id` nos params a tela abre em modo edição, preenchida com o registro existente.
  const editing = transactions.find((t) => t.id === route.params?.id);

  const [kind, setKind] = useState<TransactionKind>(editing?.kind ?? route.params?.kind ?? "expense");
  const [amount, setAmount] = useState(editing ? numberToMoneyMask(editing.amount) : "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [category, setCategory] = useState<string>(
    editing?.category ?? (kind === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0])
  );
  const categories = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleKindChange = (newKind: TransactionKind) => {
    setKind(newKind);
    setCategory(newKind === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
  };

  // Recorrentes e parceladas ficam centralizadas em Gastos futuros (pilha da aba Início).
  const openFutureExpense = () => {
    navigation.goBack();
    navigation.navigate("Início", { screen: "AddRecurrence" });
  };

  const handleSave = async () => {
    const parsedAmount = moneyMaskToNumber(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");
      return;
    }

    if (editing) {
      // Edita só este lançamento; o tipo (recorrente/parcelada) e o vínculo com a regra não mudam.
      await updateTransaction(editing.id, {
        kind,
        amount: parsedAmount,
        category,
        description,
        date: editing.date,
        recurrence: editing.recurrence,
        installments: editing.installments,
        recurrenceId: editing.recurrenceId,
      });
    } else {
      await addTransaction({
        kind,
        amount: parsedAmount,
        category,
        description,
        date: new Date().toISOString(),
        recurrence: "none",
      });
    }

    navigation.goBack();
  };

  return (
    <S.Container>
      <S.Scroll keyboardShouldPersistTaps="handled">
        <FadeSlideIn>
          <S.Title>
            {editing ? "Editar " : "Nova "}
            {kind === "income" ? "entrada" : "saída"}
          </S.Title>

          {!editing?.recurrenceId && (
            <SegmentedControl
              value={kind}
              onChange={handleKindChange}
              options={[
                { label: "Entrada", value: "income" },
                { label: "Saída", value: "expense" },
              ]}
            />
          )}

          <S.Label>Valor (R$)</S.Label>
          <S.AmountInput
            value={amount}
            onChangeText={(text: string) => setAmount(digitsToMoneyMask(text))}
            placeholder="0,00"
            keyboardType="number-pad"
          />

          <S.Label>Descrição</S.Label>
          <S.Input
            value={description}
            onChangeText={setDescription}
            placeholder="Ex: Mercado, Netflix, Salário..."
          />

          <S.Label>Categoria</S.Label>
          <S.ChipsWrap>
            {categories.map((c) => {
              const active = c === category;
              return (
                <AnimatedPressable key={c} onPress={() => setCategory(c)}>
                  <S.Chip active={active}>
                    <S.ChipLabel active={active}>{c}</S.ChipLabel>
                  </S.Chip>
                </AnimatedPressable>
              );
            })}
          </S.ChipsWrap>

          {editing?.recurrenceId && (
            <S.Hint>
              {editing.recurrence === "installment"
                ? `Parcela ${editing.installments?.current}/${editing.installments?.total} de uma compra parcelada.`
                : "Lançamento de uma conta recorrente."}{" "}
              As alterações valem só para este mês. Para mudar os próximos, edite em Gastos futuros.
            </S.Hint>
          )}

          {kind === "expense" && !editing && (
            <AnimatedPressable onPress={openFutureExpense}>
              <S.Hint>
                Sai do saldo agora. Conta recorrente ou compra parcelada no crédito?{" "}
                <S.HintLink>Cadastre em Gastos futuros</S.HintLink> — elas só descontam no dia certo.
              </S.Hint>
            </AnimatedPressable>
          )}

          <AnimatedPressable onPress={handleSave}>
            <S.SaveBtn>
              <S.SaveBtnText>Salvar</S.SaveBtnText>
            </S.SaveBtn>
          </AnimatedPressable>
          <AnimatedPressable onPress={() => navigation.goBack()}>
            <S.CancelBtn>
              <S.CancelBtnText>Cancelar</S.CancelBtnText>
            </S.CancelBtn>
          </AnimatedPressable>
        </FadeSlideIn>
      </S.Scroll>
    </S.Container>
  );
}
