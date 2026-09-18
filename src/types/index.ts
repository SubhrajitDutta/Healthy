export type Allergen =
  | 'lactose'
  | 'nuts'
  | 'gluten'
  | 'soy'
  | 'shellfish'
  | 'egg';

export type DietGoal =
  | 'high-protein'
  | 'low-carb'
  | 'keto'
  | 'vegan'
  | 'muscle-gain'
  | 'weight-loss'
  | 'diabetic-friendly';

export interface Macros {
  calories: number;
  protein: number; // g
  carbs: number; // g
  fats: number; // g
  fiber: number; // g
  omega3: number; // mg
  zinc: number; // mg
  magnesium: number; // mg
}

export interface IngredientOption {
  id: string;
  name: string;
  removable: boolean;
  swapGroup?: string; // ingredients sharing a swapGroup can substitute each other
  isDefaultActive?: boolean; // for swapGroup members: which one ships in the base dish
  macroDelta: Partial<Macros>; // change to base macros if this ingredient is present
  allergens: Allergen[];
  extraCost?: number;
}

export interface Dish {
  id: string;
  shopId: string;
  name: string;
  description: string;
  image: string;
  basePrice: number;
  baseMacros: Macros;
  baseGrams: number;
  dietGoals: DietGoal[];
  allergens: Allergen[];
  ingredients: IngredientOption[];
  isHealthyKitchenExclusive?: boolean;
  isBestseller?: boolean;
}

export type ShopType = 'healthy-kitchen' | 'partner-restaurant';

export interface Shop {
  id: string;
  name: string;
  type: ShopType;
  cuisine: string;
  image: string;
  rating: number;
  ratingCount: number;
  etaMinutes: [number, number];
  distanceKm: number;
  tags: string[];
  lat: number;
  lng: number;
}

export interface CartItem {
  id: string; // unique cart line id
  dish: Dish;
  quantity: number;
  removedIngredientIds: string[];
  swappedIngredientIds: string[]; // active swap selections (in addition to base)
  portionGrams: number;
  notes?: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  vehicle: string;
  rating: number;
  lat: number;
  lng: number;
}

export type OrderStage =
  | 'placed'
  | 'preparing'
  | 'picked-up'
  | 'on-the-way'
  | 'delivered';

export interface AllergyProfile {
  allergens: Allergen[];
  dietGoals: DietGoal[];
  dailyCalorieTarget: number;
  dailyProteinTarget: number;
  notes: string;
}
