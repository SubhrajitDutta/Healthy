import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Trash2, ShoppingBag, Flame } from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import PageHeader from '../components/PageHeader';
import QuantityStepper from '../components/QuantityStepper';
import MacroBar from '../components/MacroBar';
import ScalePressable from '../components/ScalePressable';
import type { CartStackNavProp } from '../navigation/types';

const CartScreen: React.FC = () => {
  const { items, updateQuantity, removeItem, totals, clearCart } = useCart();
  const navigation = useNavigation<CartStackNavProp>();
  const insets = useSafeAreaInsets();
  const { colors, resolvedDark } = useTheme();

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <PageHeader title="Your cart" />
        <View style={styles.emptyWrap}>
          <View style={[styles.emptyIconWrap, { backgroundColor: resolvedDark ? 'rgba(183,241,53,0.15)' : '#E9FBC9' }]}>
            <ShoppingBag size={32} color={colors.accent} strokeWidth={2} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is hungry</Text>
          <Text style={[styles.emptySubtitle, { color: colors.textMuted }]}>
            Browse Healthy Kitchens and build a meal around your goals.
          </Text>
          <ScalePressable
            onPress={() => (navigation.getParent() as any)?.navigate('HomeTab')}
            style={[styles.browseButton, { backgroundColor: colors.accent }]}
          >
            <Text style={[styles.browseButtonText, { color: colors.accentText }]}>Browse Healthy Kitchens</Text>
          </ScalePressable>
        </View>
      </View>
    );
  }

  const proteinGap = 60 - totals.totalMacros.protein;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <PageHeader
        title="Your cart"
        subtitle={`${items.length} item${items.length > 1 ? 's' : ''}`}
        right={
          <ScalePressable onPress={clearCart}>
            <Text style={[styles.clearText, { color: colors.coralText }]}>Clear</Text>
          </ScalePressable>
        }
      />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140, gap: 12 }} showsVerticalScrollIndicator={false}>
        {items.map((item) => {
          const activeIngredients = item.dish.ingredients.filter((i) => !item.removedIngredientIds.includes(i.id));
          return (
            <View
              key={item.id}
              style={[styles.itemCard, { borderColor: colors.border, backgroundColor: colors.surface }]}
            >
              <Image source={{ uri: item.dish.image }} style={styles.itemImage} />
              <View style={{ flex: 1 }}>
                <View style={styles.itemTitleRow}>
                  <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.dish.name}
                  </Text>
                  <ScalePressable onPress={() => removeItem(item.id)} hitSlop={8}>
                    <Trash2 size={15} color={colors.textFaint} />
                  </ScalePressable>
                </View>
                <Text style={[styles.itemMeta, { color: colors.textMuted }]}>
                  {item.portionGrams}g · {activeIngredients.length} ingredients
                </Text>
                <View style={styles.itemFooter}>
                  <QuantityStepper compact quantity={item.quantity} onChange={(q) => updateQuantity(item.id, q)} />
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    ₹{item.dish.basePrice * item.quantity}
                  </Text>
                </View>
              </View>
            </View>
          );
        })}

        {proteinGap > 15 && (
          <View style={[styles.nudge, { borderColor: colors.accent, backgroundColor: resolvedDark ? 'rgba(183,241,53,0.1)' : '#F5FDE8' }]}>
            <Text style={[styles.nudgeText, { color: resolvedDark ? '#D6F694' : '#3F580B' }]}>
              Add a high-protein side for ₹49 to close your protein gap
            </Text>
            <View style={[styles.nudgeButton, { backgroundColor: colors.accent }]}>
              <Text style={[styles.nudgeButtonText, { color: colors.accentText }]}>Add</Text>
            </View>
          </View>
        )}

        <View
          style={[
            styles.summaryCard,
            { borderColor: resolvedDark ? colors.border : colors.text, backgroundColor: colors.surface },
          ]}
        >
          <View style={styles.summaryHeader}>
            <Flame size={16} color={colors.coral} strokeWidth={2.5} />
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Cart nutrition total</Text>
          </View>
          <Text style={[styles.summaryCalories, { color: colors.text }]}>
            {Math.round(totals.totalMacros.calories)} <Text style={styles.summaryUnit}>kcal</Text>
          </Text>
          <View style={{ gap: 10, marginTop: 12 }}>
            <MacroBar label="Protein" value={Math.round(totals.totalMacros.protein)} max={150} unit="g" color={colors.accent} />
            <MacroBar label="Carbs" value={Math.round(totals.totalMacros.carbs)} max={180} unit="g" color={colors.coral} />
            <MacroBar label="Fats" value={Math.round(totals.totalMacros.fats)} max={90} unit="g" color={colors.textFaint} />
          </View>
        </View>
      </ScrollView>

      <View style={[styles.checkoutBarWrap, { bottom: insets.bottom + 84 }]}>
        <ScalePressable
          onPress={() => navigation.navigate('Checkout')}
          scaleTo={0.97}
          style={[styles.checkoutBar, { backgroundColor: colors.text }]}
        >
          <Text style={[styles.checkoutLabel, { color: colors.accent }]}>Proceed to checkout</Text>
          <Text style={[styles.checkoutTotal, { color: colors.accent }]}>₹{totals.subtotal}</Text>
        </ScalePressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyWrap: { alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 32, paddingVertical: 96 },
  emptyIconWrap: { height: 80, width: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', marginTop: 4 },
  browseButton: { borderRadius: 999, paddingHorizontal: 24, paddingVertical: 12 },
  browseButtonText: { fontSize: 13, fontWeight: '700' },
  clearText: { fontSize: 12, fontWeight: '700' },
  itemCard: { flexDirection: 'row', gap: 12, borderWidth: 2, borderRadius: 18, padding: 12 },
  itemImage: { height: 64, width: 64, borderRadius: 12 },
  itemTitleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  itemTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  itemMeta: { fontSize: 11, marginTop: 2 },
  itemFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  itemPrice: { fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] },
  nudge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderStyle: 'dashed', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  nudgeText: { flex: 1, fontSize: 12, fontWeight: '600' },
  nudgeButton: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  nudgeButtonText: { fontSize: 11, fontWeight: '700' },
  summaryCard: { borderWidth: 2, borderRadius: 18, padding: 16 },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryTitle: { fontSize: 13, fontWeight: '700' },
  summaryCalories: { fontSize: 24, fontWeight: '800', marginTop: 4, fontVariant: ['tabular-nums'] },
  summaryUnit: { fontSize: 13, fontWeight: '400' },
  checkoutBarWrap: { position: 'absolute', left: 16, right: 16 },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  checkoutLabel: { fontSize: 14, fontWeight: '700' },
  checkoutTotal: { fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] },
});

export default CartScreen;
