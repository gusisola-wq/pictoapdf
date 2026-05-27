import { create } from 'zustand';
import type { User } from '../types';
import { uid } from '../utils';

const USERS_STORAGE_KEY = 'picto-users';
const CURRENT_USER_KEY = 'picto-current-user';

function loadUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUsers(users: User[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch { /* quota exceeded */ }
}

function saveCurrentUser(user: User | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch { /* quota exceeded */ }
}

export const AVATARS = ['🧑', '👩', '👨', '🧒', '👧', '👦', '👩‍🦰', '👨‍🦱', '🧓', '👵'];

function randomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}

interface UserStore {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User) => void;
  addUser: (name: string, avatar?: string) => User;
  switchUser: (userId: string) => void;
  removeUser: (userId: string) => void;
  loadUsers: () => void;
}

export const useUserStore = create<UserStore>()((set, get) => ({
  currentUser: loadCurrentUser(),
  users: loadUsers(),

  setCurrentUser: (user: User) => {
    set({ currentUser: user });
    saveCurrentUser(user);
  },

  addUser: (name: string, avatar?: string) => {
    const user: User = {
      id: uid('user'),
      name,
      avatar: avatar ?? randomAvatar(),
      createdAt: Date.now(),
    };
    const users = [...get().users, user];
    set({ users, currentUser: user });
    saveUsers(users);
    saveCurrentUser(user);
    return user;
  },

  switchUser: (userId: string) => {
    const user = get().users.find((u) => u.id === userId) ?? null;
    set({ currentUser: user });
    saveCurrentUser(user);
  },

  removeUser: (userId: string) => {
    const users = get().users.filter((u) => u.id !== userId);
    const currentUser = get().currentUser?.id === userId ? null : get().currentUser;
    set({ users, currentUser });
    saveUsers(users);
    saveCurrentUser(currentUser);
  },

  loadUsers: () => {
    set({ users: loadUsers() });
  },
}));
