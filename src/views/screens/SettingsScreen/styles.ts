import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "@/views/theme/fonts";

export const Container = styled(SafeAreaView)`
  flex: 1;
  padding: 20px;
  background-color: ${({ theme }) => theme.background};
`;

export const Title = styled.Text`
  font-size: 24px;
  font-family: ${fonts.extraBold};
  margin-bottom: 20px;
  color: ${({ theme }) => theme.text};
`;

export const SectionLabel = styled.Text`
  font-size: 13px;
  font-family: ${fonts.semiBold};
  margin-bottom: 8px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const Row = styled.View<{ divider: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-vertical: 14px;
  padding-horizontal: 16px;
  border-bottom-width: ${({ divider }) => (divider ? "1px" : "0px")};
  border-bottom-color: ${({ theme }) => theme.border};
`;

export const RowLabel = styled.Text`
  flex: 1;
  font-size: 15px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.text};
`;

export const Counter = styled.Text`
  min-width: 22px;
  padding-horizontal: 6px;
  border-radius: 11px;
  overflow: hidden;
  text-align: center;
  font-size: 12px;
  line-height: 22px;
  font-family: ${fonts.bold};
  color: #ffffff;
  background-color: ${({ theme }) => theme.expense};
`;

export const Footer = styled.Text`
  font-size: 12px;
  font-family: ${fonts.regular};
  text-align: center;
  margin-top: 32px;
  color: ${({ theme }) => theme.textSecondary};
`;
