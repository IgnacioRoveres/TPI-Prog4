import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cambiarEstado,
  cancelarPedido,
  crearPedido,
  getPedidos,
  getResumen,
} from "../api/pedidos";
import type { EstadoPedido, FiltrosPedidos, PedidoCreate } from "../types/pedido";

export const pedidosKeys = {
  todos: ["pedidos"] as const,
  lista: (filtros: FiltrosPedidos) => ["pedidos", "lista", filtros] as const,
  resumen: ["pedidos", "resumen"] as const,
};

/** Pedidos propios (user) o todos (admin): lo decide el backend según la sesión. */
export function usePedidos(filtros: FiltrosPedidos) {
  return useQuery({
    queryKey: pedidosKeys.lista(filtros),
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  });
}

export function useResumenPedidos() {
  return useQuery({ queryKey: pedidosKeys.resumen, queryFn: getResumen });
}

/**
 * Crear, avanzar o cancelar un pedido cambia los pedidos, el resumen y el stock de
 * los productos: se invalidan las tres cosas.
 */
function useInvalidarTrasPedido() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: pedidosKeys.todos });
    void queryClient.invalidateQueries({ queryKey: ["productos"] });
  };
}

export function useCrearPedido() {
  const invalidar = useInvalidarTrasPedido();
  return useMutation({
    mutationFn: (datos: PedidoCreate) => crearPedido(datos),
    onSuccess: invalidar,
  });
}

export function useCambiarEstadoPedido() {
  const invalidar = useInvalidarTrasPedido();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstado(id, estado),
    onSuccess: invalidar,
  });
}

export function useCancelarPedido() {
  const invalidar = useInvalidarTrasPedido();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: invalidar,
  });
}
