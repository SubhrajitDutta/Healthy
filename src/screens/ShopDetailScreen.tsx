import React from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Star, Clock, MapPin, ChevronLeft, Leaf } from 'lucide-react-native';
import { shops, dishes } from '../data/mockData';
import DishCard from '../components/DishCard';
import ScalePressable from '../components/ScalePressable';
import { useTheme } from '../context/ThemeContext';
import type { HomeStackParamList } from '../navigation/types';

const ShopDetailScreen: React.FC = () => {
  const route = useRoute<RouteProp<HomeStackParamList, 'ShopDetail'>>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const shop = shops.find((s) => s.id === route.params.shopId);
  const shopDishes = dishes.filter((d) => d.shopId === route.params.shopId);

  if (!shop) {
    return (
      <View style={[styles.notFound, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textMuted }}>Shop not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image source={{ uri: shop.image }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <ScalePressable
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { top: insets.top + 8 }]}
        >
          <ChevronLeft size={20} strokeWidth={2.5} color="#12140F" />
        </ScalePressable>
        {shop.type === 'healthy-kitchen' && (
          <View style={[styles.kitchenBadge, { top: insets.top + 8, backgroundColor: colors.accent }]}>
            <Leaf size={13} strokeWidth={3} color={colors.accentText} />
            <Text style={[styles.kitchenBadgeText, { color: colors.accentText }]}>Healthy Kitchen</Text>
          </View>
        )}
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTitle}>{shop.name}</Text>
          <Text style={styles.heroSubtitle}>{shop.cuisine}</Text>
        </View>
      </View>

      <View style={[styles.statsRow, { borderBottomColor: colors.border }]}>
        <View style={styles.statItem}>
          <Star size={14} fill={colors.accent} color={colors.accent} />
          <Text style={[styles.statBold, { color: colors.text }]}>{shop.rating}</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>({shop.ratingCount})</Text>
        </View>
        <View style={styles.statItem}>
          <Clock size={14} color={colors.textMuted} />
          <Text style={[styles.statSemibold, { color: colors.textMuted }]}>
            {shop.etaMinutes[0]}–{shop.etaMinutes[1]} min
          </Text>
        </View>
        <View style={styles.statItem}>
          <MapPin size={14} color={colors.textMuted} />
          <Text style={[styles.statSemibold, { color: colors.textMuted }]}>{shop.distanceKm} km</Text>
        </View>
      </View>

      <View style={styles.dishList}>
        {shopDishes.map((dish) => (
          <DishCard key={dish.id} dish={dish} shopId={shop.id} />
        ))}
        {shopDishes.length === 0 && (
          <Text style={{ textAlign: 'center', color: colors.textMuted, paddingVertical: 32 }}>
            No dishes listed for this shop yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { height: 200, width: '100%', position: 'relative' },
  heroImage: { height: '100%', width: '100%' },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,20,15,0.28)' },
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
  kitchenBadge: {
    position: 'absolute',
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  kitchenBadgeText: { fontSize: 12, fontWeight: '700' },
  heroTextWrap: { position: 'absolute', bottom: 12, left: 16, right: 16 },
  heroTitle: { fontSize: 21, fontWeight: '800', color: '#fff' },
  heroSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statBold: { fontSize: 13, fontWeight: '700' },
  statSemibold: { fontSize: 13, fontWeight: '600' },
  dishList: { padding: 16, gap: 10 },
});

export default ShopDetailScreen;
