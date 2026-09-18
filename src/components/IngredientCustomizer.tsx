import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, X } from 'lucide-react-native';
import { Dish } from '../types';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import ScalePressable from './ScalePressable';
import { radii } from '../theme/tokens';

interface IngredientCustomizerProps {
  dish: Dish;
  removedIds: string[];
  onToggleRemovable: (id: string) => void;
  onSelectSwap: (groupId: string, id: string) => void;
}

const IngredientCustomizer: React.FC<IngredientCustomizerProps> = ({
  dish,
  removedIds,
  onToggleRemovable,
  onSelectSwap,
}) => {
  const { profile } = useUser();
  const { colors } = useTheme();
  const fixed = dish.ingredients.filter((i) => !i.removable && !i.swapGroup);
  const swapGroups = Array.from(new Set(dish.ingredients.filter((i) => i.swapGroup).map((i) => i.swapGroup!)));
  const simpleRemovable = dish.ingredients.filter((i) => i.removable && !i.swapGroup);

  return (
    <View style={{ gap: 20 }}>
      {fixed.length > 0 && (
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>BASE</Text>
          <View style={styles.wrapRow}>
            {fixed.map((ing) => (
              <View key={ing.id} style={[styles.fixedChip, { borderColor: colors.border }]}>
                <Text style={[styles.fixedText, { color: colors.text }]}>{ing.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {swapGroups.map((group) => {
        const members = dish.ingredients.filter((i) => i.swapGroup === group);
        const selectedId =
          members.find((m) => removedIds.includes(m.id))?.id ??
          members.find((m) => m.isDefaultActive)?.id ??
          members[0].id;
        return (
          <View key={group}>
            <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>CHOOSE BASE</Text>
            <View style={{ gap: 8 }}>
              {members.map((m) => {
                const active = m.id === selectedId;
                const hasAllergen = m.allergens.some((a) => profile.allergens.includes(a));
                return (
                  <ScalePressable
                    key={m.id}
                    scaleTo={0.98}
                    onPress={() => onSelectSwap(group, m.id)}
                    style={[
                      styles.optionRow,
                      {
                        borderColor: active ? colors.accent : colors.border,
                        backgroundColor: active ? colors.surfaceAlt : 'transparent',
                      },
                    ]}
                  >
                    <View>
                      <Text style={[styles.optionText, { color: colors.text }]}>{m.name}</Text>
                      {hasAllergen && (
                        <Text style={[styles.allergenNote, { color: colors.coralText }]}>contains allergen</Text>
                      )}
                    </View>
                    {active && (
                      <View style={[styles.checkBubble, { backgroundColor: colors.accent }]}>
                        <Check size={12} strokeWidth={3} color={colors.accentText} />
                      </View>
                    )}
                  </ScalePressable>
                );
              })}
            </View>
          </View>
        );
      })}

      {simpleRemovable.length > 0 && (
        <View>
          <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>ADD-ONS &amp; EXTRAS</Text>
          <View style={{ gap: 8 }}>
            {simpleRemovable.map((ing) => {
              const removed = removedIds.includes(ing.id);
              const hasAllergen = ing.allergens.some((a) => profile.allergens.includes(a));
              return (
                <ScalePressable
                  key={ing.id}
                  scaleTo={0.98}
                  onPress={() => onToggleRemovable(ing.id)}
                  style={[
                    styles.optionRow,
                    {
                      borderColor: hasAllergen && !removed ? colors.coral : colors.border,
                      backgroundColor: hasAllergen && !removed ? colors.coralBg : 'transparent',
                      opacity: removed ? 0.5 : 1,
                    },
                  ]}
                >
                  <View>
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.text, textDecorationLine: removed ? 'line-through' : 'none' },
                      ]}
                    >
                      {ing.name}
                    </Text>
                    {!!ing.extraCost && !removed && (
                      <Text style={[styles.extraCost, { color: colors.accent }]}>+₹{ing.extraCost}</Text>
                    )}
                    {hasAllergen && !removed && (
                      <Text style={[styles.allergenNote, { color: colors.coralText }]}>
                        contains allergen you flagged
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.checkBubble,
                      { backgroundColor: removed ? colors.surfaceAlt : colors.text },
                    ]}
                  >
                    {removed ? (
                      <X size={12} strokeWidth={3} color={colors.textMuted} />
                    ) : (
                      <Check size={12} strokeWidth={3} color={colors.accent} />
                    )}
                  </View>
                </ScalePressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, marginBottom: 8 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  fixedChip: { borderRadius: 999, borderWidth: 2, paddingHorizontal: 12, paddingVertical: 6 },
  fixedText: { fontSize: 12, fontWeight: '600' },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.md,
    borderWidth: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionText: { fontSize: 13, fontWeight: '600' },
  allergenNote: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  extraCost: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  checkBubble: { height: 24, width: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});

export default IngredientCustomizer;
