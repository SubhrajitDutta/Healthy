import { Platform } from 'react-native';

// Color tokens — mirrors the web app's tailwind.config.js palette
export const palette = {
  lime: {
    50: '#F5FDE8',
    100: '#E9FBC9',
    200: '#D6F694',
    300: '#C3F160',
    400: '#B7F135',
    500: '#9BD91A',
    600: '#7CAE14',
    700: '#5E8310',
    800: '#3F580B',
    900: '#213006',
  },
  coral: {
    50: '#FFF1EC',
    100: '#FFE0D4',
    200: '#FFBCA3',
    300: '#FF9871',
    400: '#FF6B4A',
    500: '#F5441C',
    600: '#C93314',
    700: '#98250E',
    800: '#671909',
    900: '#360C05',
  },
  ink: {
    50: '#F5F6F3',
    100: '#E6E8E1',
    200: '#C7CBBC',
    300: '#9BA189',
    400: '#6D745B',
    500: '#4B5140',
    600: '#383D2F',
    700: '#282C22',
    800: '#1B1E16',
    900: '#12140F',
    950: '#0A0B08',
  },
  cream: '#FAFAF4',
  white: '#FFFFFF',
};

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string; // lime
  accentText: string; // text drawn on top of accent
  coral: string;
  coralBg: string;
  coralText: string;
  navInactive: string;
}

export const lightColors: ThemeColors = {
  background: palette.cream,
  surface: palette.white,
  surfaceAlt: 'rgba(18,20,15,0.05)',
  border: 'rgba(18,20,15,0.1)',
  text: palette.ink[900],
  textMuted: palette.ink[400],
  textFaint: palette.ink[300],
  accent: palette.lime[400],
  accentText: palette.ink[900],
  coral: palette.coral[400],
  coralBg: palette.coral[50],
  coralText: palette.coral[600],
  navInactive: palette.ink[300],
};

export const darkColors: ThemeColors = {
  background: palette.ink[950],
  surface: palette.ink[800],
  surfaceAlt: 'rgba(250,250,244,0.06)',
  border: 'rgba(250,250,244,0.12)',
  text: palette.cream,
  textMuted: palette.ink[200],
  textFaint: palette.ink[300],
  accent: palette.lime[400],
  accentText: palette.ink[900],
  coral: palette.coral[400],
  coralBg: 'rgba(255,107,74,0.15)',
  coralText: palette.coral[300],
  navInactive: palette.ink[400],
};

// Typography — falls back to system fonts until custom fonts are linked.
// See README "Adding the brand fonts" section to wire up Unbounded + Inter.
export const fonts = {
  display: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
  body: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
};

export const radii = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
  // irregular "blob" corner used on hero cards, matches the web app's rounded-blob token
  blob: { topLeft: 32, topRight: 32, bottomRight: 32, bottomLeft: 8 },
};

export const spacing = (n: number) => n * 4;

// RN shadow tokens — approximates the web app's hard-offset "chunky" shadow
export const chunkyShadow = (color: string) =>
  Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    android: {
      elevation: 4,
    },
    default: {},
  });

export const softShadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: { elevation: 2 },
  default: {},
});
