import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore, AVATARS, uid } from '@picto/core';
import { migrateFromLocalStorage, clearLegacyStorage } from '@picto/storage';
import { Layers, Plus, Sparkles } from 'lucide-react';

export function UserSelector() {
  const { users, addUser, setCurrentUser } = useUserStore();
  const navigate = useNavigate();
  const [showNewForm, setShowNewForm] = useState(false);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);

  async function handleSelectUser(userId: string) {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    setCurrentUser(user);

    const migrated = await migrateFromLocalStorage(userId);
    if (migrated) {
      setTimeout(() => clearLegacyStorage(), 2000);
    }

    navigate('/pdf', { replace: true });
  }

  function handleCreateUser() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const user = addUser(trimmed, avatar);
    setCurrentUser(user);

    migrateFromLocalStorage(user.id).then((migrated) => {
      if (migrated) setTimeout(() => clearLegacyStorage(), 2000);
    });

    navigate('/pdf', { replace: true });
  }

  return (
    <div className="h-dvh bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="p-3 bg-blue-600 rounded-xl inline-block mb-3 shadow-lg">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Plataforma CAA</h1>
          <p className="text-sm text-slate-400 mt-1">
            Elige o crea tu perfil para empezar
          </p>
        </div>

        {users.length > 0 && !showNewForm && (
          <>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u.id)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer active:scale-95"
                >
                  <span className="text-3xl">{u.avatar}</span>
                  <span className="text-xs font-semibold text-slate-200 text-center leading-tight">
                    {u.name}
                  </span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowNewForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-white/20 rounded-2xl text-sm text-slate-400 hover:text-slate-200 hover:border-white/30 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nuevo Perfil
            </button>
          </>
        )}

        {(showNewForm || users.length === 0) && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-slate-200 mb-4">
              {users.length === 0 ? 'Crear tu perfil' : 'Nuevo perfil'}
            </h2>

            <label className="block text-xs font-medium text-slate-400 mb-2">
              Elige tu avatar
            </label>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => setAvatar(a)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all cursor-pointer ${
                    avatar === a
                      ? 'border-blue-400 bg-blue-500/20 scale-110'
                      : 'border-white/10 hover:bg-white/5'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <label className="block text-xs font-medium text-slate-400 mb-2">
              Tu nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateUser()}
              placeholder="Ej: Juan, María..."
              className="w-full text-sm p-3 rounded-xl border border-white/15 focus:border-blue-400 focus:outline-none bg-slate-950/50 text-white placeholder:text-slate-500 mb-4 transition-colors"
              autoFocus
            />

            <button
              onClick={handleCreateUser}
              disabled={!name.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-xl text-sm transition cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {users.length === 0 ? 'Comenzar' : 'Crear Perfil'}
            </button>

            {users.length > 0 && (
              <button
                onClick={() => setShowNewForm(false)}
                className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                Volver
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
