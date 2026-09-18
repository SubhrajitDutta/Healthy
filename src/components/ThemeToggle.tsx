import React, { useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { Sun, Moon } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { resolvedDark, toggle, colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.88, useNativeDriver: true, speed: 40 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }).start();

  return (
    <Pressable onPress={toggle} onPressIn={onPressIn} onPressOut={onPressOut} accessibilityLabel="Toggle theme">
      <Animated.View
        style={[
          styles.button,
          { borderColor: colors.text, backgroundColor: colors.surface, transform: [{ scale }] },
        ]}
      >
        {resolvedDark ? (
          <Moon size={16} strokeWidth={2.5} color={colors.accent} />
        ) : (
          <Sun size={16} strokeWidth={2.5} color={colors.text} />
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ThemeToggle;
