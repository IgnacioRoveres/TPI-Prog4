import axios from "axios";

/** Error de validación de FastAPI (422). */
interface ValidationErrorItem {
  loc: (string | number)[];
  msg: string;
  type: string;
}

/** Cuerpo de error de la API: `detail` es texto, o una lista en los 422. */
export interface ApiErrorBody {
  detail: string | ValidationErrorItem[];
}

/** Traducción de los mensajes de validación más comunes de Pydantic. */
function traducir(msg: string): string {
  return msg
    .replace(/^Value error, /, "")
    .replace(/String should have at least (\d+) characters?/, "Debe tener al menos $1 caracteres")
    .replace(/String should have at most (\d+) characters?/, "Debe tener como máximo $1 caracteres")
    .replace(/Input should be greater than or equal to (\d+)/, "Debe ser mayor o igual a $1")
    .replace(/List should have at least (\d+) items?/, "Debe tener al menos $1 elemento")
    .replace(/value is not a valid email address.*/, "El email no es válido");
}

/** Convierte cualquier error de la API en un mensaje para mostrar en pantalla. */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) {
      return "No se pudo conectar con el servidor. Verificá que el backend esté en ejecución.";
    }
    const detail = error.response.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail.length > 0) {
      const primero = detail[0];
      const campo = primero.loc[primero.loc.length - 1];
      return `${typeof campo === "string" ? `${campo}: ` : ""}${traducir(primero.msg)}`;
    }
    return `Error ${error.response.status}`;
  }
  return error instanceof Error ? error.message : "Ocurrió un error inesperado";
}

/** Código HTTP de un error de Axios (0 si no hubo respuesta). */
export function statusDeError(error: unknown): number {
  return axios.isAxiosError(error) ? (error.response?.status ?? 0) : 0;
}
