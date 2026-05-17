import React from 'react';
import { Text, TextStyle } from 'react-native';
import { Colors } from '../../constants/theme';

interface TypoProps {
  children: React.ReactNode;
  style?: TextStyle;
  numberOfLines?: number;
}

export function DisplayText({ children, style, numberOfLines }: TypoProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 28 }, style]}
    >
      {children}
    </Text>
  );
}

export function Heading({ children, style, numberOfLines }: TypoProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: 'Syne_700Bold', color: Colors.textPrimary, fontSize: 20 }, style]}
    >
      {children}
    </Text>
  );
}

export function SubHeading({ children, style, numberOfLines }: TypoProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: 'DMSans_700Bold', color: Colors.textPrimary, fontSize: 16 }, style]}
    >
      {children}
    </Text>
  );
}

export function BodyText({ children, style, numberOfLines }: TypoProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: 'DMSans_400Regular', color: Colors.textPrimary, fontSize: 14 }, style]}
    >
      {children}
    </Text>
  );
}

export function MutedText({ children, style, numberOfLines }: TypoProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: 'DMSans_400Regular', color: Colors.textMuted, fontSize: 12 }, style]}
    >
      {children}
    </Text>
  );
}

export function AccentLabel({ children, style, numberOfLines }: TypoProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: 'DMSans_700Bold', color: Colors.accent, fontSize: 13 }, style]}
    >
      {children}
    </Text>
  );
}

export function MonoText({ children, style, numberOfLines }: TypoProps) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontFamily: 'DMMono_400Regular', color: Colors.textPrimary, fontSize: 12 }, style]}
    >
      {children}
    </Text>
  );
}
