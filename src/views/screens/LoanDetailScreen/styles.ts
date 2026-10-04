import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "@/views/theme/fonts";

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-horizontal: 20px;
  padding-top: 12px;
  padding-bottom: 4px;
`;

export const BackBtn = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.surfaceAlt};
`;

export const HeaderInfo = styled.View`
  flex: 1;
`;

export const Person = styled.Text`
  font-size: 20px;
  font-family: ${fonts.extraBold};
  color: ${({ theme }) => theme.text};
`;

export const KindLabel = styled.Text`
  font-size: 13px;
  font-family: ${fonts.regular};
  color: ${({ theme }) => theme.textSecondary};
`;

export const TotalCard = styled.View<{ tone: "income" | "expense" | "neutral" }>`
  margin: 16px 20px;
  border-radius: 24px;
  padding: 22px;
  background-color: ${({ tone, theme }) =>
    tone === "income" ? theme.income : tone === "expense" ? theme.expense : theme.surfaceAlt};
`;

export const TotalLabel = styled.Text<{ tone: "income" | "expense" | "neutral" }>`
  font-size: 14px;
  font-family: ${fonts.medium};
  color: ${({ tone, theme }) => (tone === "neutral" ? theme.textSecondary : "rgba(255, 255, 255, 0.85)")};
`;

export const TotalValue = styled.Text<{ tone: "income" | "expense" | "neutral" }>`
  font-size: 32px;
  font-family: ${fonts.extraBold};
  margin-top: 4px;
  color: ${({ tone, theme }) => (tone === "neutral" ? theme.text : "#ffffff")};
`;

export const ActionsRow = styled.View`
  flex-direction: row;
  gap: 10px;
  padding-horizontal: 20px;
  margin-bottom: 8px;
`;

export const ActionBtn = styled.View<{ tone: "primary" | "alt" }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding-vertical: 13px;
  border-radius: 14px;
  gap: 6px;
  background-color: ${({ tone, theme }) => (tone === "primary" ? theme.primary : theme.surfaceAlt)};
`;

export const ActionBtnText = styled.Text<{ tone: "primary" | "alt" }>`
  font-family: ${fonts.bold};
  font-size: 13px;
  color: ${({ tone, theme }) => (tone === "primary" ? "#FFFFFF" : theme.text)};
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${fonts.bold};
  margin: 16px 20px 8px;
  color: ${({ theme }) => theme.text};
`;

export const EmptyText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-family: ${fonts.regular};
  text-align: center;
  margin-top: 40px;
`;
