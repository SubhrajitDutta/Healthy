import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Flame, AlertTriangle } from 'lucide-react-native';
import { Dish } from '../types';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import ScalePressable from './ScalePressable';
import { radii } from '../theme/tokens';
import type { HomeStackNavProp } from '../navigation/types';

interface DishCardProps {
  dish: Dish;
  shopId: string;
}

const DishCard: React.FC<DishCardProps> = ({ dish, shopId }) => {
  const navigation = useNavigation<HomeStackNavProp>();
  const { profile } = useUser();
  const { colors } = useTheme();
  const flaggedAllergens = dish.allergens.filter((a) => profile.allergens.includes(a));
  const hasConflict = flaggedAllergens.length > 0;

  return (
    <ScalePressable
      onPress={() => navigation.navigate('DishDetail', { shopId, dishId: dish.id })}
      style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}
    >
      <Image source={{ uri: dish.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {dish.name}
        </Text>
        <Text style={[styles.desc, { color: colors.textMuted }]} numberOfLines={2}>
          {dish.description}
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Flame size={12} strokeWidth={2.5} color={colors.coralText} />
            <Text style={[styles.statText, { color: colors.coralText }]}>{dish.baseMacros.calories} kcal</Text>
          </View>
          <Text style={[styles.statText, { color: colors.textMuted }]}>P {dish.baseMacros.protein}g</Text>
          {hasConflict && (
            <View style={[styles.allergyChip, { backgroundColor: colors.coralBg }]}>
              <AlertTriangle size={10} strokeWidth={3} color={colors.coralText} />
              <Text style={[styles.allergyText, { color: colors.coralText }]}>Contains allergen</Text>
            </View>
          )}
        </View>
        <Text style={[styles.price, { color: colors.text }]}>₹{dish.basePrice}</Text>
      </View>
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    borderRadius: radii.md,
    borderWidth: 2,
    padding: 10,
  },
  image: { height: 80, width: 80, borderRadius: radii.sm },
  body: { flex: 1, paddingVertical: 2 },
  title: { fontSize: 14, fontWeight: '700' },
  desc: { fontSize: 12, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' },
  statChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  allergyChip: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 },
  allergyText: { fontSize: 10, fontWeight: '700' },
  price: { fontSize: 14, fontWeight: '800', marginTop: 6, fontVariant: ['tabular-nums'] },
});

export default DishCard;
