import React from "react";
import { TouchableOpacity } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { Ionicons } from "@expo/vector-icons";
import { LoanGroup } from "@/models/types";
import { formatCurrency } from "@/utils/format";
import { fonts } from "@/views/theme/fonts";

interface Props {
  group: LoanGroup;
  onPress: () => void;
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

const StatusText = styled.Text<{ tint: string }>`
  font-size: 11px;
  font-family: ${fonts.semiBold};
  margin-top: 4px;
  color: ${({ tint }) => tint};
`;

export default function LoanListItem({ group, onPress }: Props) {
  const theme = useTheme();
  const isLent = group.kind === "lent";
  const settled = group.total <= 0;
  const tint = settled ? theme.textSecondary : isLent ? theme.income : theme.expense;
  const entryCount = group.entries.length;

  return (
    <Row onPress={onPress} activeOpacity={0.7}>
      <IconWrap tint={`${tint}22`}>
        <Ionicons name={isLent ? "arrow-up-circle-outline" : "arrow-down-circle-outline"} size={20} color={tint} />
      </IconWrap>
      <Info>
        <Person numberOfLines={1}>{group.person}</Person>
        <Subtitle numberOfLines={1}>
          {isLent ? "Você emprestou" : "Você pegou emprestado"} · {entryCount} lançamento
          {entryCount > 1 ? "s" : ""}
        </Subtitle>
      </Info>
      <Right>
        <Amount tint={tint}>{formatCurrency(Math.abs(group.total))}</Amount>
        <StatusText tint={settled ? theme.textSecondary : theme.primary}>
          {settled ? "Quitado" : "Ver detalhes"}
        </StatusText>
      </Right>
    </Row>
  );
}
