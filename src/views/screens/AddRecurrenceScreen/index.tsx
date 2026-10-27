import React, { useState } from "react";
import { Alert } from "react-native";
import { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useFinanceController } from "@/controllers/FinanceController";
import SegmentedControl from "@/views/components/SegmentedControl";
import AnimatedPressable from "@/views/components/AnimatedPressable";
import FadeSlideIn from "@/views/components/FadeSlideIn";
import { EXPENSE_CATEGORIES, Recurrence } from "@/models/types";
import { RecurrenceCalculator } from "@/models/RecurrenceCalculator";
import { digitsToMoneyMask, formatCurrency, formatDate, moneyMaskToNumber, numberToMoneyMask } from "@/utils/format";
import * as S from "./styles";

type FutureType = Recurrence["type"];
type Duration = "open" | "fixed";

const DEFAULT_CATEGORY: Record<FutureType, string> = { recurring: "Contas", installment: "Compras" };

/** Descreve o que vai acontecer com o saldo, para conferir antes de salvar. */
function describePlan(preview: Recurrence): string {
  const total = RecurrenceCalculator.totalOccurrences(preview);
  const first = preview.generatedCount;
  const day = `todo dia ${RecurrenceCalculator.dueDay(preview)}`;
  const from = formatDate(RecurrenceCalculator.occurrenceDate(preview, first).toISOString());
  const value = formatCurrency(preview.amount);

  if (total === undefined) {
    return `${value} ${day}, a partir de ${from}, até você interromper.`;
  }
  const remaining = total - first;
  if (remaining <= 0) return "Nenhum desconto restante com essa duração.";
  const to = formatDate(RecurrenceCalculator.occurrenceDate(preview, total - 1).toISOString());
  const left = formatCurrency(preview.amount * remaining);
  if (preview.installments) {
    const next = preview.installments.start + first;
    const range = next === preview.installments.total ? `Parcela ${next}` : `Parcelas ${next} a ${preview.installments.total}`;
    return `${range} de ${value} ${day}, de ${from} a ${to} · faltam ${left}.`;
  }
  return `${value} ${day}, ${remaining === 1 ? "1 vez" : `${remaining} vezes`}: de ${from} a ${to} · total ${left}.`;
}

