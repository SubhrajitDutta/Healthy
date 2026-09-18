import React, { Fragment, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Rect, Line, Path, Circle } from 'react-native-svg';
import { Bike, CheckCircle2, Phone, MessageCircle, X, Star } from 'lucide-react-native';
import { shops, deliveryPartners } from '../data/mockData';
import { estimateEtaMinutes } from '../utils/calc';
import { useTheme } from '../context/ThemeContext';
import ScalePressable from '../components/ScalePressable';
import type { CartStackParamList } from '../navigation/types';
import { OrderStage } from '../types';

const STAGES: { key: OrderStage; label: string }[] = [
  { key: 'placed', label: 'Order placed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'picked-up', label: 'Picked up' },
  { key: 'on-the-way', label: 'On the way' },
  { key: 'delivered', label: 'Delivered' },
];

// Cubic bezier control points mirroring the web app's SVG path from shop -> home.
const P0 = { x: 40, y: 220 };
const P1 = { x: 100, y: 120 };
const P2 = { x: 220, y: 120 };
const P3 = { x: 300, y: 40 };

function bezierPoint(t: number) {
  const mt = 1 - t;
  const x = mt ** 3 * P0.x + 3 * mt ** 2 * t * P1.x + 3 * mt * t ** 2 * P2.x + t ** 3 * P3.x;
  const y = mt ** 3 * P0.y + 3 * mt ** 2 * t * P1.y + 3 * mt * t ** 2 * P2.y + t ** 3 * P3.y;
  return { x, y };
}

function stageForProgress(p: number): OrderStage {
  if (p < 0.08) return 'placed';
  if (p < 0.32) return 'preparing';
  if (p < 0.42) return 'picked-up';
  if (p < 0.98) return 'on-the-way';
  return 'delivered';
}

const OrderTrackingScreen: React.FC = () => {
  const route = useRoute<RouteProp<CartStackParamList, 'Tracking'>>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors, resolvedDark } = useTheme();
  const params = route.params;

  const shop = shops.find((s) => s.id === params.shopId) ?? shops[0];
  const partner = deliveryPartners[0];
  const distanceKm = params.distanceKm ?? shop.distanceKm;

  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setProgress((p) => Math.min(1, p + 0.01));
    }, 180);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const stage = stageForProgress(progress);
  const stageIndex = STAGES.findIndex((s) => s.key === stage);
  const point = bezierPoint(progress);

  const remainingKm = Math.max(0.1, Math.round(distanceKm * (1 - progress) * 10) / 10);
  const etaMinutes = Math.max(1, estimateEtaMinutes(remainingKm, stage === 'preparing' ? 6 : 0));

  const mapBg = resolvedDark ? '#1B1E16' : '#F5FDE8';
  const roadColor = resolvedDark ? '#282C22' : '#FFFFFF';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.eyebrow, { color: colors.textFaint }]}>Order from</Text>
          <Text style={[styles.shopName, { color: colors.text }]}>{shop.name}</Text>
        </View>
        <ScalePressable
          onPress={() => (navigation.getParent() as any)?.navigate('HomeTab')}
          style={[styles.closeButton, { borderColor: colors.text }]}
        >
          <X size={18} strokeWidth={2.5} color={colors.text} />
        </ScalePressable>
      </View>

      {/* Simulated map */}
      <View style={[styles.mapCard, { borderColor: resolvedDark ? colors.border : colors.text, backgroundColor: mapBg }]}>
        <Svg viewBox="0 0 340 260" style={{ height: '100%', width: '100%' }}>
          <Rect x={0} y={0} width={340} height={260} fill={mapBg} />
          {[40, 100, 160, 220].map((y) => (
            <Line key={`h-${y}`} x1={0} y1={y} x2={340} y2={y} strokeWidth={10} stroke={roadColor} />
          ))}
          {[60, 150, 260].map((x) => (
            <Line key={`v-${x}`} x1={x} y1={0} x2={x} y2={260} strokeWidth={10} stroke={roadColor} />
          ))}
          <Path
            d="M 40 220 C 100 120, 220 120, 300 40"
            fill="none"
            strokeWidth={3}
            strokeDasharray="7 6"
            stroke={colors.accent}
          />
          <Circle cx={P0.x} cy={P0.y} r={9} fill={colors.text} />
          <Circle cx={P0.x} cy={P0.y} r={4} fill={colors.accent} />
          <Circle cx={P3.x} cy={P3.y} r={9} fill={colors.coral} />
          <Circle cx={P3.x} cy={P3.y} r={4} fill="#fff" />
        </Svg>
        <View
          style={[
            styles.marker,
            { backgroundColor: colors.text, left: point.x - 16, top: point.y - 16 },
          ]}
        >
          <Bike size={16} strokeWidth={2.5} color={colors.accent} />
        </View>
        <View style={[styles.mapLabel, { backgroundColor: resolvedDark ? 'rgba(27,30,22,0.9)' : 'rgba(255,255,255,0.9)' }]}>
          <Text style={[styles.mapLabelText, { color: colors.text }]}>
            {stage === 'delivered' ? 'Delivered' : `${partner.name} is ${remainingKm} km away · ETA ${etaMinutes} min`}
          </Text>
        </View>
      </View>

      {/* Progress tracker */}
      <View style={[styles.trackerCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={styles.trackerRow}>
          {STAGES.map((s, i) => (
            <Fragment key={s.key}>
              <View style={styles.stageItem}>
                <View
                  style={[
                    styles.stageDot,
                    { backgroundColor: i <= stageIndex ? colors.accent : colors.surfaceAlt },
                  ]}
                >
                  {i < stageIndex || stage === 'delivered' ? (
                    <CheckCircle2 size={14} strokeWidth={2.5} color={colors.accentText} />
                  ) : (
                    <Text style={[styles.stageNumber, { color: i <= stageIndex ? colors.accentText : colors.textFaint }]}>
                      {i + 1}
                    </Text>
                  )}
                </View>
                <Text style={[styles.stageLabel, { color: colors.textMuted }]}>{s.label}</Text>
              </View>
              {i < STAGES.length - 1 && (
                <View
                  style={[
                    styles.stageConnector,
                    { backgroundColor: i < stageIndex ? colors.accent : colors.surfaceAlt },
                  ]}
                />
              )}
            </Fragment>
          ))}
        </View>
      </View>

      {/* Partner card */}
      <View style={[styles.partnerCard, { borderColor: colors.border, backgroundColor: colors.surface }]}>
        <View style={[styles.partnerAvatar, { backgroundColor: colors.surfaceAlt }]}>
          <Text style={[styles.partnerInitials, { color: colors.text }]}>
            {partner.name.split(' ').map((w) => w[0]).join('')}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.partnerName, { color: colors.text }]}>{partner.name}</Text>
          <View style={styles.partnerMetaRow}>
            <Text style={[styles.partnerMeta, { color: colors.textMuted }]}>{partner.vehicle}</Text>
            <Star size={11} fill={colors.accent} color={colors.accent} />
            <Text style={[styles.partnerMeta, { color: colors.textMuted }]}>{partner.rating}</Text>
          </View>
        </View>
        <ScalePressable style={[styles.iconButton, { backgroundColor: colors.text }]}>
          <Phone size={15} strokeWidth={2.5} color={colors.accent} />
        </ScalePressable>
        <ScalePressable style={[styles.iconButtonOutline, { borderColor: colors.text }]}>
          <MessageCircle size={15} strokeWidth={2.5} color={colors.text} />
        </ScalePressable>
      </View>

      <View style={[styles.orderMeta, { backgroundColor: colors.surfaceAlt }]}>
        <View style={styles.metaRow}>
          <Text style={{ color: colors.textMuted }}>Items</Text>
          <Text style={[styles.metaValue, { color: colors.text }]}>{params.itemCount ?? '—'}</Text>
        </View>
        <View style={[styles.metaRow, { marginTop: 4 }]}>
          <Text style={{ color: colors.textMuted }}>Total paid</Text>
          <Text style={[styles.metaValueBold, { color: colors.text }]}>₹{params.grandTotal ?? '—'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16 },
  eyebrow: { fontSize: 11 },
  shopName: { fontSize: 16, fontWeight: '700' },
  closeButton: { height: 36, width: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  mapCard: { height: 256, marginHorizontal: 16, marginTop: 12, borderRadius: 18, borderWidth: 2, overflow: 'hidden' },
  marker: {
    position: 'absolute',
    height: 32,
    width: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapLabel: { position: 'absolute', left: 12, top: 12, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  mapLabelText: { fontSize: 11, fontWeight: '700' },
  trackerCard: { marginHorizontal: 16, marginTop: 20, borderWidth: 2, borderRadius: 18, padding: 16 },
  trackerRow: { flexDirection: 'row', alignItems: 'center' },
  stageItem: { alignItems: 'center', gap: 4 },
  stageDot: { height: 24, width: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stageNumber: { fontSize: 10, fontWeight: '700' },
  stageLabel: { width: 56, textAlign: 'center', fontSize: 9, fontWeight: '600' },
  stageConnector: { height: 2, flex: 1, marginBottom: 14 },
  partnerCard: { flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginTop: 16, borderWidth: 2, borderRadius: 18, padding: 16 },
  partnerAvatar: { height: 44, width: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  partnerInitials: { fontWeight: '700' },
  partnerName: { fontSize: 14, fontWeight: '700' },
  partnerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  partnerMeta: { fontSize: 12 },
  iconButton: { height: 36, width: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  iconButtonOutline: { height: 36, width: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  orderMeta: { marginHorizontal: 16, marginTop: 16, marginBottom: 32, borderRadius: 18, padding: 16 },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  metaValue: { fontWeight: '600', fontVariant: ['tabular-nums'] },
  metaValueBold: { fontWeight: '700', fontVariant: ['tabular-nums'] },
});

export default OrderTrackingScreen;
