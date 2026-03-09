import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FontConfig {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  lineHeight: number;
  letterSpacing: number;
  color: string;
}

export interface HeaderConfig {
  enabled: boolean;
  height: number;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient' | 'transparent';
  gradientDirection: 'to-r' | 'to-l' | 'to-b' | 'to-t' | 'to-br' | 'to-bl';
  gradientEndColor: string;
  logoPosition: 'left' | 'center' | 'right';
  logoSize: 'small' | 'medium' | 'large';
  logoHeight: number;
  showCompanyName: boolean;
  companyNamePosition: 'left' | 'center' | 'right';
  companyNameSize: number;
  borderStyle: 'none' | 'solid' | 'dashed' | 'gradient';
  borderWidth: number;
  borderColor: string;
  showSlideNumber: boolean;
  slideNumberPosition: 'left' | 'center' | 'right';
}

export interface FooterConfig {
  enabled: boolean;
  height: number;
  backgroundColor: string;
  backgroundType: 'solid' | 'gradient' | 'transparent';
  gradientEndColor: string;
  leftContent: 'logo' | 'company' | 'slide-title' | 'custom' | 'none';
  centerContent: 'company' | 'slide-title' | 'section' | 'date' | 'custom' | 'none';
  rightContent: 'slide-number' | 'total-slides' | 'date' | 'company' | 'custom' | 'none';
  customLeftText: string;
  customCenterText: string;
  customRightText: string;
  showDivider: boolean;
  dividerColor: string;
  fontSize: number;
  textColor: string;
}

export interface TypographyConfig {
  titleFont: FontConfig;
  subtitleFont: FontConfig;
  bodyFont: FontConfig;
  captionFont: FontConfig;
  accentFont: FontConfig;
}

export interface LayoutConfig {
  titleAlignment: 'left' | 'center' | 'right';
  subtitleAlignment: 'left' | 'center' | 'right';
  contentAlignment: 'left' | 'center' | 'right' | 'justify';
  verticalPosition: 'top' | 'center' | 'bottom';
  contentPadding: number;
  maxContentWidth: number;
  cardGap: number;
  cardPadding: number;
  cardBorderRadius: number;
}

export interface ContentVisibilityConfig {
  showStepType: boolean;
  showStepDuration: boolean;
  showStepStatus: boolean;
  showStepDescription: boolean;
  showStepRoles: boolean;
  showStepIcons: boolean;
  showMetrics: boolean;
  showChecklist: boolean;
  showTimeline: boolean;
  showDocuments: boolean;
  showRisks: boolean;
  showAgendaItems: boolean;
  descriptionMaxLength: number;
  maxChecklistItems: number;
  maxMetricsCount: number;
  maxTimelineEntries: number;
}

export interface SlideConfig {
  id: string;
  enabled: boolean;
  customTitle?: string;
  customSubtitle?: string;
  layout: 'default' | 'centered' | 'two-column' | 'full-image' | 'minimal';
  backgroundColor?: string;
  backgroundImage?: string;
  hiddenContentSections: string[];
  customNotes?: string;
}

export interface PresentationConfig {
  // Slide selection
  includeCoverSlide: boolean;
  includeAgendaSlide: boolean;
  includeThankYouSlide: boolean;
  selectedPhaseIds: string[];
  selectedStepIds: string[];
  slideConfigs: Record<string, SlideConfig>;
  slideOrder: string[];
  hiddenSlides: string[];
  
  // Layout options
  slidesPerPhase: number;
  showPhaseOverview: boolean;
  showStepDetails: boolean;
  maxStepDetailSlides: number;
  
  // Theme & styling
  theme: 'corporate' | 'modern' | 'minimal' | 'bold' | 'dark' | 'custom';
  customBackground?: string;
  customBackgroundImage?: string;
  backgroundType: 'solid' | 'gradient' | 'image';
  gradientDirection: 'to-r' | 'to-l' | 'to-b' | 'to-t' | 'to-br' | 'to-bl';
  gradientEndColor: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  
  // Header & Footer
  header: HeaderConfig;
  footer: FooterConfig;
  
  // Typography
  typography: TypographyConfig;
  
  // Layout
  layout: LayoutConfig;
  
  // Content visibility
  content: ContentVisibilityConfig;
  
