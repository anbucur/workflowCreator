import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, ChevronLeft, ChevronRight, Maximize2, Download,
  LayoutGrid
} from 'lucide-react';
import { useInfographicStore } from '../store/useInfographicStore';
import { useBrandStore } from '../store/useBrandStore';
import { usePresentationStore } from '../store/usePresentationStore';
import type { Phase, Step, RoleDefinition } from '../types';
import { exportInfographic } from '../utils/export';
import { useExportStore } from '../store/useExportStore';

interface Props {
  onClose?: () => void;
}

type SlideType = 'cover' | 'agenda' | 'phase' | 'step' | 'thankyou';

interface Slide {
  id: string;
  type: SlideType;
  title: string;
  phase?: Phase;
  step?: Step;
  phaseIndex?: number;
}

// Helper to get font weight CSS value
const getFontWeight = (weight: string): number => {
  const weights: Record<string, number> = {
    'normal': 400,
    'medium': 500,
    'semibold': 600,
    'bold': 700,
    'black': 900,
  };
  return weights[weight] || 400;
};

// Build slides based on config
function buildSlides(
  phases: Phase[],
  titleBar: { text: string; subtitle?: string },
  companyName: string,
  config: ReturnType<typeof usePresentationStore.getState>['config']
): Slide[] {
  const slides: Slide[] = [];

  // Cover slide
  if (config.includeCoverSlide && !config.hiddenSlides.includes('cover')) {
    slides.push({ id: 'cover', type: 'cover', title: titleBar.text });
  }

  // Agenda slide
  if (config.includeAgendaSlide && phases.length >= 3 && !config.hiddenSlides.includes('agenda')) {
    slides.push({ id: 'agenda', type: 'agenda', title: 'Agenda' });
  }

  // Phase and step slides
  config.selectedPhaseIds.forEach((phaseId) => {
    const phase = phases.find(p => p.id === phaseId);
    if (!phase) return;

    if (config.showPhaseOverview && !config.hiddenSlides.includes(`phase-${phase.id}`)) {
      slides.push({ id: `phase-${phase.id}`, type: 'phase', title: phase.title, phase, phaseIndex: phases.indexOf(phase) });
    }

    if (config.showStepDetails) {
      phase.steps.forEach((step) => {
        if (config.selectedStepIds.includes(step.id) && !config.hiddenSlides.includes(`step-${step.id}`)) {
          slides.push({ id: `step-${step.id}`, type: 'step', title: step.title, phase, step, phaseIndex: phases.indexOf(phase) });
        }
      });
    }
  });

  // Thank you slide
  if (config.includeThankYouSlide && !config.hiddenSlides.includes('thankyou')) {
    slides.push({ id: 'thankyou', type: 'thankyou', title: companyName || 'Thank You' });
  }

  return slides;
}

// Get slide background style
const getSlideBackground = (config: ReturnType<typeof usePresentationStore.getState>['config']): string => {
  const { theme, primaryColor, secondaryColor, customBackground, gradientEndColor, backgroundType } = config;
  
  switch (theme) {
    case 'corporate':
      return '#1e293b';
    case 'modern':
      return `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`;
    case 'minimal':
      return '#ffffff';
    case 'bold':
      return '#facc15';
    case 'dark':
      return '#030712';
    case 'custom':
      return backgroundType === 'gradient' 
        ? `linear-gradient(135deg, ${customBackground}, ${gradientEndColor})`
        : customBackground || '#1e293b';
    default:
      return '#1e293b';
  }
};

// Get text colors based on theme
const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'minimal':
      return { title: '#0f172a', subtitle: '#64748b', body: '#334155', meta: '#94a3b8' };
    case 'bold':
      return { title: '#1e293b', subtitle: '#475569', body: '#334155', meta: '#64748b' };
    default:
      return { title: '#ffffff', subtitle: '#94a3b8', body: '#e2e8f0', meta: '#64748b' };
  }
};

