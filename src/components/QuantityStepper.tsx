import React, { useEffect, useRef } from 'react';
import { Animated, View, Pressable, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

interface QuantityStepperProps {
  quantity: number;
  onChange: (q: number) => void;
  min?: number;
  compact?: boolean;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({ quantity, onChange, min = 0, compact }) => {
  const { colors } = useTheme();
  const bump = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    bump.setValue(1.3);
    Animated.spring(bump, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 10 }).start();
  }, [quantity, bump]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.text, paddingHorizontal: compact ? 8 : 12, gap: compact ? 10 : 16 },
      ]}
    >
      <Pressable onPress={() => onChange(Math.max(min, quantity - 1))} hitSlop={8}>
        <Minus size={14} strokeWidth={3} color={colors.accent} />
      </Pressable>
      <Animated.Text style={[styles.count, { color: colors.accent, transform: [{ scale: bump }] }]}>
        {quantity}
      </Animated.Text>
      <Pressable onPress={() => onChange(quantity + 1)} hitSlop={8}>
        <Plus size={14} strokeWidth={3} color={colors.accent} />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingVertical: 6,
  },
  count: { minWidth: 14, textAlign: 'center', fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

export default QuantityStepper;
