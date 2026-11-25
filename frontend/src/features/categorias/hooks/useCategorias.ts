import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  getCategorias,
} from "../api/categorias";
import type { CategoriaCreate, CategoriaUpdate } from "../types/categoria";

export const categoriasKeys = {
  todas: ["categorias"] as const,
};

/** Categorías activas (catálogo y panel). */
export function useCategorias() {
  return useQuery({ queryKey: categoriasKeys.todas, queryFn: getCategorias });
}

export function useCrearCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (datos: CategoriaCreate) => crearCategoria(datos),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoriasKeys.todas }),
  });
}

export function useActualizarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaUpdate }) => actualizarCategoria(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriasKeys.todas });
      // El nombre de la categoría aparece dentro de cada producto
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}

export function useEliminarCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => eliminarCategoria(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: categoriasKeys.todas });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },
  });
}
