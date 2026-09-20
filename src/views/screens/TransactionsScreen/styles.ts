import styled from "styled-components/native";
import { SafeAreaView } from "react-native-safe-area-context";
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

export const FilterWrap = styled.View`
  padding-horizontal: 20px;
  margin-top: 12px;
`;

export const CategoryChip = styled.View`
  border-radius: 14px;
  padding-vertical: 8px;
  padding-horizontal: 12px;
  margin-right: 8px;
  background-color: ${({ theme }) => theme.surfaceAlt};
`;

export const CategoryChipLabel = styled.Text`
  font-size: 11px;
  font-family: ${fonts.semiBold};
  color: ${({ theme }) => theme.text};
`;

export const CategoryChipValue = styled.Text`
  font-size: 13px;
  font-family: ${fonts.extraBold};
  margin-top: 2px;
  color: ${({ theme }) => theme.primary};
`;

export const EmptyText = styled.Text`
  color: ${({ theme }) => theme.textSecondary};
  font-family: ${fonts.regular};
  text-align: center;
  margin-top: 40px;
`;