// Header Component
const SlideHeader: React.FC<{
  config: ReturnType<typeof usePresentationStore.getState>['config'];
  brand: ReturnType<typeof useBrandStore.getState>['brand'];
  slideNumber?: number;
  totalSlides?: number;
}> = ({ config, brand, slideNumber, totalSlides }) => {
  if (!config.header.enabled) return null;

  const { header } = config;
  
  const bgStyle: React.CSSProperties = {
    height: `${header.height}px`,
    backgroundColor: header.backgroundType === 'transparent' ? 'transparent' : header.backgroundColor,
  };

  if (header.backgroundType === 'gradient') {
    const dirMap: Record<string, string> = {
      'to-r': 'to right',
      'to-l': 'to left',
      'to-b': 'to bottom',
      'to-t': 'to top',
      'to-br': 'to bottom right',
      'to-bl': 'to bottom left',
    };
    bgStyle.background = `linear-gradient(${dirMap[header.gradientDirection] || 'to right'}, ${header.backgroundColor}, ${header.gradientEndColor})`;
  }

  if (header.borderStyle !== 'none') {
    bgStyle.borderBottom = `${header.borderWidth}px ${header.borderStyle} ${header.borderColor}`;
  }

  const logoElement = config.showLogo && (brand.logoBase64) && (
    <img 
      src={brand.logoBase64} 
      alt="Logo" 
      style={{ height: `${header.logoHeight}px`, width: 'auto', objectFit: 'contain' }} 
    />
  );

  const companyElement = header.showCompanyName && brand.companyName && (
    <span style={{ fontSize: `${header.companyNameSize}px`, fontWeight: 600, color: '#ffffff' }}>
      {brand.companyName}
    </span>
  );

  const slideNumberElement = header.showSlideNumber && slideNumber !== undefined && totalSlides !== undefined && (
    <span style={{ fontSize: `${header.companyNameSize}px`, color: '#94a3b8' }}>
      {slideNumber} / {totalSlides}
    </span>
  );

  const getPositionStyle = (position: string): React.CSSProperties => {
    switch (position) {
      case 'left': return { justifyContent: 'flex-start' };
      case 'center': return { justifyContent: 'center' };
      case 'right': return { justifyContent: 'flex-end' };
      default: return { justifyContent: 'flex-start' };
    }
  };

  return (
    <div className="flex items-center px-4" style={bgStyle}>
      <div className="flex items-center gap-3 flex-1" style={getPositionStyle(header.logoPosition)}>
        {header.logoPosition === 'left' && logoElement}
      </div>
      
      <div className="flex items-center gap-3 flex-1" style={getPositionStyle(header.companyNamePosition)}>
        {header.logoPosition !== 'center' && header.companyNamePosition === 'center' && companyElement}
        {header.logoPosition === 'center' && logoElement}
      </div>
      
      <div className="flex items-center gap-3 flex-1" style={getPositionStyle(header.slideNumberPosition)}>
        {header.showSlideNumber && slideNumberElement}
      </div>
    </div>
  );
};

// Footer Component
const SlideFooter: React.FC<{
  config: ReturnType<typeof usePresentationStore.getState>['config'];
  brand: ReturnType<typeof useBrandStore.getState>['brand'];
  slideTitle?: string;
  slideNumber?: number;
  totalSlides?: number;
  sectionName?: string;
}> = ({ config, brand, slideTitle, slideNumber, totalSlides, sectionName }) => {
  if (!config.footer.enabled) return null;

  const { footer } = config;

  const renderContent = (contentType: string, position: 'left' | 'center' | 'right') => {
    switch (contentType) {
      case 'logo':
        return brand.logoBase64 ? (
          <img src={brand.logoBase64} alt="Logo" style={{ height: `${footer.fontSize}px`, width: 'auto' }} />
        ) : null;
      case 'company':
        return <span>{brand.companyName}</span>;
      case 'slide-title':
        return <span className="truncate">{slideTitle}</span>;
      case 'section':
        return <span>{sectionName}</span>;
      case 'date':
        return <span>{new Date().toLocaleDateString()}</span>;
      case 'slide-number':
        return <span>{slideNumber}</span>;
      case 'total-slides':
        return <span>{slideNumber} / {totalSlides}</span>;
      case 'custom':
        return <span>{position === 'left' ? footer.customLeftText : position === 'center' ? footer.customCenterText : footer.customRightText}</span>;
      default:
        return null;
    }
  };

  return (
    <div 
      className="flex items-center justify-between px-4"
      style={{ 
        height: `${footer.height}px`,
        backgroundColor: footer.backgroundColor,
        color: footer.textColor,
        fontSize: `${footer.fontSize}px`,
        borderTop: footer.showDivider ? `1px solid ${footer.dividerColor}` : 'none',
      }}
    >
      <div className="flex-1" style={{ textAlign: 'left' }}>
        {renderContent(footer.leftContent, 'left')}
      </div>
      <div className="flex-1" style={{ textAlign: 'center' }}>
        {renderContent(footer.centerContent, 'center')}
      </div>
      <div className="flex-1" style={{ textAlign: 'right' }}>
        {renderContent(footer.rightContent, 'right')}
      </div>
    </div>
  );
};

