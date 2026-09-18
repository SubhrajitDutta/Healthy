import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Star, Leaf } from 'lucide-react-native';
import { Shop } from '../types';
import { useTheme } from '../context/ThemeContext';
import ScalePressable from './ScalePressable';
import { chunkyShadow, radii } from '../theme/tokens';
import type { HomeStackNavProp } from '../navigation/types';

const ShopCard: React.FC<{ shop: Shop }> = ({ shop }) => {
  const { colors, resolvedDark } = useTheme();
  const navigation = useNavigation<HomeStackNavProp>();
  const isHealthyKitchen = shop.type === 'healthy-kitchen';

  return (
    <ScalePressable
      onPress={() => navigation.navigate('ShopDetail', { shopId: shop.id })}
      style={[
        styles.card,
        {
          borderColor: resolvedDark ? colors.border : colors.text,
          backgroundColor: colors.surface,
        },
        !resolvedDark && chunkyShadow(colors.text),
      ]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: shop.image }} style={styles.image} />
        {isHealthyKitchen && (
          <View style={[styles.badge, styles.badgeLeft, { backgroundColor: colors.accent }]}>
            <Leaf size={11} strokeWidth={3} color={colors.accentText} />
            <Text style={[styles.badgeText, { color: colors.accentText }]}>Healthy Kitchen</Text>
          </View>
        )}
        <View style={[styles.badge, styles.badgeRight, { backgroundColor: 'rgba(18,20,15,0.8)' }]}>
          <Text style={[styles.badgeText, { color: colors.accent }]}>
            {shop.etaMinutes[0]}–{shop.etaMinutes[1]} min
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {shop.name}
          </Text>
          <View style={[styles.rating, { backgroundColor: resolvedDark ? 'rgba(183,241,53,0.15)' : '#E9FBC9' }]}>
            <Star size={11} color={resolvedDark ? colors.accent : '#7CAE14'} fill={resolvedDark ? colors.accent : '#7CAE14'} />
            <Text style={[styles.ratingText, { color: colors.textMuted }]}>{shop.rating}</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          {shop.cuisine} · {shop.distanceKm} km
        </Text>
      </View>
    </ScalePressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 2,
    overflow: 'hidden',
    flex: 1,
  },
  imageWrap: { height: 96, width: '100%' },
  image: { height: '100%', width: '100%' },
  badge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeLeft: { left: 6, top: 6 },
  badgeRight: { right: 6, top: 6 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  body: { padding: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 },
  title: { fontSize: 13, fontWeight: '700', flex: 1 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 2, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  ratingText: { fontSize: 11, fontWeight: '700' },
  subtitle: { fontSize: 11, marginTop: 2 },
});

export default ShopCard;
