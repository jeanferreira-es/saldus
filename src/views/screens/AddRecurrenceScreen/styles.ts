import styled from "styled-components/native";
import { fonts } from "@/views/theme/fonts";

export * from "../AddTransactionScreen/styles";

export const DayRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const DayBtn = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.surfaceAlt};
`;

export const DayValue = styled.Text`
  min-width: 112px;
  text-align: center;
  font-size: 18px;
  font-family: ${fonts.extraBold};
  color: ${({ theme }) => theme.text};
`;

export const Summary = styled.View`
  margin-top: 20px;
  border-radius: 16px;
  padding: 14px 16px;
  background-color: ${({ theme }) => theme.surfaceAlt};
`;

export const SummaryText = styled.Text`
  font-size: 13px;
  line-height: 19px;
  font-family: ${fonts.medium};
  color: ${({ theme }) => theme.text};
`;
