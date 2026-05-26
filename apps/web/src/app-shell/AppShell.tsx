import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@picto/core';
import { Header } from './Header';

export function AppShell() {
  const currentUser = useUserStore((s) => s.currentUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!currentUser && location.pathname !== '/user-select') {
      navigate('/user-select', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  if (!currentUser) return null;

  return (
    <div className="h-dvh bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-slate-100 flex flex-col font-sans overflow-hidden">
      <Header />
      <main className="flex-1 max-h-full flex flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
