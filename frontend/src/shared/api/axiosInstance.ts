import axios from "axios";
import type { AxiosError } from "axios";
import { useAuthStore } from "@/store/authStore";
import type { ApiErrorBody } from "./handleApiError";

export const API_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";

/** Mensaje con el que el backend rechaza a un usuario desactivado (400). */
export const CUENTA_DESACTIVADA = "Cuenta de usuario desactivada";

/** En estas rutas un 401 es esperable (credenciales malas o sin sesión) y no limpia la sesión. */
const RUTAS_SIN_LIMPIEZA = ["/auth/token", "/auth/me"];

/**
 * Cliente HTTP único. withCredentials: el navegador adjunta la cookie HttpOnly
 * `access_token` en cada petición. El frontend nunca lee ni guarda el token.
 */
export const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { Accept: "application/json" },
});

/**
 * Interceptor de respuesta: ante un 401 (fuera de /auth/token y /auth/me) o un 400
 * «Cuenta de usuario desactivada», limpia el authStore. ProtectedRoute, al quedar sin
 * usuario, lleva a /login.
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? "";
    const detail = error.response?.data?.detail;

    const sesionVencida = status === 401 && !RUTAS_SIN_LIMPIEZA.some((ruta) => url.includes(ruta));
    const cuentaDesactivada = status === 400 && detail === CUENTA_DESACTIVADA;

    if (sesionVencida || cuentaDesactivada) {
      useAuthStore.getState().limpiarSesion();
    }
    return Promise.reject(error);
  }
);
