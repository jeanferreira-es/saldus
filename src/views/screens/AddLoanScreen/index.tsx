import React, { useState } from "react";
import { Alert, Platform } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import SegmentedControl from "@/views/components/SegmentedControl";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { LoanKind, LoanEntryType } from "@/models/types";
import { digitsToMoneyMask, moneyMaskToNumber, numberToMoneyMask } from "@/utils/format";
import * as S from "./styles";

function toDayMonthYear(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export default function AddLoanScreen() {
  const { loans, addLoan, updateLoan } = useFinanceController();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Com `id` nos params a tela abre em modo edição, preenchida com o lançamento existente.
  const editing = loans.find((l) => l.id === route.params?.id);

  const entryType: LoanEntryType = editing?.type ?? route.params?.type ?? "loan";
  const isPayment = entryType === "payment";

  const [kind, setKind] = useState<LoanKind>(editing?.kind ?? route.params?.kind ?? "lent");
  const [person, setPerson] = useState(editing?.person ?? route.params?.person ?? "");
  const [amount, setAmount] = useState(editing ? numberToMoneyMask(editing.amount) : "");
  const [dueDate, setDueDate] = useState(editing?.dueDate ? toDayMonthYear(editing.dueDate) : ""); // dd/mm/aaaa, opcional
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const title = editing
    ? isPayment
      ? kind === "lent"
        ? "Editar recebimento"
        : "Editar pagamento"
      : "Editar empréstimo"
    : isPayment
      ? kind === "lent"
        ? "Registrar recebimento"
        : "Registrar pagamento"
      : "Novo empréstimo";

  const handleSave = async () => {
    const parsedAmount = moneyMaskToNumber(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");
      return;
    }
    if (!person.trim()) {
      Alert.alert("Falta o nome", "Informe com quem é o empréstimo.");
      return;
    }

    let dueIso: string | undefined;
    if (!isPayment && dueDate.trim()) {
      const match = dueDate.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
      if (!match) {
        Alert.alert("Data inválida", "Use o formato dd/mm/aaaa para o vencimento, ou deixe em branco.");
        return;
      }
      const [, d, m, y] = match;
      dueIso = new Date(Number(y), Number(m) - 1, Number(d)).toISOString();
    }

    const data = {
      kind,
      person: person.trim(),
      amount: parsedAmount,
      date: editing?.date ?? new Date().toISOString(),
      dueDate: dueIso,
      type: entryType,
      notes: notes.trim() || undefined,
    };
    if (editing) await updateLoan(editing.id, data);
    else await addLoan(data);

    navigation.goBack();
  };

  return (
    <S.Container>
      <S.Scroll keyboardShouldPersistTaps="handled">
        <FadeSlideIn>
          <S.Title>{title}</S.Title>

          {!isPayment && (
            <SegmentedControl
              value={kind}
              onChange={setKind}
              options={[
                { label: "Eu emprestei", value: "lent" },
                { label: "Eu peguei", value: "borrowed" },
              ]}
            />
          )}

          <S.Label>Pessoa ou instituição</S.Label>
          <S.Input value={person} onChangeText={setPerson} placeholder="Nome da pessoa ou instituição" />

          <S.Label>Valor (R$)</S.Label>
          <S.AmountInput
            value={amount}
            onChangeText={(text: string) => setAmount(digitsToMoneyMask(text))}
            placeholder="0,00"
            keyboardType="number-pad"
          />

          {!isPayment && (
            <>
              <S.Label>Vencimento (opcional)</S.Label>
              <S.Input
                value={dueDate}
                onChangeText={setDueDate}
                placeholder="dd/mm/aaaa"
                keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "default"}
              />
            </>
          )}

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