// Cover Slide
const CoverSlide: React.FC<{
  titleBar: { text: string; subtitle?: string };
  brand: ReturnType<typeof useBrandStore.getState>['brand'];
  config: ReturnType<typeof usePresentationStore.getState>['config'];
}> = ({ titleBar, brand, config }) => {
  const colors = getThemeColors(config.theme);
  const { typography, layout } = config;

  return (
    <div 
      className="flex flex-col items-center justify-center h-full text-center"
      style={{ padding: `${layout.contentPadding}px` }}
    >
      {config.showLogo && (brand.logoBase64) ? (
        <img src={brand.logoBase64} alt="Logo" className="h-20 w-auto object-contain mb-8" />
      ) : (
        <div 
          className="w-20 h-20 rounded-3xl mb-8 flex items-center justify-center text-white text-3xl font-black"
          style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
        >
          {(brand.companyName || 'P').charAt(0)}
        </div>
      )}
      
      <h1 
        className="leading-tight mb-4"
        style={{
          fontFamily: typography.titleFont.fontFamily,
          fontSize: `${typography.titleFont.fontSize}px`,
          fontWeight: getFontWeight(typography.titleFont.fontWeight),
          color: typography.titleFont.color || colors.title,
          letterSpacing: `${typography.titleFont.letterSpacing}px`,
          lineHeight: typography.titleFont.lineHeight,
          textAlign: layout.titleAlignment,
        }}
      >
        {titleBar.text}
      </h1>
      
      {titleBar.subtitle && (
        <p 
          className="max-w-2xl"
          style={{
            fontFamily: typography.subtitleFont.fontFamily,
            fontSize: `${typography.subtitleFont.fontSize}px`,
            fontWeight: getFontWeight(typography.subtitleFont.fontWeight),
            color: typography.subtitleFont.color || colors.subtitle,
            letterSpacing: `${typography.subtitleFont.letterSpacing}px`,
            lineHeight: typography.subtitleFont.lineHeight,
            textAlign: layout.subtitleAlignment,
          }}
        >
          {titleBar.subtitle}
        </p>
      )}
      
      <div className="mt-10 h-1 w-20 rounded-full" style={{ backgroundColor: config.accentColor }} />
      
      {config.showCompanyName && brand.companyName && (
        <p 
          className="mt-4 font-semibold tracking-widest uppercase"
          style={{
            fontFamily: typography.captionFont.fontFamily,
            fontSize: `${typography.captionFont.fontSize}px`,
            color: typography.captionFont.color || colors.meta,
          }}
        >
          {brand.companyName}
        </p>
      )}
    </div>
  );
};

