# Healthy : Your Health Supporter (React Native · CLI)

A nutrition-first, location-based food delivery app for the fitness and gym-going community — this is the **React Native CLI** port (bare workflow, **no Expo**) of the web app, written in **TypeScript**.

All data (shops, dishes, delivery partners) is mocked locally in `src/data/mockData.ts`. There is no backend; cart and profile state persist to the device via `@react-native-async-storage/async-storage`.

## What's included

Same feature set as the web version, rebuilt with native primitives:

- **Home** — location header, diet-goal filter chips, Healthy Kitchens + partner restaurant feed
- **Shop Detail & Menu** — shop hero image, ratings, dish list with quick nutrition tags
- **Dish Detail** — nutrition label (animated SVG calorie ring, protein/carbs/fats/fiber bars, omega-3/zinc/magnesium), ingredient-level customizer (remove add-ons, swap the carb base), gram-based portion adjustment, live allergy warnings, add-to-cart with a bottom-sheet cart-conflict modal
- **Cart** — persistent cart, quantity steppers, live cart-wide nutrition totals, smart upsell nudge, empty state
- **Checkout** — address, instant/scheduled delivery slot, payment method, Haversine-distance delivery fee with peak-hour surge, order summary
- **Order Tracking** — simulated live delivery partner movement along a bezier path (drawn and animated with `react-native-svg`), live "X km away · ETA Y min", 5-stage progress tracker, tab bar auto-hidden on this screen
- **Profile** — allergy profile (lactose, nuts, gluten, soy, shellfish, egg) with per-order notes, diet goal preferences, daily calorie/protein target steppers, light/dark/system theme picker

## Tech stack

- **React Native CLI** (bare workflow — generated with `npx react-native init`, not Expo), **React 19**, **TypeScript**
- **React Navigation**: bottom-tabs (Home / Cart / Profile, custom-styled tab bar) with a native-stack nested in each tab
- **react-native-svg** for the calorie ring and the tracking map/marker
- **lucide-react-native** for icons
- **@react-native-async-storage/async-storage** for persistence (cart, profile, theme)
- Plain **StyleSheet** + a shared token file (`src/theme/tokens.ts`) for styling — no CSS-in-JS or Tailwind dependency, so there's nothing extra to configure for CLI builds
- Animations via React Native's built-in `Animated` API (spring taps, animated bars/rings) — no `react-native-reanimated` dependency, to keep native setup minimal

## Getting started

Requires a working React Native CLI environment (Xcode for iOS, Android Studio + SDK for Android) — see the [official environment setup guide](https://reactnative.dev/docs/set-up-your-environment) if you haven't set this up before.

```bash
npm install

# iOS only — install CocoaPods dependencies
cd ios && pod install && cd ..

# Run on a simulator/emulator or connected device
npm run android
npm run ios
```

Metro will start automatically; if it doesn't, run `npm start` in a separate terminal first.

## Project structure

```
App.tsx               Providers (Theme/User/Cart) + NavigationContainer + RootNavigator
src/
  types/               Shared TypeScript types (Dish, Shop, CartItem, Macros, AllergyProfile, ...)
  data/                Mock shops, dishes, and delivery partners
  utils/calc.ts        Nutrition math, Haversine distance, delivery fee, ETA estimation
  theme/tokens.ts       Color palette, typography, radii, shadow helpers
  context/             ThemeContext, CartContext, UserContext — all AsyncStorage-backed
  components/          Shared UI: ScalePressable, ThemeToggle, PageHeader, MacroRing, MacroBar,
                       IngredientCustomizer, QuantityStepper, ShopCard, DishCard, Badges
  navigation/          RootNavigator (bottom tabs), HomeStackNavigator, CartStackNavigator,
                       CustomTabBar, shared param-list types
  screens/             HomeScreen, ShopDetailScreen, DishDetailScreen, CartScreen,
                       CheckoutScreen, OrderTrackingScreen, ProfileScreen
```

## Notes on the mock demo layer

- Delivery distance uses the **Haversine formula** between mock shop coordinates and a fixed mock user location (`src/data/mockData.ts` → `USER_LOCATION`).
- Delivery fee is slab-based (0–3km flat, 3–7km per-km, beyond that a higher per-km rate) with an optional 25% peak-hour surge (7–9pm) — see `computeDeliveryFee` in `src/utils/calc.ts`.
- Order tracking's moving marker follows a hand-computed cubic bezier curve (same control points as the web version's SVG path) evaluated every 180ms — this avoids relying on `react-native-svg`'s path-measurement APIs, which vary in support across platforms/versions.
- The map is a stylized abstract SVG grid, not a real map provider. To use a real map, swap in `react-native-maps` (Google/Apple Maps) as noted in the original brief.

## What was verified in this environment

This sandbox can't launch an iOS simulator or Android emulator, so the app hasn't been visually verified on-device. What *was* verified here:

- `npx tsc --noEmit` — clean, no type errors across the whole project
- `npx eslint src App.tsx` — no errors (only non-blocking `react-native/no-inline-styles` style warnings)
- `npx react-native bundle` — Metro successfully resolved and bundled the entire dependency graph into a working JS bundle, confirming every import, component, and navigation wire-up is correct

Before running on a real device, you'll need `pod install` for iOS and a configured Android SDK, per the setup guide linked above.

## Not included in this port

Per the original project brief's later sections, the following are out of scope here and would need separate work: backend API (Node/Express, DB), auth (JWT/OTP/social login), payments SDK integration (Razorpay/Stripe), real-time WebSocket tracking, delivery-partner and admin app modules, push notifications, and macro-tracker/subscription features. Custom brand fonts (Unbounded/Inter) also aren't linked yet — the app currently falls back to system fonts; see `src/theme/tokens.ts` for where to wire them in with `react-native-asset` or manual font linking.
