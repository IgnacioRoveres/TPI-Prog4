import { QueryClient } from "@tanstack/react-query";
import { statusDeError } from "./handleApiError";

/** Instancia única de TanStack Query. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Los errores de sesión, permisos o "no encontrado" no se resuelven reintentando
      retry: (intentos, error) => {
        const status = statusDeError(error);
        if ([400, 401, 403, 404].includes(status)) return false;
        return intentos < 2;
      },
    },
  },
});
