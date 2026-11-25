import { axiosInstance } from "@/shared/api/axiosInstance";
import type { Usuario } from "@/features/usuarios/types/usuario";
import type { MensajeAuth, UserCreate } from "../types/auth";

/** POST /auth/token con formulario OAuth2. El backend deja la cookie HttpOnly. */
export async function login(username: string, password: string): Promise<MensajeAuth> {
  const form = new URLSearchParams({ username, password });
  const { data } = await axiosInstance.post<MensajeAuth>("/auth/token", form);
  return data;
}

export async function logout(): Promise<MensajeAuth> {
  const { data } = await axiosInstance.post<MensajeAuth>("/auth/logout");
  return data;
}

export async function getMe(): Promise<Usuario> {
  const { data } = await axiosInstance.get<Usuario>("/auth/me");
  return data;
}

export async function registrar(datos: UserCreate): Promise<Usuario> {
  const { data } = await axiosInstance.post<Usuario>("/auth/register", datos);
  return data;
}
