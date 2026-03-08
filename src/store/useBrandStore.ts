import { create } from 'zustand';
import type { BrandKit } from '../types/integrations';
import { useInfographicStore } from './useInfographicStore';

interface BrandStore {
  brand: BrandKit;
  brandApplied: boolean;
  updateBrand: (updates: Partial<BrandKit>) => void;
  updateColors: (colors: Partial<BrandKit['colors']>) => void;
  updateFonts: (fonts: Partial<BrandKit['fonts']>) => void;
  setLogo: (base64: string) => void;
  resetBrand: () => void;
  applyBrandToWorkflow: () => void;
}

const DEFAULT_BRAND: BrandKit = {
  companyName: 'Your Company',
  tagline: 'Empowering teams through clear processes',
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#f8fafc',
    text: '#1e293b',
  },
  fonts: {
    heading: "'Inter', sans-serif",
    body: "'Inter', sans-serif",
  },
  presentationTheme: 'corporate',
};

export const useBrandStore = create<BrandStore>((set, get) => ({
  brand: DEFAULT_BRAND,
  brandApplied: false,

  updateBrand: (updates) => set((s) => ({ brand: { ...s.brand, ...updates } })),
  updateColors: (colors) => set((s) => ({ brand: { ...s.brand, colors: { ...s.brand.colors, ...colors } } })),
  updateFonts: (fonts) => set((s) => ({ brand: { ...s.brand, fonts: { ...s.brand.fonts, ...fonts } } })),
  setLogo: (base64) => set((s) => ({ brand: { ...s.brand, logoBase64: base64 } })),
  resetBrand: () => set({ brand: DEFAULT_BRAND, brandApplied: false }),

  applyBrandToWorkflow: () => {
    const { brand } = get();
    const store = useInfographicStore.getState();
    store.updateTitleBar({
      backgroundColor: brand.colors.primary,
      textColor: '#ffffff',
      titleFontFamily: brand.fonts.heading,
      subtitleFontFamily: brand.fonts.body,
      ...(brand.logoBase64 ? { logoUrl: brand.logoBase64 } : {}),
      ...(brand.companyName ? { text: brand.companyName } : {}),
      ...(brand.tagline ? { subtitle: brand.tagline } : {}),
    });
    store.updateLayout({
      phaseTitleFontFamily: brand.fonts.heading,
      phaseSubtitleFontFamily: brand.fonts.body,
      cardTitleFontFamily: brand.fonts.heading,
      cardContentFontFamily: brand.fonts.body,
      subcontentTitleFontFamily: brand.fonts.body,
      stepLabelFontFamily: brand.fonts.body,
      stepLabelColor: brand.colors.secondary,
    });
    store.setBackgroundColor(brand.colors.background);
    set({ brandApplied: true });
  },
}));
