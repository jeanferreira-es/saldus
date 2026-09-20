import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "@/views/components/Card";
import { fonts } from "@/views/theme/fonts";

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-horizontal: 20px;
  padding-top: 12px;
  padding-bottom: 4px;
`;

export const Title = styled.Text`
  font-size: 24px;
  font-family: ${fonts.extraBold};
  color: ${({ theme }) => theme.text};
`;

export const AddBtn = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.primary};
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: 0.3;
  shadow-radius: 8px;
  shadow-offset: 0px 4px;
  elevation: 3;
`;

export const SummaryRow = styled.View`
  flex-direction: row;
  gap: 10px;
  padding-horizontal: 20px;
  margin-top: 14px;
`;

export const SummaryCard = styled(Card)`
  flex: 1;
`;

export const SummaryLabel = styled.Text`
  font-size: 12px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.textSecondary};
`;

export const SummaryValue = styled.Text<{ tone: "income" | "expense" }>`
  font-size: 18px;
  font-family: ${fonts.extraBold};
  margin-top: 4px;
  color: ${({ tone, theme }) => (tone === "income" ? theme.income : theme.expense)};
`;

export const FilterWrap = styled.View`
  padding-horizontal: 20px;
  margin-top: 16px;
`;

export const EmptyText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-family: ${fonts.regular};
  text-align: center;
  margin-top: 40px;
`;
