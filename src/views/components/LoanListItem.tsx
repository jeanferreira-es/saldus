import React from "react";
import { TouchableOpacity } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { Loan } from "@/models/types";
import { formatCurrency, formatDate } from "@/utils/format";
import { fonts } from "@/views/theme/fonts";

interface Props {
  loan: Loan;
  onTogglePaid: () => void;
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

const Person = styled.Text`
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

const Right = styled.View`
  align-items: flex-end;
`;

const Amount = styled.Text<{ tint: string }>`
  font-size: 14px;
  font-family: ${fonts.bold};
  color: ${({ tint }) => tint};
`;

const StatusBtn = styled(TouchableOpacity)`
  flex-direction: row;
  align-items: center;
  gap: 3px;
  margin-top: 4px;
`;

const StatusText = styled.Text<{ tint: string }>`
  font-size: 11px;
  font-family: ${fonts.semiBold};
  color: ${({ tint }) => tint};
`;

export default function LoanListItem({ loan, onTogglePaid, onLongPress }: Props) {
  const theme = useTheme();
  const isLent = loan.kind === "lent";
  const tint = isLent ? theme.income : theme.expense;

  return (
    <Row onLongPress={onLongPress} activeOpacity={0.7}>
      <IconWrap tint={`${tint}22`}>
        <Ionicons name={isLent ? "arrow-up-circle-outline" : "arrow-down-circle-outline"} size={20} color={tint} />
      </IconWrap>
      <Info>
        <Person numberOfLines={1}>{loan.person}</Person>
        <Subtitle numberOfLines={1}>
          {isLent ? "Você emprestou" : "Você pegou emprestado"} · {formatDate(loan.date)}
          {loan.dueDate ? ` · vence ${formatDate(loan.dueDate)}` : ""}
        </Subtitle>
      </Info>
      <Right>
        <Amount tint={tint}>{formatCurrency(loan.amount)}</Amount>
        <StatusBtn onPress={onTogglePaid}>
          {loan.paid && <Ionicons name="checkmark-circle" size={12} color={theme.textSecondary} />}
          <StatusText tint={loan.paid ? theme.textSecondary : theme.primary}>
            {loan.paid ? "Quitado" : isLent ? "Marcar recebido" : "Marcar pago"}
          </StatusText>
        </StatusBtn>
      </Right>
    </Row>
  );
}
