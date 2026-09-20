import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fonts } from "@/views/theme/fonts";

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
`;

export const Scroll = styled.ScrollView.attrs({
  contentContainerStyle: { padding: 20, paddingBottom: 60 },
})``;

export const Title = styled.Text`
  font-size: 22px;
  font-family: ${fonts.extraBold};
  margin-bottom: 16px;
  color: ${({ theme }) => theme.text};
`;

export const Label = styled.Text`
  font-size: 13px;
  font-family: ${fonts.semiBold};
  margin-top: 18px;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.textSecondary};
`;

export const Input = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.textSecondary,
}))`
  border-width: 1px;
  border-radius: 14px;
  padding-horizontal: 14px;
  padding-vertical: 12px;
  font-size: 15px;
  font-family: ${fonts.regular};
  border-color: ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.text};
`;

export const AmountInput = styled(Input)`
  font-size: 24px;
  font-family: ${fonts.extraBold};
`;

export const SaveBtn = styled.View`
  margin-top: 32px;
  border-radius: 16px;
  padding-vertical: 15px;
  align-items: center;
  background-color: ${({ theme }) => theme.primary};
  shadow-color: ${({ theme }) => theme.primary};
  shadow-opacity: 0.28;
  shadow-radius: 12px;
  shadow-offset: 0px 6px;
  elevation: 4;
`;

export const SaveBtnText = styled.Text`
  color: #fff;
  font-family: ${fonts.extraBold};
  font-size: 16px;
`;

export const CancelBtn = styled.View`
  margin-top: 14px;
  align-items: center;
  padding-vertical: 8px;
`;

export const CancelBtnText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-family: ${fonts.semiBold};
`;
