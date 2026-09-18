import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  Pressable,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertTriangle, ChevronLeft, Minus, Plus, ShoppingBag } from 'lucide-react-native';
import { dishes } from '../data/mockData';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { computeDishMacros, computeDishPrice } from '../utils/calc';
import MacroRing from '../components/MacroRing';
import MacroBar from '../components/MacroBar';
import IngredientCustomizer from '../components/IngredientCustomizer';
import { DietGoalChip, AllergenChip } from '../components/Badges';
import ScalePressable from '../components/ScalePressable';
import type { HomeStackParamList } from '../navigation/types';

const PORTION_STEP = 50;

const DishDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'DishDetail'>>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, resolvedDark } = useTheme();
  const { profile } = useUser();
  const { addItem, lastConflictDish, resolveConflict } = useCart();

  const dish = dishes.find((d) => d.id === route.params.dishId);

  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [portionGrams, setPortionGrams] = useState<number>(dish?.baseGrams ?? 300);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const addedFade = useRef(new Animated.Value(0)).current;

  const activeIngredientIds = useMemo(() => {
    if (!dish) return [];
    return dish.ingredients.filter((i) => !removedIds.includes(i.id)).map((i) => i.id);
  }, [dish, removedIds]);

  const liveMacros = useMemo(() => {
    if (!dish) return null;
    return computeDishMacros(dish, removedIds, portionGrams);
  }, [dish, removedIds, portionGrams]);

  const unitPrice = useMemo(() => {
    if (!dish) return 0;
    return computeDishPrice(dish, activeIngredientIds);
  }, [dish, activeIngredientIds]);

  if (!dish) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>Dish not found.</Text>
      </View>
    );
  }

  const activeAllergens = Array.from(
    new Set(dish.ingredients.filter((i) => activeIngredientIds.includes(i.id)).flatMap((i) => i.allergens))
  );
  const flaggedAllergens = activeAllergens.filter((a) => profile.allergens.includes(a));
  const hasAllergyConflict = flaggedAllergens.length > 0;

  const toggleRemovable = (id: string) => {
    setRemovedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectSwap = (groupId: string, id: string) => {
    const groupMembers = dish.ingredients.filter((i) => i.swapGroup === groupId);
    const defaultId = groupMembers.find((m) => m.isDefaultActive)?.id ?? groupMembers[0].id;
    setRemovedIds((prev) => {
      const withoutGroup = prev.filter((x) => !groupMembers.some((m) => m.id === x));
      return id === defaultId ? withoutGroup : [...withoutGroup, id];
    });
  };

  const handleAddToCart = () => {
    const result = addItem(dish, { removedIngredientIds: removedIds, portionGrams, quantity });
    if (!result.conflict) {
      setJustAdded(true);
      Animated.sequence([
        Animated.timing(addedFade, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.delay(900),
        Animated.timing(addedFade, { toValue: 0, duration: 150, useNativeDriver: true }),
      ]).start(() => setJustAdded(false));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.hero}>
          <Image source={{ uri: dish.image }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <ScalePressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { top: insets.top + 8 }]}
          >
            <ChevronLeft size={20} strokeWidth={2.5} color="#12140F" />
          </ScalePressable>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>{dish.name}</Text>
          <Text style={[styles.description, { color: colors.textMuted }]}>{dish.description}</Text>

          <View style={styles.chipRow}>
            {dish.dietGoals.map((g) => (
              <DietGoalChip key={g} goal={g} active />
            ))}
          </View>

          {hasAllergyConflict && (
            <View style={[styles.warningBanner, { borderColor: colors.coral, backgroundColor: colors.coralBg }]}>
              <AlertTriangle size={16} color={colors.coralText} strokeWidth={2.5} style={{ marginTop: 1 }} />
              <Text style={[styles.warningText, { color: colors.coralText }]}>
                This dish currently contains {flaggedAllergens.join(', ')}, which you've flagged in your allergy
                profile. Adjust the ingredients below or choose a different dish.
              </Text>
            </View>
          )}

          <View style={styles.chipRow}>
            {dish.allergens.map((a) => (
              <AllergenChip key={a} allergen={a} flagged={profile.allergens.includes(a)} />
            ))}
          </View>

          {/* Nutrition label */}
          <View
            style={[
              styles.nutritionCard,
              { borderColor: resolvedDark ? colors.border : colors.text, backgroundColor: colors.surface },
            ]}
          >
            <View style={styles.nutritionHeader}>
              <Text style={[styles.nutritionTitle, { color: colors.text }]}>Nutrition · per serving</Text>
              <Text style={[styles.nutritionGrams, { color: colors.textMuted }]}>{portionGrams}g</Text>
            </View>
            {liveMacros && (
              <>
                <View style={styles.ringWrap}>
                  <MacroRing value={liveMacros.calories} max={800} label="Calories" unit="kcal" />
                </View>
                <View style={styles.barsWrap}>
                  <MacroBar label="Protein" value={liveMacros.protein} max={80} unit="g" color={colors.accent} />
                  <MacroBar label="Carbs" value={liveMacros.carbs} max={100} unit="g" color={colors.coral} />
                  <MacroBar label="Fats" value={liveMacros.fats} max={50} unit="g" color={colors.textFaint} />
                  <MacroBar label="Fiber" value={liveMacros.fiber} max={20} unit="g" color="#5E8310" />
                </View>
                <View style={[styles.microGrid, { borderTopColor: colors.border }]}>
                  <MicroStat value={liveMacros.omega3} label="Omega-3 mg" />
                  <MicroStat value={liveMacros.zinc} label="Zinc mg" />
                  <MicroStat value={liveMacros.magnesium} label="Magnesium mg" />
                </View>
              </>
            )}
          </View>

          {/* Portion size */}
          <View style={[styles.portionRow, { backgroundColor: colors.surfaceAlt }]}>
            <Text style={[styles.portionLabel, { color: colors.text }]}>Portion size</Text>
            <View style={styles.portionControls}>
              <ScalePressable
                onPress={() => setPortionGrams((g) => Math.max(150, g - PORTION_STEP))}
                style={[styles.portionButton, { backgroundColor: colors.text }]}
              >
                <Minus size={13} strokeWidth={3} color={colors.accent} />
              </ScalePressable>
              <Text style={[styles.portionValue, { color: colors.text }]}>{portionGrams}g</Text>
              <ScalePressable
                onPress={() => setPortionGrams((g) => Math.min(dish.baseGrams + 200, g + PORTION_STEP))}
                style={[styles.portionButton, { backgroundColor: colors.text }]}
              >
                <Plus size={13} strokeWidth={3} color={colors.accent} />
              </ScalePressable>
            </View>
          </View>

          {/* Ingredient customizer */}
          <View style={{ marginTop: 20 }}>
            <Text style={[styles.customizeTitle, { color: colors.text }]}>Customize ingredients</Text>
            <IngredientCustomizer
              dish={dish}
              removedIds={removedIds}
              onToggleRemovable={toggleRemovable}
              onSelectSwap={selectSwap}
            />
          </View>
        </View>
      </ScrollView>

      {/* Sticky add-to-cart bar */}
      <View
        style={[
          styles.stickyBar,
          { borderTopColor: resolvedDark ? colors.border : colors.text, backgroundColor: colors.background, paddingBottom: insets.bottom + 12 },
        ]}
      >
        <View style={[styles.qtyControl, { backgroundColor: colors.text }]}>
          <Pressable onPress={() => setQuantity((q) => Math.max(1, q - 1))} hitSlop={8}>
            <Minus size={14} strokeWidth={3} color={colors.accent} />
          </Pressable>
          <Text style={[styles.qtyValue, { color: colors.accent }]}>{quantity}</Text>
          <Pressable onPress={() => setQuantity((q) => q + 1)} hitSlop={8}>
            <Plus size={14} strokeWidth={3} color={colors.accent} />
          </Pressable>
        </View>
        <ScalePressable
          onPress={handleAddToCart}
          scaleTo={0.97}
          style={[styles.addButton, { backgroundColor: colors.accent }]}
        >
          {justAdded ? (
            <Animated.Text style={[styles.addButtonText, { color: colors.accentText, opacity: addedFade }]}>
              Added to cart ✓
            </Animated.Text>
          ) : (
            <View style={styles.addButtonInner}>
              <ShoppingBag size={16} strokeWidth={2.5} color={colors.accentText} />
              <Text style={[styles.addButtonText, { color: colors.accentText }]}>
                Add · ₹{unitPrice * quantity}
              </Text>
            </View>
          )}
        </ScalePressable>
      </View>

      {/* Cart conflict modal */}
      <Modal visible={!!lastConflictDish} transparent animationType="slide" onRequestClose={() => resolveConflict(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => resolveConflict(false)}>
          <Pressable style={[styles.modalSheet, { backgroundColor: colors.background, borderColor: resolvedDark ? colors.border : colors.text }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Start a new cart?</Text>
            <Text style={[styles.modalBody, { color: colors.textMuted }]}>
              Your cart has items from another shop. Adding this will clear your current cart.
            </Text>
            <View style={styles.modalActions}>
              <ScalePressable
                onPress={() => resolveConflict(false)}
                style={[styles.modalButtonOutline, { borderColor: colors.text }]}
              >
                <Text style={[styles.modalButtonText, { color: colors.text }]}>Keep current cart</Text>
              </ScalePressable>
              <ScalePressable
                onPress={() => resolveConflict(true)}
                style={[styles.modalButtonFilled, { backgroundColor: colors.coral }]}
              >
                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Clear &amp; add</Text>
              </ScalePressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

const MicroStat: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  const { colors } = useTheme();
  return (
    <View style={styles.microStat}>
      <Text style={[styles.microValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.microLabel, { color: colors.textFaint }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 224, width: '100%' },
  heroImage: { height: '100%', width: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,20,15,0.25)' },
  backButton: {
    position: 'absolute',
    left: 16,
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { paddingHorizontal: 16, paddingTop: 16 },
  title: { fontSize: 21, fontWeight: '800' },
  description: { fontSize: 13, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  warningBanner: { flexDirection: 'row', gap: 8, borderWidth: 2, borderRadius: 14, padding: 12, marginTop: 12 },
  warningText: { flex: 1, fontSize: 12, fontWeight: '600' },
  nutritionCard: { borderWidth: 2, borderRadius: 18, padding: 16, marginTop: 18 },
  nutritionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nutritionTitle: { fontSize: 13, fontWeight: '700' },
  nutritionGrams: { fontSize: 12, fontWeight: '600', fontVariant: ['tabular-nums'] },
  ringWrap: { alignItems: 'center', marginTop: 12 },
  barsWrap: { gap: 10, marginTop: 16 },
  microGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 2, paddingTop: 12, marginTop: 16 },
  microStat: { alignItems: 'center', flex: 1 },
  microValue: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  microLabel: { fontSize: 10, marginTop: 2 },
  portionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, marginTop: 18 },
  portionLabel: { fontSize: 14, fontWeight: '700' },
  portionControls: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  portionButton: { height: 28, width: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  portionValue: { width: 48, textAlign: 'center', fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  customizeTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  stickyBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 2,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 10 },
  qtyValue: { minWidth: 14, textAlign: 'center', fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  addButton: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  addButtonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addButtonText: { fontSize: 14, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(18,20,15,0.5)', justifyContent: 'flex-end' },
  modalSheet: { borderTopWidth: 2, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalBody: { fontSize: 13, marginTop: 6 },
  modalActions: { flexDirection: 'row', gap: 12, marginTop: 18 },
  modalButtonOutline: { flex: 1, borderWidth: 2, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  modalButtonFilled: { flex: 1, borderRadius: 999, paddingVertical: 12, alignItems: 'center' },
  modalButtonText: { fontSize: 13, fontWeight: '700' },
});

export default DishDetailScreen;
