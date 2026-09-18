import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface MacroRingProps {
  value: number;
  max: number;
  label: string;
  unit?: string;
  size?: number;
  color?: string;
}

const MacroRing: React.FC<MacroRingProps> = ({ value, max, label, unit = '', size = 96, color }) => {
  const { colors } = useTheme();
  const stroke = 9;
  const radius = size / 2 - stroke;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(value / max, 1);
  const progress = useRef(new Animated.Value(0)).current;
  const ringColor = color ?? colors.accent;

  useEffect(() => {
    Animated.timing(progress, { toValue: pct, duration: 900, useNativeDriver: false }).start();
  }, [pct, progress]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, alignItems: 'center' }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            stroke={colors.border}
            fill="none"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            stroke={ringColor}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
          />
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.value, { color: colors.text }]}>{Math.round(value)}</Text>
          <Text style={[styles.unit, { color: colors.textMuted }]}>{unit}</Text>
        </View>
      </View>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  value: { fontSize: 20, fontWeight: '800', fontVariant: ['tabular-nums'] },
  unit: { fontSize: 10, marginTop: 1 },
  label: { fontSize: 12, fontWeight: '600', marginTop: 4 },
});

export default MacroRing;
