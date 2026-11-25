import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe, login as loginApi, logout as logoutApi } from "@/features/auth/api/auth";
import type { UsuarioSesion } from "@/features/auth/types/auth";
import type { Usuario } from "@/features/usuarios/types/usuario";
import { queryClient } from "@/shared/api/queryClient";

interface AuthState {
  /** Usuario de la sesión (nombre, email y rol). null sin sesión. Nunca el token. */
  usuario: UsuarioSesion | null;
  /** true mientras checkSession confirma la sesión con GET /auth/me. */
  cargando: boolean;

  login: (username: string, password: string) => Promise<UsuarioSesion>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  /** Borra la sesión local (lo usa el interceptor de Axios ante un 401). */
  limpiarSesion: () => void;
}

function aSesion(usuario: Usuario): UsuarioSesion {
  return {
    id: usuario.id,
    username: usuario.username,
    full_name: usuario.full_name,
    email: usuario.email,
    role: usuario.role,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await loginApi(username, password); // el backend deja la cookie HttpOnly
        const sesion = aSesion(await getMe());
        set({ usuario: sesion, cargando: false });
        return sesion;
      },

      logout: async () => {
        try {
          await logoutApi(); // Set-Cookie que borra la cookie
        } finally {
          set({ usuario: null, cargando: false });
          queryClient.clear();
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          set({ usuario: aSesion(await getMe()), cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      limpiarSesion: () => {
        set({ usuario: null, cargando: false });
        queryClient.clear();
      },
    }),
    {
      name: "foodstore-auth",
      // Solo se guarda el usuario: nunca el token (vive en la cookie HttpOnly)
      partialize: (state) => ({ usuario: state.usuario }),
    }
  )
);
