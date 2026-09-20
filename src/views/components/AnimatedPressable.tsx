/**
 * VIEW LAYER — botão base com feedback de pressão animado.
 * Reduz levemente de escala ao tocar e volta ao soltar. Usado nas ações
 * rápidas da Home, no botão salvar dos formulários e nos chips de opção.
 */
import React, { useRef } from "react";
import { Animated, Pressable, PressableProps, ViewStyle } from "react-native";

interface Props extends PressableProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export default function AnimatedPressable({ children, style, ...rest }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      speed: 40,
      bounciness: 6,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable
      style={style}
      onPressIn={(e) => {
        animateTo(0.96);
        rest.onPressIn?.(e);
      }}
      onPressOut={(e) => {
        animateTo(1);
        rest.onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}
