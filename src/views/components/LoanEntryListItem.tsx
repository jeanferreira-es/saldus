import React from "react";
import { TouchableOpacity } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { Loan } from "@/models/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { fonts } from "@/views/theme/fonts";

interface Props {
  loan: Loan;
  onPress?: () => void;
  onLongPress?: () => void;
}

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

const Label = styled.Text`
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

export default function LoanEntryListItem({ loan, onPress, onLongPress }: Props) {
  const theme = useTheme();
  const isPayment = loan.type === "payment";
  const isLent = loan.kind === "lent";
  const tint = isPayment ? theme.income : theme.expense;

  const label = isPayment ? (isLent ? "Recebimento" : "Pagamento") : "Novo empréstimo";
  const subtitleParts = [formatDate(loan.date)];
  if (!isPayment && loan.dueDate) subtitleParts.push(`vence ${formatDate(loan.dueDate)}`);
  if (loan.notes) subtitleParts.push(loan.notes);

  return (
    <Row onPress={onPress} onLongPress={onLongPress} disabled={!onPress && !onLongPress} activeOpacity={0.7}>
      <IconWrap tint={`${tint}22`}>
        <Ionicons name={isPayment ? "checkmark-circle-outline" : "add-circle-outline"} size={18} color={tint} />
      </IconWrap>
      <Info>
        <Label numberOfLines={1}>{label}</Label>
        <Subtitle numberOfLines={1}>{subtitleParts.join(" · ")}</Subtitle>
      </Info>
      <Amount tint={tint}>
        {isPayment ? "- " : "+ "}
        {formatCurrency(loan.amount)}
      </Amount>
    </Row>
  );
}
