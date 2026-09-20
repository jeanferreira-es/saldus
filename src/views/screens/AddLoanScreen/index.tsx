import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import SegmentedControl from "@/views/components/SegmentedControl";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { LoanKind } from "@/models/types";
import * as S from "./styles";

export default function AddLoanScreen() {
  const { addLoan } = useFinanceController();
  const navigation = useNavigation<any>();

  const [kind, setKind] = useState<LoanKind>("lent");
  const [person, setPerson] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(""); // dd/mm/aaaa, opcional
  const [notes, setNotes] = useState("");

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount.replace(",", "."));
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");
      return;
    }
    if (!person.trim()) {
      Alert.alert("Falta o nome", "Informe com quem é o empréstimo.");
      return;
    }

    let dueIso: string | undefined;
    if (dueDate.trim()) {
      const match = dueDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!match) {
        Alert.alert("Data inválida", "Use o formato dd/mm/aaaa para o vencimento, ou deixe em branco.");
        return;
      }
      const [, d, m, y] = match;
      dueIso = new Date(Number(y), Number(m) - 1, Number(d)).toISOString();
    }

    await addLoan({
      kind,
      person: person.trim(),
      amount: parsedAmount,
      date: new Date().toISOString(),
      dueDate: dueIso,
      paid: false,
      notes: notes.trim() || undefined,
    });

    navigation.goBack();
  };

  return (
    <S.Container>
      <S.Scroll keyboardShouldPersistTaps="handled">
        <FadeSlideIn>
          <S.Title>Novo empréstimo</S.Title>

          <SegmentedControl
            value={kind}
            onChange={setKind}
            options={[
              { label: "Eu emprestei", value: "lent" },
              { label: "Eu peguei", value: "borrowed" },
            ]}
          />

          <S.Label>Pessoa</S.Label>
          <S.Input value={person} onChangeText={setPerson} placeholder="Nome da pessoa" />

          <S.Label>Valor (R$)</S.Label>
          <S.AmountInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            keyboardType="decimal-pad"
          />

          <S.Label>Vencimento (opcional)</S.Label>
          <S.Input
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="dd/mm/aaaa"
            keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
          />

          <S.Label>Observações (opcional)</S.Label>
          <S.Input value={notes} onChangeText={setNotes} placeholder="Ex: Combinado pagar em 3x" />

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
