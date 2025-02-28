import { create } from "zustand";
import { persist } from "zustand/middleware";
import netlifyIdentity from "../utils/netlifyIdentity";

type AuthState = {
  user: netlifyIdentity.User | null;
  login: (onSuccess?: () => void) => void;
  logout: () => void;
  register: () => void;
  getToken: () => Promise<string | null>;
};

export const useAuthStore = create(
  persist<AuthState>(
    (set, get) => ({
      user: netlifyIdentity.currentUser(),

      login: (onSuccess) => {
        netlifyIdentity.open();

        netlifyIdentity.off("login");
        netlifyIdentity.on("login", (user) => {
          set({ user });
          netlifyIdentity.close();
          if (onSuccess) onSuccess();
        });
      },

      logout: () => {
        netlifyIdentity.logout();
        netlifyIdentity.off("logout");
        netlifyIdentity.on("logout", () => set({ user: null }));
      },

      register: () => {
        netlifyIdentity.open("signup");
      },

      // Obtiene el token actualizado, incluso en nuevas pestañas
      getToken: async () => {
        let user = get().user;

        // Si el usuario no está cargado en Zustand, intenta obtenerlo de Netlify Identity
        if (!user) {
          user = netlifyIdentity.currentUser();
          if (user) {
            set({ user }); // Sincroniza con Zustand
          }
        }

        return user?.token?.access_token ?? null;
      },
    }),
    {
      name: "auth-storage", // Almacena usuario en localStorage
    }
  )
);

netlifyIdentity.on("init", (user) => {
  if (user) {
    useAuthStore.getState().user = user; // Sincronizar con Zustand
  }
});

netlifyIdentity.on("login", (user) => {
  useAuthStore.getState().user = user;
});

netlifyIdentity.on("logout", () => {
  useAuthStore.getState().user = null;
});
