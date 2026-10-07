import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Card from "@/views/components/Card";
import { fonts } from "@/views/theme/fonts";

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const Scroll = styled.ScrollView.attrs({
  contentContainerStyle: { padding: 20, paddingBottom: 40 },
})``;

export const BalanceCard = styled.View`
  background-color: ${({ theme }) => theme.primary};
  border-radius: 24px;
  padding: 22px;
  margin-bottom: 24px;
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: 0.28;
  shadow-radius: 16px;
  shadow-offset: 0px 8px;
  elevation: 6;
`;

export const BalanceHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const Greeting = styled.Text`
  font-size: 14px;
  font-family: ${fonts.medium};
  color: rgba(255, 255, 255, 0.75);
`;

export const Balance = styled.Text`
  font-size: 36px;
  font-family: ${fonts.extraBold};
  margin-top: 4px;
  margin-bottom: 20px;
  color: #ffffff;
`;

export const QuickActions = styled.View`
  flex-direction: row;
  gap: 10px;
`;

export const QuickBtn = styled.View<{ tone: "primary" | "alt" }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: 13px;
  border-radius: 14px;
  gap: 6px;
  background-color: ${({ tone }) => (tone === "primary" ? "#FFFFFF" : "rgba(255, 255, 255, 0.16)")};
`;

export const QuickBtnText = styled.Text<{ tone: "primary" | "alt" }>`
  font-family: ${fonts.bold};
  font-size: 13px;
  color: ${({ tone, theme }) => (tone === "primary" ? theme.primary : "#FFFFFF")};
`;

export const CommitmentRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

export const CommitmentTitle = styled.Text`
  flex: 1;
  font-size: 14px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.text};
`;

export const CommitmentValue = styled.Text`
  font-size: 26px;
  font-family: ${fonts.extraBold};
  margin-top: 8px;
  color: ${({ theme }) => theme.warning};
`;

export const CommitmentHint = styled.Text`
  font-size: 12px;
  font-family: ${fonts.regular};
  margin-top: 4px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${fonts.bold};
  margin-bottom: 10px;
  color: ${({ theme }) => theme.text};
`;

export const MonthRow = styled.View`
  flex-direction: row;
  gap: 10px;
  margin-bottom: 24px;
`;

export const MonthCard = styled(Card)`
  flex: 1;
`;

export const MonthLabel = styled.Text`
  font-size: 12px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.textSecondary};
`;

export const MonthValue = styled.Text<{ tone: "income" | "expense" }>`
  font-size: 18px;
  font-family: ${fonts.extraBold};
  margin-top: 4px;
  color: ${({ tone, theme }) => (tone === "income" ? theme.income : theme.expense)};
`;

export const RecentHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
`;

export const LinkText = styled.Text`
  color: ${({ theme }) => theme.primary};
  font-family: ${fonts.semiBold};
  font-size: 13px;
`;

export const EmptyText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-family: ${fonts.regular};
  text-align: center;
  padding-vertical: 12px;
`;
