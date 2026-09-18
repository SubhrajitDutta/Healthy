import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AllergyProfile, Allergen, DietGoal } from '../types';

interface UserContextValue {
  profile: AllergyProfile;
  toggleAllergen: (a: Allergen) => void;
  toggleDietGoal: (g: DietGoal) => void;
  setCalorieTarget: (n: number) => void;
  setProteinTarget: (n: number) => void;
  setNotes: (s: string) => void;
}

const DEFAULT_PROFILE: AllergyProfile = {
  allergens: [],
  dietGoals: [],
  dailyCalorieTarget: 2200,
  dailyProteinTarget: 140,
  notes: '',
};

const STORAGE_KEY = 'healthy-user-profile-v1';

const UserContext = createContext<UserContextValue | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<AllergyProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setProfile({ ...DEFAULT_PROFILE, ...JSON.parse(raw) });
        } catch {
          // ignore corrupt cache
        }
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (hydrated) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, hydrated]);

  const toggleAllergen = useCallback((a: Allergen) => {
    setProfile((p) => ({
      ...p,
      allergens: p.allergens.includes(a) ? p.allergens.filter((x) => x !== a) : [...p.allergens, a],
    }));
  }, []);

  const toggleDietGoal = useCallback((g: DietGoal) => {
    setProfile((p) => ({
      ...p,
      dietGoals: p.dietGoals.includes(g) ? p.dietGoals.filter((x) => x !== g) : [...p.dietGoals, g],
    }));
  }, []);

  const setCalorieTarget = useCallback((n: number) => {
    setProfile((p) => ({ ...p, dailyCalorieTarget: n }));
  }, []);

  const setProteinTarget = useCallback((n: number) => {
    setProfile((p) => ({ ...p, dailyProteinTarget: n }));
  }, []);

  const setNotes = useCallback((s: string) => {
    setProfile((p) => ({ ...p, notes: s }));
  }, []);

  return (
    <UserContext.Provider
      value={{ profile, toggleAllergen, toggleDietGoal, setCalorieTarget, setProteinTarget, setNotes }}
    >
      {children}
    </UserContext.Provider>
  );
};

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