  // Branding
  showLogo: boolean;
  showCompanyName: boolean;
  showSlideNumbers: boolean;
  showProgressIndicator: boolean;
  watermarkEnabled: boolean;
  watermarkOpacity: number;
  watermarkPosition: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  
  // Transitions
  transitionType: 'none' | 'fade' | 'slide' | 'zoom' | 'flip';
  transitionDuration: number;
  
  // Speaker notes
  showSpeakerNotes: boolean;
  speakerNotesFontSize: number;
}

interface PresentationState {
  config: PresentationConfig;
  isConfiguring: boolean;
  
  // Actions
  setConfig: (config: Partial<PresentationConfig>) => void;
  resetConfig: () => void;
  togglePhase: (phaseId: string) => void;
  toggleStep: (stepId: string) => void;
  updateSlideConfig: (slideId: string, config: Partial<SlideConfig>) => void;
  updateHeader: (header: Partial<HeaderConfig>) => void;
  updateFooter: (footer: Partial<FooterConfig>) => void;
  updateTypography: (typography: Partial<TypographyConfig>) => void;
  updateLayout: (layout: Partial<LayoutConfig>) => void;
  updateContent: (content: Partial<ContentVisibilityConfig>) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  hideSlide: (slideId: string) => void;
  showSlide: (slideId: string) => void;
  setIsConfiguring: (value: boolean) => void;
}

const defaultFontConfig: FontConfig = {
  fontFamily: 'Inter',
  fontSize: 16,
  fontWeight: 'normal',
  lineHeight: 1.5,
  letterSpacing: 0,
  color: '#ffffff',
};

const defaultHeaderConfig: HeaderConfig = {
  enabled: true,
  height: 48,
  backgroundColor: '#1e293b',
  backgroundType: 'solid',
  gradientDirection: 'to-r',
  gradientEndColor: '#334155',
  logoPosition: 'left',
  logoSize: 'medium',
  logoHeight: 28,
  showCompanyName: true,
  companyNamePosition: 'left',
  companyNameSize: 14,
  borderStyle: 'none',
  borderWidth: 1,
  borderColor: '#334155',
  showSlideNumber: false,
  slideNumberPosition: 'right',
};

const defaultFooterConfig: FooterConfig = {
  enabled: true,
  height: 40,
  backgroundColor: '#1e293b',
  backgroundType: 'solid',
  gradientEndColor: '#334155',
  leftContent: 'company',
  centerContent: 'slide-title',
  rightContent: 'slide-number',
  customLeftText: '',
  customCenterText: '',
  customRightText: '',
  showDivider: true,
  dividerColor: '#334155',
  fontSize: 12,
  textColor: '#94a3b8',
};

const defaultTypographyConfig: TypographyConfig = {
  titleFont: { ...defaultFontConfig, fontSize: 48, fontWeight: 'black', lineHeight: 1.1 },
  subtitleFont: { ...defaultFontConfig, fontSize: 20, fontWeight: 'normal', lineHeight: 1.4, color: '#94a3b8' },
  bodyFont: { ...defaultFontConfig, fontSize: 16, fontWeight: 'normal', lineHeight: 1.6 },
  captionFont: { ...defaultFontConfig, fontSize: 12, fontWeight: 'medium', lineHeight: 1.4, color: '#64748b' },
  accentFont: { ...defaultFontConfig, fontSize: 14, fontWeight: 'semibold', lineHeight: 1.3 },
};

const defaultLayoutConfig: LayoutConfig = {
  titleAlignment: 'center',
  subtitleAlignment: 'center',
  contentAlignment: 'left',
  verticalPosition: 'center',
  contentPadding: 48,
  maxContentWidth: 1000,
  cardGap: 16,
  cardPadding: 20,
  cardBorderRadius: 12,
};

const defaultContentVisibilityConfig: ContentVisibilityConfig = {
  showStepType: true,
  showStepDuration: false,
  showStepStatus: true,
  showStepDescription: true,
  showStepRoles: true,
  showStepIcons: true,
  showMetrics: true,
  showChecklist: true,
  showTimeline: true,
  showDocuments: true,
  showRisks: true,
  showAgendaItems: true,
  descriptionMaxLength: 150,
  maxChecklistItems: 6,
  maxMetricsCount: 4,
  maxTimelineEntries: 5,
};

