import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X, ChevronLeft, ChevronRight, Maximize2, Download,
  LayoutGrid, BarChart3, Target, Map, Zap, Circle
} from 'lucide-react';
import { useInfographicStore } from '../../store/useInfographicStore';
import { useBrandStore } from '../../store/useBrandStore';
import type { Phase, Step } from '../../types';
import type { BrandKit } from '../../types/integrations';
import { exportInfographic } from '../../utils/export';
import { useExportStore } from '../../store/useExportStore';

interface Props {
  onClose: () => void;
}

type SlideType = 'cover' | 'agenda' | 'phase' | 'step' | 'metrics' | 'roadmap' | 'thankyou';

interface Slide {
  id: string;
  type: SlideType;
  title: string;
  phase?: Phase;
  step?: Step;
  phaseIndex?: number;
}

function buildSlides(phases: Phase[], titleBar: { text: string; subtitle?: string }, companyName: string): Slide[] {
  const slides: Slide[] = [];

  // Cover slide
  slides.push({ id: 'cover', type: 'cover', title: titleBar.text });

  // Agenda slide (if 3+ phases)
  if (phases.length >= 3) {
    slides.push({ id: 'agenda', type: 'agenda', title: 'Agenda' });
  }

  // One slide per phase
  phases.forEach((phase, phaseIndex) => {
    slides.push({ id: `phase-${phase.id}`, type: 'phase', title: phase.title, phase, phaseIndex });

    // Individual step slides for metric/okr/sprint/roadmap/executive types
    phase.steps
      .filter(s => ['metrics', 'okr', 'sprint', 'roadmap', 'executive', 'kanban'].includes(s.type))
      .forEach(step => {
        slides.push({ id: `step-${step.id}`, type: 'step', title: step.title, phase, step, phaseIndex });
      });
  });

  // Thank you / closing slide
  slides.push({ id: 'thankyou', type: 'thankyou', title: companyName || 'Thank You' });

  return slides;
}

// ─── Slide Renderers ─────────────────────────────────────────────────────────

interface SlideProps {
  slide: Slide;
  brand: BrandKit;
  titleBar: { text: string; subtitle?: string; logoUrl?: string };
  phases: Phase[];
  themeStyles: ThemeStyles;
}

interface ThemeStyles {
  container: string;
  titleColor: string;
  subtitleColor: string;
  accentColor: string;
  cardBg: string;
  cardBorder: string;
  metaColor: string;
}

function getThemeStyles(theme: string, primary: string, _secondary: string): ThemeStyles {
  const themes: Record<string, ThemeStyles> = {
    corporate: {
      container: 'bg-slate-800 text-white',
      titleColor: '#ffffff',
      subtitleColor: '#94a3b8',
      accentColor: primary,
      cardBg: 'rgba(255,255,255,0.07)',
      cardBorder: 'rgba(255,255,255,0.1)',
      metaColor: '#64748b',
    },
    modern: {
      container: 'text-white',
      titleColor: '#ffffff',
      subtitleColor: 'rgba(255,255,255,0.75)',
      accentColor: '#ffffff',
      cardBg: 'rgba(255,255,255,0.12)',
      cardBorder: 'rgba(255,255,255,0.2)',
      metaColor: 'rgba(255,255,255,0.5)',
    },
    minimal: {
      container: 'bg-white text-slate-900 border border-slate-100',
      titleColor: '#0f172a',
      subtitleColor: '#64748b',
      accentColor: primary,
      cardBg: '#f8fafc',
      cardBorder: '#e2e8f0',
      metaColor: '#94a3b8',
    },
    bold: {
      container: 'bg-yellow-400 text-slate-900',
      titleColor: '#1e293b',
      subtitleColor: '#475569',
      accentColor: '#1e293b',
      cardBg: 'rgba(0,0,0,0.08)',
      cardBorder: 'rgba(0,0,0,0.12)',
      metaColor: '#64748b',
    },
    dark: {
      container: 'bg-slate-950 text-cyan-400',
      titleColor: '#22d3ee',
      subtitleColor: '#0e7490',
      accentColor: '#22d3ee',
      cardBg: 'rgba(34,211,238,0.07)',
      cardBorder: 'rgba(34,211,238,0.2)',
      metaColor: '#0e7490',
    },
  };
  return themes[theme] || themes.corporate;
}

