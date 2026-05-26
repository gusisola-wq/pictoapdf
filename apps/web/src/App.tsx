import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from './app-shell/AppShell';
import { UserSelector } from './app-shell/UserSelector';
import { GlobalToast } from './shared/GlobalToast';
import { GlobalConfirmModal } from './shared/GlobalConfirmModal';

const PDFPage = lazy(() => import('./modules/picto-pdf/pages/PDFPage'));

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/user-select" element={<UserSelector />} />
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/pdf" replace />} />
          <Route
            path="pdf"
            element={
              <Suspense fallback={<div className="h-dvh flex items-center justify-center bg-slate-900 text-slate-400 text-sm">Cargando...</div>}>
                <PDFPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
      <GlobalToast />
      <GlobalConfirmModal />
    </>
  );
}
