/**
 * VIEW LAYER — animação de entrada reutilizável.
 * Faz um fade-in + slide-up suave quando o componente é montado.
 * Usado nos cartões da Home e nos itens de lista (transações/empréstimos)
 * para dar uma sensação viva à interface sem exagerar.
 */
import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";

interface Props {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
}

export default function FadeSlideIn({ children, delay = 0, style }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translateY, delay]);

  return (
    <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}
