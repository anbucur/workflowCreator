import { useEffect, useState, useCallback } from 'react';
import { AppShell } from './components/layout/AppShell';
import { useInfographicStore } from './store/useInfographicStore';
import debounce from 'lodash.debounce';

const BACKEND_URL = 'http://localhost:5173/api/projects';

function App() {
  const [loading, setLoading] = useState(true);
  const loadInfographic = useInfographicStore(s => s.loadInfographic);

  // Auto-save logic
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const saveToDb = useCallback(
    debounce(async (data) => {
      try {
        await fetch(BACKEND_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: data.id,
            name: data.titleBar?.title || 'Untitled Project',
            data
          })
        });
      } catch (e) { console.error('Auto-save failed', e); }
    }, 1000),
    []
  );

  useEffect(() => {
    fetch(BACKEND_URL)
      .then(res => res.json())
      .then(projects => {
        if (projects && projects.length > 0) {
          return fetch(`${BACKEND_URL}/${projects[0].id}`).then(res => res.json());
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
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-50 text-slate-500">Connecting to database...</div>;
  }

  return <AppShell />;
}

export default App;
