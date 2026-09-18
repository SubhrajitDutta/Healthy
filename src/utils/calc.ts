import { CartItem, Macros, Dish } from '../types';

const EMPTY: Macros = { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, omega3: 0, zinc: 0, magnesium: 0 };

export function addMacros(a: Macros, b: Partial<Macros>): Macros {
  return {
    calories: a.calories + (b.calories ?? 0),
    protein: a.protein + (b.protein ?? 0),
    carbs: a.carbs + (b.carbs ?? 0),
    fats: a.fats + (b.fats ?? 0),
    fiber: a.fiber + (b.fiber ?? 0),
    omega3: a.omega3 + (b.omega3 ?? 0),
    zinc: a.zinc + (b.zinc ?? 0),
    magnesium: a.magnesium + (b.magnesium ?? 0),
  };
}

export function scaleMacros(m: Macros, factor: number): Macros {
  return {
    calories: Math.round(m.calories * factor),
    protein: round1(m.protein * factor),
    carbs: round1(m.carbs * factor),
    fats: round1(m.fats * factor),
    fiber: round1(m.fiber * factor),
    omega3: Math.round(m.omega3 * factor),
    zinc: round1(m.zinc * factor),
    magnesium: Math.round(m.magnesium * factor),
  };
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Computes the live macros for a dish given removed/swapped ingredient ids and portion size. */
export function computeDishMacros(dish: Dish, removedIds: string[], portionGrams: number): Macros {
  let macros = { ...dish.baseMacros };
  for (const ing of dish.ingredients) {
    if (removedIds.includes(ing.id)) {
      macros = addMacros(macros, ing.macroDelta);
    }
  }
  // clamp negatives from double-subtraction edge cases
  (Object.keys(macros) as (keyof Macros)[]).forEach((k) => {
    if (macros[k] < 0) macros[k] = 0;
  });
  const portionFactor = portionGrams / dish.baseGrams;
  return scaleMacros(macros, portionFactor);
}

export function computeDishPrice(dish: Dish, activeIngredientIds: string[]): number {
  let price = dish.basePrice;
  for (const ing of dish.ingredients) {
    if (ing.extraCost && activeIngredientIds.includes(ing.id)) {
      price += ing.extraCost;
    }
  }
  return price;
}

export function computeCartTotals(items: CartItem[]) {
  let totalMacros: Macros = { ...EMPTY };
  let subtotal = 0;
  for (const item of items) {
    const activeIds = item.dish.ingredients
      .filter((i) => !item.removedIngredientIds.includes(i.id))
      .map((i) => i.id)
      .concat(item.swappedIngredientIds);
    const macrosPerUnit = computeDishMacros(item.dish, item.removedIngredientIds, item.portionGrams);
    totalMacros = addMacros(totalMacros, scaleMacros(macrosPerUnit, item.quantity));
    const unitPrice = computeDishPrice(item.dish, activeIds);
    subtotal += unitPrice * item.quantity;
  }
  return { totalMacros, subtotal };
}

/** Haversine distance in km between two lat/lng points. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Simulated delivery fee based on distance slabs, with an optional peak-hour surge. */
export function computeDeliveryFee(distanceKm: number, isPeakHour = false): number {
  let fee: number;
  if (distanceKm <= 3) fee = 19;
  else if (distanceKm <= 7) fee = 19 + (distanceKm - 3) * 8;
  else fee = 19 + 4 * 8 + (distanceKm - 7) * 12;
  fee = Math.round(fee);
  return isPeakHour ? Math.round(fee * 1.25) : fee;
}

export function estimateEtaMinutes(distanceKm: number, prepMinutes: number): number {
  const travelMinutes = (distanceKm / 22) * 60; // assume ~22km/h average city speed
  return Math.round(prepMinutes + travelMinutes);
}

export function interpolate(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