export default function AddRecurrenceScreen() {
  const theme = useTheme();
  const { recurrences, addRecurrence, updateRecurrence } = useFinanceController();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const editing = recurrences.find((r) => r.id === route.params?.id);

  const [type, setType] = useState<FutureType>(editing?.type ?? route.params?.type ?? "recurring");
  const [amount, setAmount] = useState(editing ? numberToMoneyMask(editing.amount) : "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [category, setCategory] = useState<string>(editing?.category ?? DEFAULT_CATEGORY[type]);
  const [dueDay, setDueDay] = useState(editing ? RecurrenceCalculator.dueDay(editing) : new Date().getDate());
  const [duration, setDuration] = useState<Duration>(editing?.maxOccurrences ? "fixed" : "open");
  const [months, setMonths] = useState(String(editing?.maxOccurrences ?? 12));
  const [installmentCurrent, setInstallmentCurrent] = useState(String(editing?.installments?.start ?? 1));
  const [installmentTotal, setInstallmentTotal] = useState(String(editing?.installments?.total ?? 2));

  const generated = editing?.generatedCount ?? 0;

  const handleTypeChange = (next: FutureType) => {
    if (category === DEFAULT_CATEGORY[type]) setCategory(DEFAULT_CATEGORY[next]);
    setType(next);
  };

  const changeDay = (delta: number) => setDueDay((day) => ((day - 1 + delta + 31) % 31) + 1);

  // Regra como ficaria ao salvar (null enquanto os números não fazem sentido).
  const buildPreview = (): Recurrence | null => {
    const parsedAmount = moneyMaskToNumber(amount);
    const current = parseInt(installmentCurrent, 10);
    const total = parseInt(installmentTotal, 10);
    const count = parseInt(months, 10);
    if (type === "installment" && (!total || !current || current < 1 || current > total)) return null;
    if (type === "recurring" && duration === "fixed" && !(count >= 1)) return null;
    return {
      id: editing?.id ?? "preview",
      kind: "expense",
      type,
      amount: parsedAmount,
      category,
      description,
      startDate: editing?.startDate ?? RecurrenceCalculator.firstDueDate(dueDay, new Date()).toISOString(),
      dueDay,
      maxOccurrences: type === "recurring" && duration === "fixed" ? count : undefined,
      installments: type === "installment" ? { start: current, total } : undefined,
      generatedCount: generated,
    };
  };
  const preview = buildPreview();

  const handleSave = async () => {
    if (!preview || !(preview.amount > 0)) {
      Alert.alert(
        "Confira os dados",
        !preview
          ? type === "installment"
            ? "Confira o número total de parcelas e a próxima parcela."
            : "Informe por quantos meses a conta vai durar."
          : "Informe um valor maior que zero."
      );
      return;
    }
    const total = RecurrenceCalculator.totalOccurrences(preview);
    if (editing && total !== undefined && total < generated) {
      Alert.alert("Duração menor que o já descontado", `${generated} desconto(s) já foram lançados.`);
      return;
    }

    const { amount: value, category: cat, description: desc, maxOccurrences, installments } = preview;
    if (editing) {
      await updateRecurrence(editing.id, { amount: value, category: cat, description: desc, dueDay, maxOccurrences, installments });
    } else {
      await addRecurrence({
        kind: "expense",
        type,
        amount: value,
        category: cat,
        description: desc,
        startDate: preview.startDate,
        dueDay,
        maxOccurrences,
        installments,
      });
    }
    navigation.goBack();
  };

  return (
    <S.Container>
      <S.Scroll keyboardShouldPersistTaps="handled">
        <FadeSlideIn>
          <S.Title>{editing ? "Editar gasto futuro" : "Novo gasto futuro"}</S.Title>

          {!editing && (
            <SegmentedControl
              value={type}
              onChange={handleTypeChange}
              options={[
                { label: "Conta recorrente", value: "recurring" },
                { label: "Compra no crédito", value: "installment" },
              ]}
            />
          )}
          <S.Hint>
            {type === "recurring"
              ? "Assinaturas, aluguel, contas de consumo... descontadas do saldo todo mês no dia escolhido."
              : "Compra parcelada no cartão: cada parcela é descontada do saldo no dia do vencimento da fatura."}
          </S.Hint>

          <S.Label>{type === "installment" ? "Valor da parcela (R$)" : "Valor (R$)"}</S.Label>
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
            placeholder={type === "installment" ? "Ex: Celular, Geladeira..." : "Ex: Netflix, Aluguel, Internet..."}
          />

          <S.Label>Categoria</S.Label>
          <S.ChipsWrap>
            {EXPENSE_CATEGORIES.map((c) => {
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

          <S.Label>Dia do desconto</S.Label>
          <S.DayRow>
            <AnimatedPressable onPress={() => changeDay(-1)} hitSlop={6}>
              <S.DayBtn>
                <Ionicons name="remove" size={20} color={theme.primary} />
              </S.DayBtn>
            </AnimatedPressable>
            <S.DayValue>Todo dia {dueDay}</S.DayValue>
            <AnimatedPressable onPress={() => changeDay(1)} hitSlop={6}>
              <S.DayBtn>
                <Ionicons name="add" size={20} color={theme.primary} />
              </S.DayBtn>
            </AnimatedPressable>
          </S.DayRow>
          {dueDay > 28 && <S.Hint>Nos meses mais curtos, cai no último dia do mês.</S.Hint>}

          {type === "recurring" ? (
            <>
              <S.Label>Duração</S.Label>
              <SegmentedControl
                value={duration}
                onChange={setDuration}
                options={[
                  { label: "Até eu interromper", value: "open" },
                  { label: "Por um período", value: "fixed" },
                ]}
              />
              {duration === "fixed" && (
                <>
                  <S.Label>Quantos meses (contando o primeiro desconto)</S.Label>
                  <S.Input value={months} onChangeText={setMonths} keyboardType="number-pad" />
                </>
              )}
            </>
          ) : (
            <S.InstallmentRow>
              {!editing && (
                <S.InstallmentField>
                  <S.Label>Próxima parcela</S.Label>
                  <S.Input value={installmentCurrent} onChangeText={setInstallmentCurrent} keyboardType="number-pad" />
                </S.InstallmentField>
              )}
              <S.InstallmentField>
                <S.Label>Total de parcelas</S.Label>
                <S.Input value={installmentTotal} onChangeText={setInstallmentTotal} keyboardType="number-pad" />
              </S.InstallmentField>
            </S.InstallmentRow>
          )}

          {editing && generated > 0 && (
            <S.Hint>
              {generated} desconto(s) já lançado(s). As alterações valem a partir do próximo e não mudam o que já foi
              descontado.
            </S.Hint>
          )}

          {preview && preview.amount > 0 && (
            <S.Summary>
              <S.SummaryText>
                {describePlan(preview)} O saldo só muda no dia de cada desconto.
              </S.SummaryText>
            </S.Summary>
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
