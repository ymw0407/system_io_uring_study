import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import { Layout } from './components/Layout/Layout';
import Landing from './pages/index';
import Part1 from './pages/part1';
import Part2 from './pages/part2';
import Part3 from './pages/part3';
import Part4 from './pages/part4';
import SetupPage from './pages/setup';
import SetupMacPage from './pages/setup-mac';
import SetupLinuxPage from './pages/setup-linux';
import SetupWindowsPage from './pages/setup-windows';

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
          <Route path="part1" element={<Part1 />} />
          <Route path="part2" element={<Part2 />} />
          <Route path="part3" element={<Part3 />} />
          <Route path="part4" element={<Part4 />} />
          <Route path="setup" element={<SetupPage />} />
          <Route path="setup-mac" element={<SetupMacPage />} />
          <Route path="setup-linux" element={<SetupLinuxPage />} />
          <Route path="setup-windows" element={<SetupWindowsPage />} />
          <Route path="tools" element={<Suspense fallback={null}><Tools /></Suspense>} />
          <Route path="simulator" element={<Suspense fallback={null}><Simulator /></Suspense>} />
          <Route path="emulator" element={<Suspense fallback={null}><Emulator /></Suspense>} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
);
