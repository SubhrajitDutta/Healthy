import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Allergen, DietGoal } from '../types';
import { useTheme } from '../context/ThemeContext';

const ALLERGEN_LABEL: Record<Allergen, string> = {
  lactose: 'Lactose',
  nuts: 'Nuts',
  gluten: 'Gluten',
  soy: 'Soy',
  shellfish: 'Shellfish',
  egg: 'Egg',
};

export const DIET_GOAL_LABEL: Record<DietGoal, string> = {
  'high-protein': 'High protein',
  'low-carb': 'Low carb',
  keto: 'Keto',
  vegan: 'Vegan',
  'muscle-gain': 'Muscle gain',
  'weight-loss': 'Weight loss',
  'diabetic-friendly': 'Diabetic friendly',
};

export const AllergenChip: React.FC<{ allergen: Allergen; flagged?: boolean }> = ({ allergen, flagged }) => {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.allergenChip,
        flagged
          ? { borderColor: colors.coral, backgroundColor: colors.coralBg }
          : { borderColor: colors.border },
      ]}
    >
      {flagged && <AlertTriangle size={11} strokeWidth={2.5} color={colors.coralText} style={{ marginRight: 4 }} />}
      <Text style={[styles.allergenText, { color: flagged ? colors.coralText : colors.textMuted }]}>
        {ALLERGEN_LABEL[allergen]}
      </Text>
    </View>
  );
};

export const DietGoalChip: React.FC<{ goal: DietGoal; active?: boolean; onPress?: () => void }> = ({
  goal,
  active,
  onPress,
}) => {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} disabled={!onPress}>
      <View
        style={[
          styles.goalChip,
          active ? { backgroundColor: colors.text } : { backgroundColor: colors.surfaceAlt },
        ]}
      >
        <Text style={[styles.goalText, { color: active ? colors.accent : colors.textMuted }]}>
          {DIET_GOAL_LABEL[goal]}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  allergenChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  allergenText: { fontSize: 11, fontWeight: '600' },
  goalChip: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  goalText: { fontSize: 12, fontWeight: '700' },
});
