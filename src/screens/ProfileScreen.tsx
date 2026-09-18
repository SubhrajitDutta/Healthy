import React from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ShieldAlert, Target, Flame, Minus, Plus } from 'lucide-react-native';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { DietGoalChip } from '../components/Badges';
import { Allergen, DietGoal } from '../types';
import ThemeToggle from '../components/ThemeToggle';
import ScalePressable from '../components/ScalePressable';

const ALL_ALLERGENS: Allergen[] = ['lactose', 'nuts', 'gluten', 'soy', 'shellfish', 'egg'];
const ALL_GOALS: DietGoal[] = [
  'high-protein',
  'low-carb',
  'keto',
  'vegan',
  'muscle-gain',
  'weight-loss',
  'diabetic-friendly',
];

const ALLERGEN_LABEL: Record<Allergen, string> = {
  lactose: 'Lactose',
  nuts: 'Nuts',
  gluten: 'Gluten',
  soy: 'Soy',
  shellfish: 'Shellfish',
  egg: 'Egg',
};

const ProfileScreen: React.FC = () => {
  const { profile, toggleAllergen, toggleDietGoal, setCalorieTarget, setProteinTarget, setNotes } = useUser();
  const { mode, setMode, colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.textFaint }]}>Welcome back</Text>
          <Text style={[styles.title, { color: colors.text }]}>Your profile</Text>
        </View>
        <ThemeToggle />
      </View>

      {/* Allergy profile */}
      <View
        style={[
          styles.card,
          { borderColor: colors.text, backgroundColor: colors.surface, marginTop: 20 },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <ShieldAlert size={17} color={colors.coral} strokeWidth={2.5} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Allergy profile</Text>
        </View>
        <Text style={[styles.cardHint, { color: colors.textMuted }]}>
          Dishes and ingredients containing these will be flagged automatically across the app.
        </Text>
        <View style={styles.wrapRow}>
          {ALL_ALLERGENS.map((a) => {
            const active = profile.allergens.includes(a);
            return (
              <ScalePressable
                key={a}
                scaleTo={0.95}
                onPress={() => toggleAllergen(a)}
                style={[
                  styles.allergenPill,
                  active
                    ? { borderColor: colors.coral, backgroundColor: colors.coralBg }
                    : { borderColor: colors.border },
                ]}
              >
                <Text style={[styles.allergenPillText, { color: active ? colors.coralText : colors.textMuted }]}>
                  {ALLERGEN_LABEL[a]}
                </Text>
              </ScalePressable>
            );
          })}
        </View>
        <TextInput
          value={profile.notes}
          onChangeText={setNotes}
          placeholder="Add allergy notes for kitchens to see with every order (e.g. severe peanut allergy)"
          placeholderTextColor={colors.textFaint}
          multiline
          numberOfLines={2}
          style={[styles.notesInput, { borderColor: colors.border, color: colors.text }]}
        />
      </View>

      {/* Diet goals */}
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface, marginTop: 16 }]}>
        <View style={styles.cardHeaderRow}>
          <Target size={17} color={colors.accent} strokeWidth={2.5} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Diet goals</Text>
        </View>
        <Text style={[styles.cardHint, { color: colors.textMuted }]}>
          Used to filter your feed and highlight matching dishes.
        </Text>
        <View style={styles.wrapRow}>
          {ALL_GOALS.map((g) => (
            <DietGoalChip key={g} goal={g} active={profile.dietGoals.includes(g)} onPress={() => toggleDietGoal(g)} />
          ))}
        </View>
      </View>

      {/* Daily targets */}
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface, marginTop: 16 }]}>
        <View style={styles.cardHeaderRow}>
          <Flame size={17} color={colors.coral} strokeWidth={2.5} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Daily targets</Text>
        </View>
        <View style={{ gap: 16, marginTop: 12 }}>
          <TargetStepper
            label="Calories"
            unit="kcal"
            value={profile.dailyCalorieTarget}
            min={1400}
            max={4000}
            step={50}
            onChange={setCalorieTarget}
          />
          <TargetStepper
            label="Protein"
            unit="g"
            value={profile.dailyProteinTarget}
            min={40}
            max={250}
            step={5}
            onChange={setProteinTarget}
          />
        </View>
      </View>

      {/* Theme preference */}
      <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface, marginTop: 16 }]}>
        <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Appearance</Text>
        <View style={styles.themeRow}>
          {(['light', 'dark', 'system'] as const).map((m) => (
            <ScalePressable
              key={m}
              scaleTo={0.97}
              onPress={() => setMode(m)}
              style={[
                styles.themeOption,
                mode === m ? { borderColor: colors.accent, backgroundColor: colors.surfaceAlt } : { borderColor: colors.border },
              ]}
            >
              <Text style={[styles.themeOptionText, { color: colors.text }]}>
                {m[0].toUpperCase() + m.slice(1)}
              </Text>
            </ScalePressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const TargetStepper: React.FC<{
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}> = ({ label, unit, value, min, max, step, onChange }) => {
  const { colors } = useTheme();
  return (
    <View>
      <View style={styles.targetHeaderRow}>
        <Text style={[styles.targetLabel, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.targetValue, { color: colors.text }]}>
          {value}
          {unit}
        </Text>
      </View>
      <View style={styles.targetControls}>
        <ScalePressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={[styles.targetButton, { backgroundColor: colors.text }]}
        >
          <Minus size={14} strokeWidth={3} color={colors.accent} />
        </ScalePressable>
        <View style={[styles.targetTrack, { backgroundColor: colors.surfaceAlt }]}>
          <View
            style={[
              styles.targetFill,
              { backgroundColor: colors.accent, width: `${((value - min) / (max - min)) * 100}%` },
            ]}
          />
        </View>
        <ScalePressable
          onPress={() => onChange(Math.min(max, value + step))}
          style={[styles.targetButton, { backgroundColor: colors.text }]}
        >
          <Plus size={14} strokeWidth={3} color={colors.accent} />
        </ScalePressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  eyebrow: { fontSize: 11 },
  title: { fontSize: 21, fontWeight: '800' },
  card: { marginHorizontal: 16, borderWidth: 2, borderRadius: 18, padding: 16 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700' },
  cardHint: { fontSize: 11, marginTop: 4 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  allergenPill: { borderWidth: 2, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6 },
  allergenPillText: { fontSize: 12, fontWeight: '700' },
  notesInput: {
    marginTop: 12,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    minHeight: 56,
    textAlignVertical: 'top',
  },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: { flex: 1, borderWidth: 2, borderRadius: 14, paddingVertical: 10, alignItems: 'center' },
  themeOptionText: { fontSize: 12, fontWeight: '700' },
  targetHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  targetLabel: { fontSize: 12, fontWeight: '600' },
  targetValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  targetControls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  targetButton: { height: 28, width: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  targetTrack: { flex: 1, height: 8, borderRadius: 999, overflow: 'hidden' },
  targetFill: { height: '100%', borderRadius: 999 },
});

export default ProfileScreen;
