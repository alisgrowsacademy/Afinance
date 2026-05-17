import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'card2';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: variant === 'card2' ? Colors.bgCard2 : Colors.bgCard,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: Colors.border,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
