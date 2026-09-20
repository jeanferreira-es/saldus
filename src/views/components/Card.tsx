import styled from "styled-components/native";

const Card = styled.View`
  background-color: ${({ theme }) => theme.card};
  border-radius: 20px;
  padding: 18px;
  shadow-color: #1B1F3B;
  shadow-opacity: 0.06;
  shadow-radius: 12px;
  shadow-offset: 0px 4px;
  elevation: 2;
`;

export default Card;
