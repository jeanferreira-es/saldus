import React from "react";
import { TouchableOpacity } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction } from "@/models/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { fonts } from "@/views/theme/fonts";

interface Props {
  transaction: Transaction;
  onPress?: () => void;
  onLongPress?: () => void;
}

const RECURRENCE_LABEL: Record<Transaction["recurrence"], string> = {
  none: "À vista",
  recurring: "Recorrente",
  installment: "Parcelada",
};

const RECURRENCE_ICON: Record<Transaction["recurrence"], keyof typeof Ionicons.glyphMap> = {
  none: "cash-outline",
  recurring: "repeat-outline",
  installment: "layers-outline",
};

const Row = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border};
`;

const IconWrap = styled.View<{ tint: string }>`
  width: 40px;
  height: 40px;
  border-radius: 13px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: ${({ tint }) => tint};
`;

const Info = styled.View`
  flex: 1;
`;

const Description = styled.Text`
  font-size: 15px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.text};
`;

const Subtitle = styled.Text`
  font-size: 12px;
  font-family: ${fonts.regular};
  margin-top: 2px;
  color: ${({ theme }) => theme.textSecondary};
`;

const Amount = styled.Text<{ tint: string }>`
  font-size: 14px;
  font-family: ${fonts.bold};
  margin-left: 8px;
  color: ${({ tint }) => tint};
`;

export default function TransactionListItem({ transaction, onPress, onLongPress }: Props) {
  const theme = useTheme();
  const isIncome = transaction.kind === "income";
  const tint = isIncome ? theme.income : theme.primary;

  const subtitleParts = [transaction.category, RECURRENCE_LABEL[transaction.recurrence]];
  if (transaction.recurrence === "installment" && transaction.installments) {
    subtitleParts.push(`${transaction.installments.current}/${transaction.installments.total}`);
  }

  return (
    <Row onPress={onPress} onLongPress={onLongPress} disabled={!onPress && !onLongPress} activeOpacity={0.7}>
      <IconWrap tint={`${tint}22`}>
        <Ionicons name={RECURRENCE_ICON[transaction.recurrence]} size={18} color={tint} />
      </IconWrap>
      <Info>
        <Description numberOfLines={1}>{transaction.description || transaction.category}</Description>
        <Subtitle numberOfLines={1}>
          {subtitleParts.join(" · ")} · {formatDate(transaction.date)}
        </Subtitle>
      </Info>
      <Amount tint={isIncome ? theme.income : theme.expense}>
        {isIncome ? "+ " : "- "}
        {formatCurrency(transaction.amount)}
      </Amount>
    </Row>
  );
}
