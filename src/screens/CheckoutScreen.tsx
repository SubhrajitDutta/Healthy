import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MapPin,
  Zap,
  CalendarClock,
  Wallet,
  CreditCard,
  Smartphone,
  Banknote,
  Check,
} from 'lucide-react-native';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { shops, USER_LOCATION } from '../data/mockData';
import { haversineKm, computeDeliveryFee } from '../utils/calc';
import PageHeader from '../components/PageHeader';
import ScalePressable from '../components/ScalePressable';
import type { CartStackNavProp } from '../navigation/types';

type PaymentMethod = 'upi' | 'card' | 'wallet' | 'cod';

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { id: 'upi', label: 'UPI', icon: Smartphone },
  { id: 'card', label: 'Card', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
  { id: 'cod', label: 'Cash on delivery', icon: Banknote },
];

const CheckoutScreen: React.FC = () => {
  const { items, totals, shopId, clearCart } = useCart();
  const navigation = useNavigation<CartStackNavProp>();
  const insets = useSafeAreaInsets();
  const { colors, resolvedDark } = useTheme();
  const [slot, setSlot] = useState<'instant' | 'scheduled'>('instant');
  const [payment, setPayment] = useState<PaymentMethod>('upi');
  const [placing, setPlacing] = useState(false);

  const shop = shops.find((s) => s.id === shopId);
  const distanceKm = useMemo(() => {
    if (!shop) return 0;
    return Math.round(haversineKm(shop.lat, shop.lng, USER_LOCATION.lat, USER_LOCATION.lng) * 10) / 10;
  }, [shop]);

  const isPeakHour = new Date().getHours() >= 19 && new Date().getHours() <= 21;
  const deliveryFee = computeDeliveryFee(distanceKm, isPeakHour);
  const taxes = Math.round(totals.subtotal * 0.05);
  const grandTotal = totals.subtotal + deliveryFee + taxes;

  const handlePlaceOrder = () => {
    setPlacing(true);
    setTimeout(() => {
      navigation.navigate('Tracking', {
        shopId,
        distanceKm,
        deliveryFee,
        grandTotal,
        itemCount: items.reduce((s, i) => s + i.quantity, 0),
      });
      clearCart();
      setPlacing(false);
    }, 700);
  };

  if (items.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <PageHeader title="Checkout" />
        <Text style={{ textAlign: 'center', color: colors.textMuted, paddingVertical: 40 }}>
          Your cart is empty.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <PageHeader title="Checkout" subtitle={shop?.name} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120, gap: 16 }} showsVerticalScrollIndicator={false}>
        {/* Address */}
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <View style={styles.cardHeaderRow}>
            <MapPin size={16} color={colors.accent} strokeWidth={2.5} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Delivery address</Text>
          </View>
          <Text style={[styles.addressLine, { color: colors.textMuted }]}>Home · {USER_LOCATION.label}</Text>
          <Text style={[styles.addressSub, { color: colors.textFaint }]}>
            {distanceKm} km from {shop?.name}
          </Text>
          <Text style={[styles.changeLink, { color: colors.accent }]}>Change address</Text>
        </View>

        {/* Delivery slot */}
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Delivery slot</Text>
          <View style={styles.slotRow}>
            <ScalePressable
              onPress={() => setSlot('instant')}
              scaleTo={0.97}
              style={[
                styles.slotOption,
                slot === 'instant'
                  ? { borderColor: colors.accent, backgroundColor: colors.surfaceAlt }
                  : { borderColor: colors.border },
              ]}
            >
              <Zap size={18} color={colors.accent} strokeWidth={2.5} />
              <Text style={[styles.slotLabel, { color: colors.text }]}>Instant</Text>
              <Text style={[styles.slotSub, { color: colors.textFaint }]}>
                {shop?.etaMinutes[0]}–{shop?.etaMinutes[1]} min
              </Text>
            </ScalePressable>
            <ScalePressable
              onPress={() => setSlot('scheduled')}
              scaleTo={0.97}
              style={[
                styles.slotOption,
                slot === 'scheduled'
                  ? { borderColor: colors.accent, backgroundColor: colors.surfaceAlt }
                  : { borderColor: colors.border },
              ]}
            >
              <CalendarClock size={18} color={colors.accent} strokeWidth={2.5} />
              <Text style={[styles.slotLabel, { color: colors.text }]}>Schedule</Text>
              <Text style={[styles.slotSub, { color: colors.textFaint }]}>Pick a time</Text>
            </ScalePressable>
          </View>
        </View>

        {/* Payment */}
        <View style={[styles.card, { borderColor: colors.border, backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Payment method</Text>
          <View style={{ gap: 8 }}>
            {PAYMENT_OPTIONS.map(({ id, label, icon: Icon }) => (
              <ScalePressable
                key={id}
                onPress={() => setPayment(id)}
                scaleTo={0.98}
                style={[
                  styles.paymentRow,
                  payment === id
                    ? { borderColor: colors.accent, backgroundColor: colors.surfaceAlt }
                    : { borderColor: colors.border },
                ]}
              >
                <View style={styles.paymentLabelRow}>
                  <Icon size={16} color={colors.text} />
                  <Text style={[styles.paymentLabel, { color: colors.text }]}>{label}</Text>
                </View>
                {payment === id && (
                  <View style={[styles.checkBubble, { backgroundColor: colors.accent }]}>
                    <Check size={12} strokeWidth={3} color={colors.accentText} />
                  </View>
                )}
              </ScalePressable>
            ))}
          </View>
        </View>

        {/* Order summary */}
        <View
          style={[
            styles.card,
            { borderColor: resolvedDark ? colors.border : colors.text, backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 12 }]}>Order summary</Text>
          <Row label="Subtotal" value={`₹${totals.subtotal}`} colors={colors} />
          <Row label={`Delivery fee${isPeakHour ? ' · peak hour' : ''}`} value={`₹${deliveryFee}`} colors={colors} />
          <Row label="Taxes" value={`₹${taxes}`} colors={colors} />
          <View style={[styles.divider, { borderColor: colors.border }]} />
          <Row label="Total" value={`₹${grandTotal}`} bold colors={colors} />
        </View>
      </ScrollView>

      <View style={[styles.placeOrderWrap, { paddingBottom: insets.bottom + 16, backgroundColor: colors.background }]}>
        <ScalePressable
          onPress={handlePlaceOrder}
          scaleTo={0.97}
          style={[styles.placeOrderButton, { backgroundColor: colors.accent, opacity: placing ? 0.6 : 1 }]}
        >
          <Text style={[styles.placeOrderText, { color: colors.accentText }]}>
            {placing ? 'Placing order…' : `Place order · ₹${grandTotal}`}
          </Text>
        </ScalePressable>
      </View>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string; bold?: boolean; colors: any }> = ({ label, value, bold, colors }) => (
  <View style={styles.summaryRow}>
    <Text style={[bold ? styles.rowLabelBold : styles.rowLabel, { color: bold ? colors.text : colors.textMuted }]}>
      {label}
    </Text>
    <Text style={[bold ? styles.rowValueBold : styles.rowValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: { borderWidth: 2, borderRadius: 18, padding: 16 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700' },
  addressLine: { fontSize: 14, marginTop: 6 },
  addressSub: { fontSize: 12, marginTop: 2 },
  changeLink: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  slotRow: { flexDirection: 'row', gap: 10 },
  slotOption: { flex: 1, alignItems: 'center', gap: 4, borderWidth: 2, borderRadius: 14, paddingVertical: 12 },
  slotLabel: { fontSize: 12, fontWeight: '700' },
  slotSub: { fontSize: 10 },
  paymentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 2, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  paymentLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  paymentLabel: { fontSize: 13, fontWeight: '600' },
  checkBubble: { height: 20, width: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 13, fontWeight: '600', fontVariant: ['tabular-nums'] },
  rowLabelBold: { fontSize: 15, fontWeight: '700' },
  rowValueBold: { fontSize: 15, fontWeight: '800', fontVariant: ['tabular-nums'] },
  divider: { borderTopWidth: 1, borderStyle: 'dashed', marginVertical: 8 },
  placeOrderWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 8 },
  placeOrderButton: { borderRadius: 999, paddingVertical: 16, alignItems: 'center' },
  placeOrderText: { fontSize: 14, fontWeight: '700' },
});

export default CheckoutScreen;
