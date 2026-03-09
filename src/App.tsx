import { useEffect, useState, useCallback } from 'react';
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

  // Auto-save logic
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveToDb = useCallback(
    debounce(async (data) => {
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
    }, AUTO_SAVE_DELAY),
    []
  );

  useEffect(() => {
    fetch(PROJECTS_API_URL)
      .then(res => res.json())
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
      .catch((e) => {
        console.warn('Backend not running or schema empty, using defaults.', e);
        setLoading(false);
      });
  }, [loadInfographic]);

  useEffect(() => {
    if (loading) return;
    const unsub = useInfographicStore.subscribe(() => {
      // Create snapshot and save to maintain sync
      saveToDb(useInfographicStore.getState().getSnapshot());
    });
    return unsub;
  }, [loading, saveToDb]);

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