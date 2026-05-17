import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../../constants/theme';

interface ProgressRingProps {
  size: number;
  strokeWidth: number;
  progress: number; // 0-1
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
  label?: string;
}

export function ProgressRing({
  size,
  strokeWidth,
  progress,
  color = Colors.accent,
  bgColor = Colors.border,
  children,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(progress, 1));
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
      </Svg>
      {children}
      {label && (
        <Text
          style={{
            color: Colors.textMuted,
            fontSize: 9,
            fontFamily: 'DMSans_400Regular',
            marginTop: 2,
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      )}
    </View>
  );
}
