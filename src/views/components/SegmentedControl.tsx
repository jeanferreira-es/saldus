/**
 * VIEW LAYER
 * Segmento de opções (ex: Entrada/Saída, À vista/Recorrente/Parcelada).
 * A opção ativa desliza suavemente entre as posições.
 */
import React, { useEffect, useRef } from "react";
import { Animated, LayoutChangeEvent } from "react-native";
import styled, { useTheme } from "styled-components/native";
import { fonts } from "@/views/theme/fonts";

interface Option<T extends string> {
  label: string;
  value: T;
}

interface Props<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

const Wrapper = styled.View`
  flex-direction: row;
  background-color: ${({ theme }) => theme.surfaceAlt};
  border-radius: 14px;
  padding: 4px;
`;

const Segment = styled.TouchableOpacity`
  flex: 1;
  padding-vertical: 8px;
  border-radius: 11px;
  align-items: center;
  z-index: 1;
`;

const SegmentLabel = styled.Text<{ active: boolean }>`
  font-size: 13px;
  font-family: ${fonts.semiBold};
  color: ${({ active, theme }) => (active ? "#FFFFFF" : theme.textSecondary)};
`;

export default function SegmentedControl<T extends string>({ options, value, onChange }: Props<T>) {
  const theme = useTheme();
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  const segmentWidth = useRef(0);
  const translateX = useRef(new Animated.Value(0)).current;

  const handleLayout = (e: LayoutChangeEvent) => {
    segmentWidth.current = e.nativeEvent.layout.width / options.length;
    translateX.setValue(segmentWidth.current * activeIndex);
  };

  useEffect(() => {
    if (!segmentWidth.current) return;
    Animated.spring(translateX, {
      toValue: segmentWidth.current * activeIndex,
      speed: 20,
      bounciness: 8,
      useNativeDriver: true,
    }).start();
  }, [activeIndex, translateX]);

  return (
    <Wrapper onLayout={handleLayout}>
      <Animated.View
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 4,
          width: segmentWidth.current ? segmentWidth.current - 8 : `${100 / options.length}%`,
          borderRadius: 11,
          backgroundColor: theme.primary,
          transform: [{ translateX }],
        }}
      />
      {options.map((opt) => (
        <Segment key={opt.value} onPress={() => onChange(opt.value)} activeOpacity={0.8}>
          <SegmentLabel active={opt.value === value}>{opt.label}</SegmentLabel>
        </Segment>
      ))}
    </Wrapper>
  );
}
