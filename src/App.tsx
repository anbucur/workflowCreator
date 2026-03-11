import { useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { PresentationConfigPage } from './pages/PresentationConfigPage';
import { PresentationViewPage } from './pages/PresentationViewPage';
import { ExportPreviewPage } from './pages/ExportPreviewPage';
import { useInfographicStore } from './store/useInfographicStore';
import { useThemeStore } from './store/useThemeStore';
import { PROJECTS_API_URL, AUTO_SAVE_DELAY } from './config/constants';
import debounce from 'lodash.debounce';

function AppContent() {
  const [loading, setLoading] = useState(true);
  const loadInfographic = useInfographicStore(s => s.loadInfographic);
  const isDarkMode = useThemeStore(s => s.isDarkMode);

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-save: use ref so the debounced function is stable across renders
  const saveToDbRef = useRef(
    debounce(async (data: { id: string; name?: string; titleBar?: { text: string } }) => {
      try {
        await fetch(PROJECTS_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.id,
            name: data.name || data.titleBar?.text || 'Untitled Project',
            data
          })
        });
      } catch (e) { console.error('Auto-save failed', e); }
    }, AUTO_SAVE_DELAY)
  );

  useEffect(() => {
    // Try the live API first (dev / server mode).
    // If it is unavailable (e.g. static GitHub Pages deployment) fall back to
    // the pre-exported projects.json that was generated from workflow.sqlite at
    // build time.
    fetch(PROJECTS_API_URL)
      .then(res => {
        if (!res.ok) throw new Error('API unavailable');
        return res.json();
      })
      .then(projects => {
        if (projects && projects.length > 0) {
          return fetch(`${PROJECTS_API_URL}/${projects[0].id}`).then(res => res.json());
        }
        return null; // Start fresh
      })
      .then(data => {
        if (data) loadInfographic(data);
        setLoading(false);
      })
      .catch(() => {
        // API unavailable — try the static export bundled with the Pages build.
        fetch(`${import.meta.env.BASE_URL}data/projects.json`)
          .then(res => {
            if (!res.ok) throw new Error('No static data');
            return res.json();
          })
          .then((projects: Array<{ id: string; name: string; updated_at: number; data: unknown }>) => {
            if (projects && projects.length > 0) {
              loadInfographic(projects[0].data as Parameters<typeof loadInfographic>[0]);
            }
            setLoading(false);
          })
          .catch(() => {
            // No static data either — start with built-in defaults.
            setLoading(false);
          });
      });
  }, [loadInfographic]);

  useEffect(() => {
    if (loading) return;
    const unsub = useInfographicStore.subscribe(() => {
      saveToDbRef.current(useInfographicStore.getState().getSnapshot());
    });
    return unsub;
  }, [loading]);

  if (loading) {
    return (
      <div className={`h-screen w-screen flex items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
        Connecting to database...
      </div>
    );
  }

  return (
    <Routes>
      {/* Main project editor */}
      <Route path="/" element={<AppShell />} />
      <Route path="/project" element={<AppShell />} />
      <Route path="/project/:id" element={<AppShell />} />
      
      {/* Presentation routes */}
      <Route path="/presentation" element={<PresentationConfigPage />} />
      <Route path="/presentation/config" element={<PresentationConfigPage />} />
      <Route path="/present" element={<PresentationViewPage />} />
      
      {/* Export preview route */}
      <Route path="/preview" element={<ExportPreviewPage />} />
      
      {/* Catch-all redirect to project */}
      <Route path="*" element={<Navigate to="/project" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;