const defaultConfig: PresentationConfig = {
  // Slide selection
  includeCoverSlide: true,
  includeAgendaSlide: true,
  includeThankYouSlide: true,
  selectedPhaseIds: [],
  selectedStepIds: [],
  slideConfigs: {},
  slideOrder: [],
  hiddenSlides: [],
  
  // Layout options
  slidesPerPhase: 4,
  showPhaseOverview: true,
  showStepDetails: true,
  maxStepDetailSlides: 5,
  
  // Theme & styling
  theme: 'corporate',
  primaryColor: '#3b82f6',
  secondaryColor: '#8b5cf6',
  accentColor: '#22d3ee',
  customBackground: '#1e293b',
  customBackgroundImage: undefined,
  backgroundType: 'solid',
  gradientDirection: 'to-br',
  gradientEndColor: '#0f172a',
  
  // Header & Footer
  header: defaultHeaderConfig,
  footer: defaultFooterConfig,
  
  // Typography
  typography: defaultTypographyConfig,
  
  // Layout
  layout: defaultLayoutConfig,
  
  // Content visibility
  content: defaultContentVisibilityConfig,
  
  // Branding
  showLogo: true,
  showCompanyName: true,
  showSlideNumbers: true,
  showProgressIndicator: true,
  watermarkEnabled: false,
  watermarkOpacity: 0.05,
  watermarkPosition: 'center',
  
  // Transitions
  transitionType: 'fade',
  transitionDuration: 400,
  
  // Speaker notes
  showSpeakerNotes: false,
  speakerNotesFontSize: 14,
};

export const usePresentationStore = create<PresentationState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      isConfiguring: false,

      setConfig: (newConfig) => {
        set((state) => ({
          config: { ...state.config, ...newConfig },
        }));
      },

      resetConfig: () => {
        set({ config: defaultConfig });
      },

      togglePhase: (phaseId) => {
        set((state) => {
          const selected = state.config.selectedPhaseIds;
          const newSelected = selected.includes(phaseId)
            ? selected.filter((id) => id !== phaseId)
            : [...selected, phaseId];
          return {
            config: { ...state.config, selectedPhaseIds: newSelected },
          };
        });
      },

      toggleStep: (stepId) => {
        set((state) => {
          const selected = state.config.selectedStepIds;
          const newSelected = selected.includes(stepId)
            ? selected.filter((id) => id !== stepId)
            : [...selected, stepId];
          return {
            config: { ...state.config, selectedStepIds: newSelected },
          };
        });
      },

      updateSlideConfig: (slideId, slideConfig) => {
        set((state) => {
          const existing = state.config.slideConfigs[slideId] || {
            id: slideId,
            enabled: true,
            layout: 'default',
            hiddenContentSections: [],
          };
          return {
            config: {
              ...state.config,
              slideConfigs: {
                ...state.config.slideConfigs,
                [slideId]: { ...existing, ...slideConfig },
              },
            },
          };
        });
      },

      updateHeader: (header) => {
        set((state) => ({
          config: {
            ...state.config,
            header: { ...state.config.header, ...header },
          },
        }));
      },

      updateFooter: (footer) => {
        set((state) => ({
          config: {
            ...state.config,
            footer: { ...state.config.footer, ...footer },
          },
        }));
      },

      updateTypography: (typography) => {
        set((state) => ({
          config: {
            ...state.config,
            typography: { ...state.config.typography, ...typography },
          },
        }));
      },

      updateLayout: (layout) => {
        set((state) => ({
          config: {
            ...state.config,
            layout: { ...state.config.layout, ...layout },
          },
        }));
      },

      updateContent: (content) => {
        set((state) => ({
          config: {
            ...state.config,
            content: { ...state.config.content, ...content },
          },
        }));
      },

      reorderSlides: (fromIndex, toIndex) => {
        set((state) => {
          const order = [...state.config.slideOrder];
          const [removed] = order.splice(fromIndex, 1);
          order.splice(toIndex, 0, removed);
          return {
            config: { ...state.config, slideOrder: order },
          };
        });
      },

      hideSlide: (slideId) => {
        set((state) => ({
          config: {
            ...state.config,
            hiddenSlides: [...state.config.hiddenSlides, slideId],
          },
        }));
      },

      showSlide: (slideId) => {
        set((state) => ({
          config: {
            ...state.config,
            hiddenSlides: state.config.hiddenSlides.filter((id) => id !== slideId),
          },
        }));
      },

      setIsConfiguring: (value) => {
        set({ isConfiguring: value });
      },
    }),
    {
      name: 'presentation-config-v2',
      partialize: (state) => ({ config: state.config }),
    }
  )
);