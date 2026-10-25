import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "@/views/theme/fonts";

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const Scroll = styled.ScrollView.attrs({
  contentContainerStyle: { paddingHorizontal: 20, paddingBottom: 48 },
  keyboardShouldPersistTaps: "handled",
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

export const Intro = styled.Text`
  font-size: 13px;
  font-family: ${fonts.regular};
  margin-top: 12px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const SectionLabel = styled.Text`
  font-size: 13px;
  font-family: ${fonts.semiBold};
  margin-top: 24px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const Hint = styled.Text`
  font-size: 12px;
  font-family: ${fonts.regular};
  margin-top: 8px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const Row = styled.View<{ divider?: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding-vertical: 12px;
  padding-horizontal: 16px;
  border-bottom-width: ${({ divider }) => (divider ? "1px" : "0px")};
  border-bottom-color: ${({ theme }) => theme.border};
`;

export const RowInfo = styled.View`
  flex: 1;
`;

export const RowLabel = styled.Text`
  font-size: 15px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.text};
`;

export const RowSubtitle = styled.Text`
  font-size: 12px;
  font-family: ${fonts.regular};
  margin-top: 2px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const StatusDot = styled.View<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${({ active, theme }) => (active ? theme.income : theme.warning)};
`;

export const PrimaryBtn = styled.View`
  margin-top: 14px;
  border-radius: 14px;
  padding-vertical: 12px;
  align-items: center;
  background-color: ${({ theme }) => theme.primary};
`;

export const PrimaryBtnText = styled.Text`
  color: #fff;
  font-family: ${fonts.bold};
  font-size: 14px;
`;

export const LinkText = styled.Text`
  font-size: 13px;
  font-family: ${fonts.semiBold};
  margin-top: 10px;
  color: ${({ theme }) => theme.primary};
`;

export const Input = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.textSecondary,
}))`
  border-width: 1px;
  border-radius: 14px;
  padding-horizontal: 14px;
  padding-vertical: 12px;
  margin-bottom: 12px;
  font-size: 15px;
  font-family: ${fonts.regular};
  border-color: ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
`;

export const FormActions = styled.View`
  flex-direction: row;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  margin-top: 14px;
`;

export const CancelText = styled.Text`
  font-size: 14px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.textSecondary};
`;

export const SaveText = styled.Text`
  font-size: 14px;
  font-family: ${fonts.bold};
  color: ${({ theme }) => theme.primary};
`;

export const Amount = styled.Text<{ muted?: boolean }>`
  font-size: 15px;
  font-family: ${fonts.bold};
  color: ${({ muted, theme }) => (muted ? theme.textSecondary : theme.income)};
`;

export const DepositText = styled.Text`
  font-size: 12px;
  font-family: ${fonts.regular};
  margin-top: 6px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const Chips = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

export const Chip = styled.View<{ disabled?: boolean }>`
  padding-vertical: 7px;
  padding-horizontal: 12px;
  border-radius: 12px;
  opacity: ${({ disabled }) => (disabled ? 0.4 : 1)};
  background-color: ${({ theme }) => theme.surfaceAlt};
`;

export const ChipText = styled.Text`
  font-size: 13px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.primary};
`;

export const Badge = styled.Text`
  font-size: 11px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.textSecondary};
`;

export const EmptyText = styled.Text`
  font-size: 13px;
  font-family: ${fonts.regular};
  text-align: center;
  padding-vertical: 14px;
  color: ${({ theme }) => theme.textSecondary};
`;
