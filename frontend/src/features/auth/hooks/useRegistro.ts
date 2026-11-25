import { useMutation } from "@tanstack/react-query";
import { registrar } from "../api/auth";
import type { UserCreate } from "../types/auth";

/** POST /auth/register. */
export function useRegistro() {
  return useMutation({ mutationFn: (datos: UserCreate) => registrar(datos) });
}
