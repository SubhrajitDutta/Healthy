import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

interface MacroBarProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

const MacroBar: React.FC<MacroBarProps> = ({ label, value, max, unit, color }) => {
  const { colors } = useTheme();
  const pct = Math.min((value / max) * 100, 100);
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(widthAnim, { toValue: pct, duration: 700, useNativeDriver: false }).start();
  }, [pct, widthAnim]);

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      <View style={[styles.track, { backgroundColor: colors.surfaceAlt }]}>
        <Animated.View
          style={[
            styles.fill,
            { backgroundColor: color, width: widthAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
      <Text style={[styles.value, { color: colors.text }]}>
        {value}
        <Text style={{ color: colors.textFaint, fontWeight: '400' }}>{unit}</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  label: { width: 56, fontSize: 12, fontWeight: '600' },
  track: { flex: 1, height: 10, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999 },
  value: { width: 56, textAlign: 'right', fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'] },
});

export default MacroBar;
