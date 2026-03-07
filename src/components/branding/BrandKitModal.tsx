import React, { useRef } from 'react';
import { X, Palette, Upload, Sparkles, RefreshCw, Check, Wand2 } from 'lucide-react';
import { useBrandStore } from '../../store/useBrandStore';
import { useThemeStore } from '../../store/useThemeStore';
import type { BrandKit } from '../../types/integrations';

interface Props {
  onClose: () => void;
}

const FONT_OPTIONS = [
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Playfair Display', value: "'Playfair Display', serif" },
  { label: 'Raleway', value: "'Raleway', sans-serif" },
  { label: 'Space Grotesk', value: "'Space Grotesk', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'IBM Plex Sans', value: "'IBM Plex Sans', sans-serif" },
];

const PRESENTATION_THEMES: { id: BrandKit['presentationTheme']; label: string; preview: string }[] = [
  { id: 'corporate', label: 'Corporate', preview: 'bg-slate-800 text-white' },
  { id: 'modern', label: 'Modern', preview: 'bg-gradient-to-br from-blue-600 to-purple-700 text-white' },
  { id: 'minimal', label: 'Minimal', preview: 'bg-white text-slate-900 border' },
  { id: 'bold', label: 'Bold', preview: 'bg-yellow-400 text-slate-900' },
  { id: 'dark', label: 'Dark Tech', preview: 'bg-slate-950 text-cyan-400' },
];

// Built-in brand presets
const BRAND_PRESETS = [
  { name: 'TechCorp', primary: '#3b82f6', secondary: '#8b5cf6', accent: '#06b6d4', bg: '#f8fafc', text: '#1e293b' },
  { name: 'Creative Agency', primary: '#f43f5e', secondary: '#f97316', accent: '#facc15', bg: '#fafaf9', text: '#1c1917' },
  { name: 'Finance Pro', primary: '#0f766e', secondary: '#0369a1', accent: '#0891b2', bg: '#f8fafc', text: '#0f172a' },
  { name: 'Startup Vibes', primary: '#6d28d9', secondary: '#ec4899', accent: '#8b5cf6', bg: '#faf5ff', text: '#1e1b4b' },
];

export const BrandKitModal: React.FC<Props> = ({ onClose }) => {
  const { isDarkMode } = useThemeStore();
  const { brand, updateBrand, updateColors, updateFonts, setLogo, resetBrand, applyBrandToWorkflow, brandApplied } = useBrandStore();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('Please upload an image file.'); return; }
    if (file.size > 2 * 1024 * 1024) { alert('Logo must be under 2MB.'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { if (ev.target?.result) setLogo(ev.target.result as string); };
    reader.readAsDataURL(file);
    if (e.target) e.target.value = '';
  };

  const base = isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900';
  const cardBg = isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200';
  const inputCls = `w-full rounded-lg px-3 py-2 text-sm border outline-none transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100 focus:border-blue-500' : 'bg-white border-slate-200 text-slate-900 focus:border-blue-500'}`;
  const labelCls = `block text-xs font-semibold mb-1 uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className={`w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${base}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center">
              <Palette size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Brand Kit</h2>
              <p className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Define your company identity and apply it to all boards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={applyBrandToWorkflow}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90 transition-opacity shadow-sm"
            >
              <Wand2 size={14} />
              {brandApplied ? <><Check size={13} />Applied!</> : 'Apply to Workflow'}
            </button>
            <button onClick={onClose} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Presets */}
          <div>
            <div className={labelCls}>Quick Presets</div>
            <div className="grid grid-cols-4 gap-2">
              {BRAND_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => updateBrand({ companyName: preset.name, colors: { primary: preset.primary, secondary: preset.secondary, accent: preset.accent, background: preset.bg, text: preset.text } })}
                  className={`rounded-xl p-3 border text-center transition-all hover:scale-105 ${cardBg}`}
                >
                  <div className="flex gap-1 justify-center mb-2">
                    {[preset.primary, preset.secondary, preset.accent].map((c, i) => (
                      <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Identity */}
          <div className={`rounded-xl p-4 border space-y-3 ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={15} className={isDarkMode ? 'text-slate-400' : 'text-slate-500'} />
              <span className="font-semibold text-sm">Company Identity</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Company Name</label>
                <input className={inputCls} value={brand.companyName}
                  onChange={e => updateBrand({ companyName: e.target.value })} placeholder="Acme Corp" />
              </div>
              <div>
                <label className={labelCls}>Tagline</label>
                <input className={inputCls} value={brand.tagline}
                  onChange={e => updateBrand({ tagline: e.target.value })} placeholder="Your company tagline" />
              </div>
            </div>

            {/* Logo upload */}
            <div>
              <label className={labelCls}>Logo</label>
              <div className={`rounded-xl border-2 border-dashed p-4 flex items-center gap-4 cursor-pointer hover:border-blue-400 transition-colors ${isDarkMode ? 'border-slate-600' : 'border-slate-300'}`}
                onClick={() => logoInputRef.current?.click()}>
                {brand.logoBase64 ? (
                  <>
                    <img src={brand.logoBase64} alt="Logo" className="h-12 w-12 object-contain rounded-lg" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Logo uploaded</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Click to replace</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); updateBrand({ logoBase64: undefined }); }}
                      className={`p-1.5 rounded-lg ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                      <Upload size={20} className={isDarkMode ? 'text-slate-400' : 'text-slate-400'} />
                    </div>
                    <div>
                      <div className="font-medium text-sm">Upload Logo</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>PNG, JPG, SVG up to 2MB</div>
                    </div>
                  </>
                )}
                <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
              </div>
            </div>
          </div>

          {/* Colors */}
          <div className={`rounded-xl p-4 border space-y-3 ${cardBg}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-1">
                {[brand.colors.primary, brand.colors.secondary, brand.colors.accent].map((c, i) => (
                  <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: c }} />
                ))}
              </div>
              <span className="font-semibold text-sm">Brand Colors</span>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {(Object.keys(brand.colors) as (keyof typeof brand.colors)[]).map((key) => (
                <div key={key}>
                  <label className={labelCls}>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <div className="flex gap-1.5 items-center">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-black/10 flex-shrink-0">
                      <input
                        type="color"
                        value={brand.colors[key]}
                        onChange={e => updateColors({ [key]: e.target.value })}
                        className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
                      />
                      <div className="w-full h-full" style={{ backgroundColor: brand.colors[key] }} />
                    </div>
                    <input
                      className={`${inputCls} font-mono text-xs`}
                      value={brand.colors[key]}
                      onChange={e => updateColors({ [key]: e.target.value })}
                      maxLength={7}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fonts */}
          <div className={`rounded-xl p-4 border space-y-3 ${cardBg}`}>
            <span className="font-semibold text-sm">Typography</span>
            <div className="grid grid-cols-2 gap-3">
              {(['heading', 'body'] as const).map((type) => (
                <div key={type}>
                  <label className={labelCls}>{type.charAt(0).toUpperCase() + type.slice(1)} Font</label>
                  <select
                    className={inputCls}
                    value={brand.fonts[type]}
                    onChange={e => updateFonts({ [type]: e.target.value })}
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.value} value={f.value} style={{ fontFamily: f.value }}>{f.label}</option>
                    ))}
                  </select>
                  <div className="mt-1 truncate" style={{ fontFamily: brand.fonts[type], fontSize: '13px', color: isDarkMode ? '#cbd5e1' : '#475569' }}>
                    {type === 'heading' ? brand.companyName || 'Heading Preview' : brand.tagline || 'Body text preview'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Presentation Theme */}
          <div className={`rounded-xl p-4 border space-y-3 ${cardBg}`}>
            <span className="font-semibold text-sm">Presentation Style</span>
            <div className="grid grid-cols-5 gap-2">
              {PRESENTATION_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateBrand({ presentationTheme: t.id })}
                  className={`rounded-xl p-3 text-center transition-all border-2 ${brand.presentationTheme === t.id ? 'border-blue-500 scale-105' : 'border-transparent'}`}
                >
                  <div className={`w-full aspect-video rounded-lg mb-1 flex items-center justify-center text-xs font-bold ${t.preview}`}>
                    Aa
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <button
              onClick={resetBrand}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${isDarkMode ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <RefreshCw size={14} />
              Reset to Default
            </button>
            <button
              onClick={() => { applyBrandToWorkflow(); onClose(); }}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-90 transition-opacity shadow-sm"
            >
              <Wand2 size={14} />
              Apply & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
