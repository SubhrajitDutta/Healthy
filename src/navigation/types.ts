import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NavigatorScreenParams } from '@react-navigation/native';

export type HomeStackParamList = {
  Home: undefined;
  ShopDetail: { shopId: string };
  DishDetail: { shopId: string; dishId: string };
};

export type CartStackParamList = {
  Cart: undefined;
  Checkout: undefined;
  Tracking: {
    shopId: string | null;
    distanceKm: number;
    deliveryFee: number;
    grandTotal: number;
    itemCount: number;
  };
};

export type ProfileStackParamList = {
  Profile: undefined;
};

export type RootTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  CartTab: NavigatorScreenParams<CartStackParamList>;
  ProfileTab: undefined;
};

export type HomeStackNavProp = NativeStackNavigationProp<HomeStackParamList>;
export type CartStackNavProp = NativeStackNavigationProp<CartStackParamList>;
