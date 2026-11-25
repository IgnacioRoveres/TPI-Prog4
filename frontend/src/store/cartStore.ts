import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ItemCarrito {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  /** Stock conocido al agregar: limita la cantidad en la interfaz (el backend valida igual). */
  stock: number;
  imagen_url: string | null;
}

interface ProductoParaCarrito {
  id: number;
  nombre: string;
  precio_base: number;
  stock: number;
  imagen_url: string | null;
}

interface CartState {
  items: ItemCarrito[];
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => void;
  quitar: (productoId: number) => void;
  cambiarCantidad: (productoId: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
  cantidadTotal: () => number;
}

/** Carrito del cliente. Se persiste en localStorage: sobrevive a la recarga. */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id);
          if (existente) {
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id
                  ? {
                      ...i,
                      cantidad: Math.min(i.cantidad + cantidad, producto.stock),
                      stock: producto.stock,
                      precio_unitario: producto.precio_base,
                    }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: Math.min(cantidad, producto.stock),
                stock: producto.stock,
                imagen_url: producto.imagen_url,
              },
            ],
          };
        }),

      quitar: (productoId) =>
        set((state) => ({ items: state.items.filter((i) => i.producto_id !== productoId) })),

      cambiarCantidad: (productoId, cantidad) =>
        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((i) => i.producto_id !== productoId)
              : state.items.map((i) =>
                  i.producto_id === productoId ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i
                ),
        })),

      vaciar: () => set({ items: [] }),

      total: () =>
        Math.round(get().items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0) * 100) / 100,

      cantidadTotal: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: "foodstore-carrito" }
  )
);
