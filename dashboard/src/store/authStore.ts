import { create } from 'zustand';

interface User {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
}

interface Guild {
  id: string;
  name: string;
  icon: string | null;
  permissions: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  selectedGuild: Guild | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setSelectedGuild: (guild: Guild | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  selectedGuild: null,
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setSelectedGuild: (guild) => set({ selectedGuild: guild }),
  logout: () => set({ user: null, token: null, selectedGuild: null }),
}));
