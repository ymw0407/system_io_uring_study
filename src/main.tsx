import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { Layout } from './components/Layout/Layout';
import Landing from './pages/index';
import Round1 from './pages/round1';
import Round2 from './pages/round2';
import Round3 from './pages/round3';

const Tools = lazy(() => import('./pages/tools'));
const Simulator = lazy(() => import('./pages/simulator'));
const Emulator = lazy(() => import('./pages/emulator'));

const root = document.getElementById('root');
if (!root) throw new Error('Root element not found');

createRoot(root).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="round1" element={<Round1 />} />
          <Route path="round2" element={<Round2 />} />
          <Route path="round3" element={<Round3 />} />
          <Route path="tools" element={<Suspense fallback={null}><Tools /></Suspense>} />
          <Route path="simulator" element={<Suspense fallback={null}><Simulator /></Suspense>} />
          <Route path="emulator" element={<Suspense fallback={null}><Emulator /></Suspense>} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
);
