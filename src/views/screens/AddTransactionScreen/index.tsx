import React, { useState } from "react";
import { Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import SegmentedControl from "@/views/components/SegmentedControl";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import {
  TransactionKind,
  RecurrenceType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/models/types";
import * as S from "./styles";

export default function AddTransactionScreen() {
  const { addTransaction } = useFinanceController();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [kind, setKind] = useState<TransactionKind>(route.params?.kind ?? "expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>(
    kind === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]
  );
  const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
  const [installmentTotal, setInstallmentTotal] = useState("2");
  const [installmentCurrent, setInstallmentCurrent] = useState("1");

  const categories = kind === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleKindChange = (newKind: TransactionKind) => {
    setKind(newKind);
    setCategory(newKind === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
    if (newKind === "income") setRecurrence("none");
  };

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");
      return;
    }

    let installments;
    if (recurrence === "installment") {
      const total = parseInt(installmentTotal, 10);
      const current = parseInt(installmentCurrent, 10);
      if (!total || total < 2 || !current || current < 1 || current > total) {
        Alert.alert("Parcelas inválidas", "Confira o número total de parcelas e a parcela atual.");
        return;
      }
      installments = { total, current };
    }

    await addTransaction({
      kind,
      amount: parsedAmount,
      category,
      description,
      date: new Date().toISOString(),
      recurrence,
      installments,
    });

    navigation.goBack();
  };

  return (
    <S.Container>
      <S.Scroll keyboardShouldPersistTaps="handled">
        <FadeSlideIn>
          <S.Title>{kind === "income" ? "Nova entrada" : "Nova saída"}</S.Title>

          <SegmentedControl
            value={kind}
            onChange={handleKindChange}
            options={[
              { label: "Entrada", value: "income" },
              { label: "Saída", value: "expense" },
            ]}
          />

          <S.Label>Valor (R$)</S.Label>
          <S.AmountInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            keyboardType="decimal-pad"
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

          {kind === "expense" && (
            <>
              <S.Label>Tipo de compra</S.Label>
              <SegmentedControl
                value={recurrence}
                onChange={setRecurrence}
                options={[
                  { label: "À vista", value: "none" },
                  { label: "Recorrente", value: "recurring" },
                  { label: "Parcelada", value: "installment" },
                ]}
              />
              <S.Hint>
                {recurrence === "none" && "Pago agora, não afeta os próximos meses."}
                {recurrence === "recurring" &&
                  "Repete todo mês (assinatura, aluguel, etc.) e entra no valor comprometido do próximo mês."}
                {recurrence === "installment" &&
                  "Compra parcelada: informe o valor de UMA parcela e quantas faltam."}
              </S.Hint>

              {recurrence === "installment" && (
                <S.InstallmentRow>
                  <S.InstallmentField>
                    <S.Label>Parcela atual</S.Label>
                    <S.Input
                      value={installmentCurrent}
                      onChangeText={setInstallmentCurrent}
                      keyboardType="number-pad"
                    />
                  </S.InstallmentField>
                  <S.InstallmentField>
                    <S.Label>Total de parcelas</S.Label>
                    <S.Input
                      value={installmentTotal}
                      onChangeText={setInstallmentTotal}
                      keyboardType="number-pad"
                    />
                  </S.InstallmentField>
                </S.InstallmentRow>
              )}
            </>
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
