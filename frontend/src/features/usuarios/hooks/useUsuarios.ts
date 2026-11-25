import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activarUsuario, desactivarUsuario, getUsuarios } from "../api/usuarios";

export const usuariosKeys = {
  todos: ["usuarios"] as const,
};

export function useUsuarios() {
  return useQuery({ queryKey: usuariosKeys.todos, queryFn: getUsuarios });
}

/** Activar o desactivar una cuenta (alta y baja lógica). */
export function useCambiarEstadoUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, activar }: { id: number; activar: boolean }) =>
      activar ? activarUsuario(id) : desactivarUsuario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: usuariosKeys.todos }),
  });
}
