import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore, AVATARS } from '@picto/core';
import { Layers, ChevronDown } from 'lucide-react';

const MODULES = [
  { path: '/comunicador', label: 'Comunicador' },
  { path: '/pdf', label: 'Picto a PDF' },
];

export function Header() {
  const { currentUser, users, switchUser } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelectUser(userId: string) {
    switchUser(userId);
    setDropdownOpen(false);
    navigate('/comunicador');
  }

  return (
    <header className="bg-white/5 backdrop-blur-md border-b border-white/10 py-3 px-6 shadow-lg shrink-0 flex items-center justify-between z-30 sticky top-0">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg text-white shadow-lg">
            <Layers className="w-5 h-5" />
          </div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-100">
            Plataforma CAA
          </h1>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {MODULES.map((mod) => (
            <button
              key={mod.label}
              onClick={() => navigate(mod.path)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                location.pathname === mod.path
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {mod.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="relative" ref={ref}>
        {currentUser && (
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition border border-white/10 cursor-pointer"
          >
            <span className="text-lg">{currentUser.avatar}</span>
            <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
              {currentUser.name}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
        )}

        {dropdownOpen && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-1 z-50">
            <div className="px-3 py-1.5 text-[10px] text-slate-500 uppercase tracking-wide font-semibold">
              Cambiar perfil
            </div>
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleSelectUser(u.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition hover:bg-white/5 cursor-pointer ${
                  u.id === currentUser?.id ? 'text-white bg-white/5' : 'text-slate-300'
                }`}
              >
                <span className="text-base">{u.avatar}</span>
                <span className="font-medium">{u.name}</span>
              </button>
            ))}
            <div className="border-t border-white/10 mt-1 pt-1">
              <button
                onClick={() => { setDropdownOpen(false); navigate('/user-select'); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-blue-400 hover:bg-white/5 transition cursor-pointer"
              >
                + Nueva perfil
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