const CoverSlide: React.FC<SlideProps> = ({ brand, titleBar, themeStyles }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-16">
    {brand.logoBase64 || titleBar.logoUrl ? (
      <img src={brand.logoBase64 || titleBar.logoUrl} alt="Logo" className="h-20 w-auto object-contain mb-8" />
    ) : (
      <div className="w-20 h-20 rounded-3xl mb-8 flex items-center justify-center text-white text-3xl font-black"
        style={{ background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})` }}>
        {(brand.companyName || 'P').charAt(0)}
      </div>
    )}
    <h1
      className="text-5xl font-black leading-tight mb-4"
      style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}
    >
      {titleBar.text}
    </h1>
    {titleBar.subtitle && (
      <p className="text-xl font-medium max-w-2xl" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
        {titleBar.subtitle}
      </p>
    )}
    <div className="mt-10 h-1 w-20 rounded-full" style={{ backgroundColor: themeStyles.accentColor }} />
    {brand.companyName && (
      <p className="mt-4 text-sm font-semibold tracking-widest uppercase" style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}>
        {brand.companyName}
      </p>
    )}
  </div>
);

const AgendaSlide: React.FC<SlideProps> = ({ phases, brand, themeStyles }) => (
  <div className="flex flex-col justify-center h-full px-16">
    <h2 className="text-4xl font-black mb-10" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
      Agenda
    </h2>
    <div className="grid grid-cols-2 gap-4">
      {phases.map((phase, i) => (
        <div
          key={phase.id}
          className="flex items-center gap-4 p-4 rounded-2xl"
          style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg flex-shrink-0"
            style={{ backgroundColor: phase.backgroundColor }}
          >
            {i + 1}
          </div>
          <div>
            <div className="font-bold text-base" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
              {phase.title}
            </div>
            {phase.subtitle && (
              <div className="text-sm" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
                {phase.subtitle}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

const STEP_TYPE_ICONS_MAP: Record<string, React.ElementType> = {
  metrics: BarChart3,
  okr: Target,
  roadmap: Map,
  sprint: Zap,
  kanban: LayoutGrid,
  executive: BarChart3,
};

const PhaseSlide: React.FC<SlideProps> = ({ slide, brand, themeStyles }) => {
  const { phase } = slide;
  if (!phase) return null;

  return (
    <div className="flex flex-col justify-center h-full px-16">
      {/* Phase number badge */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-1 rounded-full" style={{ backgroundColor: phase.backgroundColor }} />
        <span
          className="text-sm font-bold tracking-widest uppercase"
          style={{ color: themeStyles.metaColor, fontFamily: brand.fonts.body }}
        >
          Phase {(slide.phaseIndex || 0) + 1}
        </span>
      </div>

      <h2 className="text-5xl font-black leading-tight mb-4" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
        {phase.title}
      </h2>
      {phase.subtitle && (
        <p className="text-xl mb-8" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
          {phase.subtitle}
        </p>
      )}

      {/* Step cards */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(phase.steps.length, 4)}, 1fr)` }}>
        {phase.steps.slice(0, 8).map((step) => {
          const IconComp = STEP_TYPE_ICONS_MAP[step.type] || Circle;
          return (
            <div
              key={step.id}
              className="rounded-xl p-4"
              style={{ backgroundColor: themeStyles.cardBg, border: `1px solid ${themeStyles.cardBorder}` }}
            >
              <IconComp size={18} style={{ color: phase.backgroundColor, marginBottom: '6px' }} />
              <div className="font-semibold text-sm leading-tight" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
                {step.title}
              </div>
              {step.description && (
                <div className="text-xs mt-1 leading-snug opacity-70" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
                  {step.description.substring(0, 80)}{step.description.length > 80 ? '…' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ThankYouSlide: React.FC<SlideProps> = ({ brand, themeStyles }) => (
  <div className="flex flex-col items-center justify-center h-full text-center px-16">
    <div className="w-20 h-20 rounded-3xl mb-8 flex items-center justify-center text-white text-3xl font-black"
      style={{ background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})` }}>
      <span>✓</span>
    </div>
    <h1 className="text-6xl font-black mb-4" style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.heading }}>
      Thank You
    </h1>
    {brand.tagline && (
      <p className="text-xl" style={{ color: themeStyles.subtitleColor, fontFamily: brand.fonts.body }}>
        {brand.tagline}
      </p>
    )}
    <div className="mt-10 h-1 w-20 rounded-full" style={{ backgroundColor: themeStyles.accentColor }} />
    {brand.companyName && (
      <p className="mt-4 text-sm font-semibold tracking-widest uppercase" style={{ color: themeStyles.metaColor }}>
        {brand.companyName}
      </p>
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const PresentationMode: React.FC<Props> = ({ onClose }) => {
  const phases = useInfographicStore((s) => s.phases);
  const titleBar = useInfographicStore((s) => s.titleBar);
  const { brand } = useBrandStore();
  const [current, setCurrent] = useState(0);
  const [_isFullscreen, setIsFullscreen] = useState(false);
  const [thumbnailOpen, setThumbnailOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const infographicRef = useExportStore((s) => s.infographicRef);

  const slides = buildSlides(phases, titleBar, brand.companyName);
  const themeStyles = getThemeStyles(brand.presentationTheme, brand.colors.primary, brand.colors.secondary);

  const goNext = useCallback(() => setCurrent(c => Math.min(c + 1, slides.length - 1)), [slides.length]);
  const goPrev = useCallback(() => setCurrent(c => Math.max(c - 1, 0)), []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, onClose]);

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

  const getModernGradient = () => {
    if (brand.presentationTheme === 'modern') {
      return `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})`;
    }
    return undefined;
  };

  const renderSlide = (slide: Slide) => {
    const props: SlideProps = { slide, brand, titleBar, phases, themeStyles };
    switch (slide.type) {
      case 'cover': return <CoverSlide {...props} />;
      case 'agenda': return <AgendaSlide {...props} />;
      case 'phase': return <PhaseSlide {...props} />;
      case 'thankyou': return <ThankYouSlide {...props} />;
      default: return <PhaseSlide {...props} />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/80 backdrop-blur-sm z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          {brand.logoBase64 ? (
            <img src={brand.logoBase64} alt="Logo" className="h-6 w-auto" />
          ) : (
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-black"
              style={{ background: `linear-gradient(135deg, ${brand.colors.primary}, ${brand.colors.secondary})` }}>
              {(brand.companyName || 'P').charAt(0)}
            </div>
          )}
          <span className="text-white text-sm font-semibold">{brand.companyName || titleBar.text}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Slide counter */}
          <span className="text-slate-400 text-sm">{current + 1} / {slides.length}</span>

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
              onClick={onClose}
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
                  className={`w-full aspect-video rounded-lg overflow-hidden border-2 mb-1 transition-colors ${i === current ? 'border-blue-400' : 'border-transparent group-hover:border-white/20'}`}
                  style={{ background: getModernGradient() || (brand.presentationTheme === 'dark' ? '#030712' : brand.presentationTheme === 'minimal' ? '#ffffff' : brand.presentationTheme === 'bold' ? '#facc15' : '#1e293b') }}
                >
                  <div className="h-full flex flex-col items-center justify-center p-1">
                    <div className="text-xs font-bold text-center truncate w-full" style={{ color: themeStyles.titleColor, fontSize: '5px' }}>
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
            className={`w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden ${themeStyles.container}`}
            style={{
              aspectRatio: '16/9',
              background: getModernGradient() || undefined,
              position: 'relative',
            }}
          >
            {renderSlide(currentSlide)}

            {/* Slide number watermark */}
            <div
              className="absolute bottom-4 right-6 text-xs font-semibold opacity-30"
              style={{ color: themeStyles.titleColor, fontFamily: brand.fonts.body }}
            >
              {current + 1}/{slides.length}
            </div>
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
        <div className="flex gap-1.5 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="transition-all"
              style={{
                width: i === current ? '20px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: i === current ? brand.colors.primary : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

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
