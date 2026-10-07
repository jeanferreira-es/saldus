import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "@/views/theme/fonts";

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const Scroll = styled.ScrollView.attrs({
  contentContainerStyle: { paddingHorizontal: 20, paddingBottom: 40 },
})``;

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

export const Title = styled.Text`
  flex: 1;
  font-size: 20px;
  font-family: ${fonts.extraBold};
  color: ${({ theme }) => theme.text};
`;

export const SummaryCard = styled.View`
  margin-vertical: 16px;
  border-radius: 24px;
  padding: 22px;
  background-color: ${({ theme }) => theme.surfaceAlt};
`;

export const SummaryLabel = styled.Text`
  font-size: 14px;
  font-family: ${fonts.medium};
  color: ${({ theme }) => theme.textSecondary};
`;

export const SummaryValue = styled.Text`
  font-size: 32px;
  font-family: ${fonts.extraBold};
  margin-top: 4px;
  color: ${({ theme }) => theme.warning};
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-family: ${fonts.bold};
  margin-top: 8px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.text};
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border};
`;

export const IconWrap = styled.View<{ tint: string }>`
  width: 40px;
  height: 40px;
  border-radius: 13px;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  background-color: ${({ tint }) => tint};
`;

export const Info = styled.View`
  flex: 1;
`;

export const Description = styled.Text`
  font-size: 15px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.text};
`;

export const Subtitle = styled.Text`
  font-size: 12px;
  font-family: ${fonts.regular};
  margin-top: 2px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const Right = styled.View`
  align-items: flex-end;
  margin-left: 8px;
`;

export const Amount = styled.Text<{ muted?: boolean }>`
  font-size: 14px;
  font-family: ${fonts.bold};
  color: ${({ muted, theme }) => (muted ? theme.textSecondary : theme.expense)};
`;

export const CancelText = styled.Text`
  font-size: 12px;
  font-family: ${fonts.semiBold};
  margin-top: 4px;
  color: ${({ theme }) => theme.primary};
`;

export const EmptyText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-family: ${fonts.regular};
  text-align: center;
  padding-vertical: 12px;
`;