// Agenda Slide
const AgendaSlide: React.FC<{
  phases: Phase[];
  brand: ReturnType<typeof useBrandStore.getState>['brand'];
  config: ReturnType<typeof usePresentationStore.getState>['config'];
}> = ({ phases, config }) => {
  const colors = getThemeColors(config.theme);
  const { typography, layout, selectedPhaseIds } = config;
  const selectedPhases = phases.filter(p => selectedPhaseIds.includes(p.id));

  return (
    <div 
      className="flex flex-col justify-center h-full"
      style={{ padding: `${layout.contentPadding}px`, maxWidth: `${layout.maxContentWidth}px`, margin: '0 auto' }}
    >
      <h2 
        className="mb-10"
        style={{
          fontFamily: typography.titleFont.fontFamily,
          fontSize: `${typography.titleFont.fontSize * 0.75}px`,
          fontWeight: getFontWeight(typography.titleFont.fontWeight),
          color: typography.titleFont.color || colors.title,
          textAlign: layout.titleAlignment,
        }}
      >
        Agenda
      </h2>
      
      <div className="grid grid-cols-2 gap-4">
        {selectedPhases.map((phase, i) => (
          <div
            key={phase.id}
            className="flex items-center gap-4 p-4 rounded-2xl"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.07)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: `${layout.cardBorderRadius}px`,
            }}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg flex-shrink-0"
              style={{ backgroundColor: phase.backgroundColor }}
            >
              {i + 1}
            </div>
            <div>
              <div 
                className="font-bold text-base"
                style={{
                  fontFamily: typography.bodyFont.fontFamily,
                  color: typography.bodyFont.color || colors.title,
                }}
              >
                {phase.title}
              </div>
              {phase.subtitle && (
                <div 
                  className="text-sm"
                  style={{
                    fontFamily: typography.captionFont.fontFamily,
                    color: typography.captionFont.color || colors.subtitle,
                  }}
                >
                  {phase.subtitle}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Phase Slide
const PhaseSlide: React.FC<{
  slide: Slide;
  brand: ReturnType<typeof useBrandStore.getState>['brand'];
  config: ReturnType<typeof usePresentationStore.getState>['config'];
  roles: RoleDefinition[];
}> = ({ slide, config, roles }) => {
  const { phase } = slide;
  if (!phase) return null;

  const colors = getThemeColors(config.theme);
  const { typography, layout, content, slidesPerPhase } = config;

  const stepsToShow = phase.steps.slice(0, slidesPerPhase);

  return (
    <div 
      className="flex flex-col justify-center h-full"
      style={{ padding: `${layout.contentPadding}px`, maxWidth: `${layout.maxContentWidth}px`, margin: '0 auto' }}
    >
      {/* Phase number badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-1 rounded-full" style={{ backgroundColor: phase.backgroundColor }} />
        <span
          className="text-sm font-bold tracking-widest uppercase"
          style={{
            fontFamily: typography.captionFont.fontFamily,
            color: typography.captionFont.color || colors.meta,
          }}
        >
          Phase {(slide.phaseIndex || 0) + 1}
        </span>
      </div>

      <h2 
        className="leading-tight mb-4"
        style={{
          fontFamily: typography.titleFont.fontFamily,
          fontSize: `${typography.titleFont.fontSize * 0.75}px`,
          fontWeight: getFontWeight(typography.titleFont.fontWeight),
          color: typography.titleFont.color || colors.title,
          textAlign: layout.titleAlignment,
        }}
      >
        {phase.title}
      </h2>
      
      {phase.subtitle && (
        <p 
          className="text-xl mb-8"
          style={{
            fontFamily: typography.subtitleFont.fontFamily,
            color: typography.subtitleFont.color || colors.subtitle,
          }}
        >
          {phase.subtitle}
        </p>
      )}

      {/* Step cards */}
      <div 
        className="grid gap-4" 
        style={{ 
          gridTemplateColumns: `repeat(${Math.min(stepsToShow.length, 2)}, 1fr)`,
          gap: `${layout.cardGap}px`,
        }}
      >
        {stepsToShow.map((step) => (
          <div
            key={step.id}
            className="rounded-xl"
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.07)', 
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: `${layout.cardBorderRadius}px`,
              padding: `${layout.cardPadding}px`,
            }}
          >
            <div className="flex items-center gap-3 mb-3">
              {content.showStepIcons && (
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: phase.backgroundColor + '30' }}
                >
                  <span style={{ color: phase.backgroundColor }}>●</span>
                </div>
              )}
              <div 
                className="font-bold text-lg leading-tight"
                style={{
                  fontFamily: typography.bodyFont.fontFamily,
                  color: typography.bodyFont.color || colors.title,
                }}
              >
                {step.title}
              </div>
            </div>
            
            {content.showStepDescription && step.description && (
              <div 
                className="text-sm mb-3 leading-snug"
                style={{
                  fontFamily: typography.captionFont.fontFamily,
                  color: typography.captionFont.color || colors.subtitle,
                }}
              >
                {step.description.substring(0, content.descriptionMaxLength)}
                {step.description.length > content.descriptionMaxLength ? '…' : ''}
              </div>
            )}
            
            {content.showStepRoles && step.roleIds.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {step.roleIds.map(roleId => {
                  const role = roles.find(r => r.id === roleId);
                  if (!role) return null;
                  return (
                    <span 
                      key={roleId} 
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{ backgroundColor: role.color, color: role.textColor }}
                    >
                      {role.name}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {phase.steps.length > slidesPerPhase && (
        <p 
          className="text-sm mt-4 text-center"
          style={{
            fontFamily: typography.captionFont.fontFamily,
            color: typography.captionFont.color || colors.meta,
          }}
        >
          +{phase.steps.length - slidesPerPhase} more steps
        </p>
      )}
    </div>
  );
};

// Step Slide (simplified - showing key info)
const StepSlide: React.FC<{
  slide: Slide;
  brand: ReturnType<typeof useBrandStore.getState>['brand'];
  config: ReturnType<typeof usePresentationStore.getState>['config'];
  roles: RoleDefinition[];
}> = ({ slide, config, roles }) => {
  const { step, phase } = slide;
  if (!step || !phase) return null;

  const colors = getThemeColors(config.theme);
  const { typography, layout, content } = config;

  return (
    <div 
      className="flex flex-col justify-center h-full"
      style={{ padding: `${layout.contentPadding}px`, maxWidth: `${layout.maxContentWidth}px`, margin: '0 auto' }}
    >
      {/* Phase breadcrumb */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-6 h-1 rounded-full" style={{ backgroundColor: phase.backgroundColor }} />
        <span 
          className="text-sm font-medium tracking-wider uppercase"
          style={{
            fontFamily: typography.captionFont.fontFamily,
            color: typography.captionFont.color || colors.meta,
          }}
        >
          {phase.title}
        </span>
      </div>

      {/* Step title */}
      <div className="flex items-center gap-4 mb-6">
        {content.showStepIcons && (
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: phase.backgroundColor + '30' }}
          >
            <span style={{ color: phase.backgroundColor, fontSize: '24px' }}>●</span>
          </div>
        )}
        <h2 
          className="leading-tight"
          style={{
            fontFamily: typography.titleFont.fontFamily,
            fontSize: `${typography.titleFont.fontSize * 0.6}px`,
            fontWeight: getFontWeight(typography.titleFont.fontWeight),
            color: typography.titleFont.color || colors.title,
          }}
        >
          {step.title}
        </h2>
      </div>

      {/* Custom label */}
      {content.showStepType && step.customLabel && (
        <div 
          className="px-3 py-1 rounded-full w-fit mb-4"
          style={{ backgroundColor: config.accentColor + '20' }}
        >
          <span 
            className="text-sm font-medium"
            style={{
              fontFamily: typography.accentFont.fontFamily,
              color: config.accentColor,
            }}
          >
            {step.customLabel}
          </span>
        </div>
      )}

      {/* Description */}
      {content.showStepDescription && step.description && (
        <p 
          className="text-lg mb-6 max-w-3xl"
          style={{
            fontFamily: typography.bodyFont.fontFamily,
            fontSize: `${typography.bodyFont.fontSize}px`,
            color: typography.bodyFont.color || colors.body,
          }}
        >
          {step.description}
        </p>
      )}

      {/* Roles */}
      {content.showStepRoles && step.roleIds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {step.roleIds.map(roleId => {
            const role = roles.find(r => r.id === roleId);
            if (!role) return null;
            return (
              <span 
                key={roleId} 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: role.color, color: role.textColor }}
              >
                {role.name}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Thank You Slide
const ThankYouSlide: React.FC<{
  brand: ReturnType<typeof useBrandStore.getState>['brand'];
  config: ReturnType<typeof usePresentationStore.getState>['config'];
}> = ({ brand, config }) => {
  const colors = getThemeColors(config.theme);
  const { typography, layout } = config;

  return (
    <div 
      className="flex flex-col items-center justify-center h-full text-center"
      style={{ padding: `${layout.contentPadding}px` }}
    >
      <div 
        className="w-20 h-20 rounded-3xl mb-8 flex items-center justify-center text-white text-3xl font-black"
        style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
      >
        <span>✓</span>
      </div>
      
      <h1 
        className="mb-4"
        style={{
          fontFamily: typography.titleFont.fontFamily,
          fontSize: `${typography.titleFont.fontSize * 0.75}px`,
          fontWeight: getFontWeight(typography.titleFont.fontWeight),
          color: typography.titleFont.color || colors.title,
        }}
      >
        Thank You
      </h1>
      
      {brand.tagline && (
        <p 
          className="text-xl"
          style={{
            fontFamily: typography.subtitleFont.fontFamily,
            color: typography.subtitleFont.color || colors.subtitle,
          }}
        >
          {brand.tagline}
        </p>
      )}
      
      <div className="mt-10 h-1 w-20 rounded-full" style={{ backgroundColor: config.accentColor }} />
      
      {config.showCompanyName && brand.companyName && (
        <p 
          className="mt-4 font-semibold tracking-widest uppercase"
          style={{
            fontFamily: typography.captionFont.fontFamily,
            fontSize: `${typography.captionFont.fontSize}px`,
            color: typography.captionFont.color || colors.meta,
          }}
        >
          {brand.companyName}
        </p>
      )}
    </div>
  );
};

// Main Presentation View
export const PresentationViewPage: React.FC<Props> = ({ onClose }) => {
  const navigate = useNavigate();
  const phases = useInfographicStore((s) => s.phases);
  const roles = useInfographicStore((s) => s.roles);
  const titleBar = useInfographicStore((s) => s.titleBar);
  const { brand } = useBrandStore();
  const { config } = usePresentationStore();
  const [current, setCurrent] = useState(0);
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [thumbnailOpen, setThumbnailOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const infographicRef = useExportStore((s) => s.infographicRef);

  const slides = buildSlides(phases, titleBar, brand.companyName, config);

  const goNext = useCallback(() => setCurrent(c => Math.min(c + 1, slides.length - 1)), [slides.length]);
  const goPrev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') {
        if (onClose) onClose();
        else navigate('/present/config');
      }
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose, navigate]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleExportPDF = async () => {
    if (!infographicRef?.current) return;
    await exportInfographic(infographicRef.current, 'pdf');
  };

  const currentSlide = slides[current];

  const renderSlideContent = (slide: Slide) => {
    switch (slide.type) {
      case 'cover':
        return <CoverSlide titleBar={titleBar} brand={brand} config={config} />;
      case 'agenda':
        return <AgendaSlide phases={phases} brand={brand} config={config} />;
      case 'phase':
        return <PhaseSlide slide={slide} brand={brand} config={config} roles={roles} />;
      case 'step':
        return <StepSlide slide={slide} brand={brand} config={config} roles={roles} />;
      case 'thankyou':
        return <ThankYouSlide brand={brand} config={config} />;
      default:
        return null;
    }
  };

  // Get section name for footer
  const getSectionName = (slide: Slide): string | undefined => {
    if (slide.phase) return slide.phase.title;
    return undefined;
  };

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {config.showLogo && brand.logoBase64 ? (
            <img src={brand.logoBase64} alt="Logo" className="h-6 w-auto" />
          ) : (
            <div 
              className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ background: `linear-gradient(135deg, ${config.primaryColor}, ${config.secondaryColor})` }}
            >
              {(brand.companyName || 'P').charAt(0)}
            </div>
          )}
          <span className="text-white text-sm font-semibold">{brand.companyName || titleBar.text}</span>
        </div>

        <div className="flex items-center gap-4">
          {config.showSlideNumbers && (
            <span className="text-slate-400 text-sm">{current + 1} / {slides.length}</span>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={() => setThumbnailOpen(t => !t)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-xs"
              title="Toggle slide panel"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Fullscreen (F)"
            >
              <Maximize2 size={16} />
            </button>
            <button
              onClick={handleExportPDF}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Export PDF"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => onClose ? onClose() : navigate('/present/config')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close (Esc)"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slide thumbnails panel */}
        {thumbnailOpen && (
          <div className="w-40 bg-black/70 overflow-y-auto flex-shrink-0 py-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                onClick={() => setCurrent(i)}
                className={`w-full p-2 group transition-colors ${i === current ? 'bg-white/10' : 'hover:bg-white/5'}`}
              >
                <div
                  className={`w-full aspect-video rounded-lg overflow-hidden border-2 mb-1 transition-colors ${
                    i === current ? 'border-blue-400' : 'border-transparent group-hover:border-white/20'
                  }`}
                  style={{ background: getSlideBackground(config) }}
                >
                  <div className="h-full flex flex-col items-center justify-center p-1">
                    <div 
                      className="text-xs font-bold text-center truncate w-full"
                      style={{ 
                        color: config.theme === 'minimal' ? '#0f172a' : config.theme === 'bold' ? '#1e293b' : '#ffffff',
                        fontSize: '5px',
                      }}
                    >
                      {slide.title}
                    </div>
                  </div>
                </div>
                <div className="text-slate-500 text-xs text-center">{i + 1}</div>
              </button>
            ))}
          </div>
        )}

        {/* Main slide */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div
            key={currentSlide?.id}
            className="w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden relative"
            style={{
              aspectRatio: '16/9',
              background: getSlideBackground(config),
            }}
          >
            {/* Header */}
            <SlideHeader 
              config={config} 
              brand={brand} 
              slideNumber={current + 1}
              totalSlides={slides.length}
            />

            {/* Content */}
            <div 
              className="flex-1"
              style={{
                height: `calc(100% - ${config.header.enabled ? config.header.height : 0}px - ${config.footer.enabled ? config.footer.height : 0}px)`,
              }}
            >
              {currentSlide && renderSlideContent(currentSlide)}
            </div>

            {/* Footer */}
            <SlideFooter 
              config={config} 
              brand={brand}
              slideTitle={currentSlide?.title}
              slideNumber={current + 1}
              totalSlides={slides.length}
              sectionName={getSectionName(currentSlide)}
            />

            {/* Watermark */}
            {config.watermarkEnabled && brand.logoBase64 && (
              <div 
                className="absolute pointer-events-none"
                style={{
                  ...(config.watermarkPosition === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
                  ...(config.watermarkPosition === 'bottom-right' && { bottom: '20px', right: '20px' }),
                  ...(config.watermarkPosition === 'bottom-left' && { bottom: '20px', left: '20px' }),
                  ...(config.watermarkPosition === 'top-right' && { top: '20px', right: '20px' }),
                  ...(config.watermarkPosition === 'top-left' && { top: '20px', left: '20px' }),
                  opacity: config.watermarkOpacity,
                }}
              >
                <img src={brand.logoBase64} alt="Watermark" className="h-32 w-auto" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-6 py-3 bg-black/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={goPrev}
          disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 text-white hover:bg-white/10 disabled:hover:bg-transparent"
        >
          <ChevronLeft size={18} /> Previous
        </button>

        {/* Progress dots */}
        {config.showProgressIndicator && (
          <div className="flex gap-1.5 items-center max-w-md overflow-hidden">
            {slides.length > 20 ? (
              <>
                {slides.slice(0, 5).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className="transition-all"
                    style={{
                      width: i === current ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: i === current ? config.primaryColor : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
                {current > 4 && current < slides.length - 5 && (
                  <>
                    <span className="text-slate-500 text-xs">...</span>
                    <button
                      onClick={() => setCurrent(current)}
                      className="transition-all"
                      style={{
                        width: '20px',
                        height: '6px',
                        borderRadius: '3px',
                        backgroundColor: config.primaryColor,
                      }}
                    />
                  </>
                )}
                <span className="text-slate-500 text-xs">...</span>
                {slides.slice(-5).map((_, i) => (
                  <button
                    key={slides.length - 5 + i}
                    onClick={() => setCurrent(slides.length - 5 + i)}
                    className="transition-all"
                    style={{
                      width: (slides.length - 5 + i) === current ? '20px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: (slides.length - 5 + i) === current ? config.primaryColor : 'rgba(255,255,255,0.3)',
                    }}
                  />
                ))}
              </>
            ) : (
              slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="transition-all"
                  style={{
                    width: i === current ? '20px' : '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: i === current ? config.primaryColor : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))
            )}
          </div>
        )}

        <button
          onClick={goNext}
          disabled={current === slides.length - 1}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors disabled:opacity-30 text-white hover:bg-white/10 disabled:hover:bg-transparent"
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default PresentationViewPage;