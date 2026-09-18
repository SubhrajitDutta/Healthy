import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, ShoppingBag, UserRound } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

const ICONS: Record<string, React.ElementType> = {
  HomeTab: Home,
  CartTab: ShoppingBag,
  ProfileTab: UserRound,
};

const LABELS: Record<string, string> = {
  HomeTab: 'Home',
  CartTab: 'Cart',
  ProfileTab: 'Profile',
};

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation, descriptors }) => {
  const { colors } = useTheme();
  const { itemCount } = useCart();
  const insets = useSafeAreaInsets();

  const focusedOptions = descriptors[state.routes[state.index].key]?.options;
  const hideBar = (focusedOptions?.tabBarStyle as { display?: string } | undefined)?.display === 'none';
  if (hideBar) return null;

  return (
    <View
      style={[
        styles.bar,
        { borderTopColor: colors.border, backgroundColor: colors.background, paddingBottom: insets.bottom + 6 },
      ]}
    >
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const Icon = ICONS[route.name] ?? Home;
        const label = LABELS[route.name] ?? route.name;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={styles.tabItem} hitSlop={8}>
            <View style={{ alignItems: 'center' }}>
              <Icon size={22} strokeWidth={focused ? 2.6 : 2} color={focused ? colors.accent : colors.navInactive} />
              <Text style={[styles.label, { color: focused ? colors.text : colors.navInactive }]}>{label}</Text>
              {route.name === 'CartTab' && itemCount > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.coral }]}>
                  <Text style={styles.badgeText}>{itemCount}</Text>
                </View>
              )}
              {focused && <View style={[styles.dot, { backgroundColor: colors.accent }]} />}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 2,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  label: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  dot: { position: 'absolute', bottom: -6, height: 4, width: 4, borderRadius: 2 },
});

export default CustomTabBar;
