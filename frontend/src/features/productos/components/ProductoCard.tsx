import { precio } from "@/shared/utils/formato";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import type { Producto } from "../types/producto";
import ProductoImagen from "./ProductoImagen";

interface ProductoCardProps {
  producto: Producto;
}

/** Tarjeta del catálogo con el botón «Agregar al carrito». */
function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((state) => state.agregar);
  const enCarrito = useCartStore(
    (state) => state.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0
  );

  const sinStock = producto.stock === 0;
  const vendible = producto.disponible && !sinStock;
  const alcanzoElStock = enCarrito >= producto.stock;

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative">
        <ProductoImagen
          url={producto.imagen_url}
          nombre={producto.nombre}
          categoria={producto.categoria.nombre}
        />
        {!vendible && (
          <span className="absolute left-3 top-3 rounded-full bg-stone-900/80 px-2.5 py-1 text-xs font-semibold text-white">
            {sinStock ? "Sin stock" : "No disponible"}
          </span>
        )}
        {vendible && producto.stock <= 5 && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white">
            ¡Últimas {producto.stock}!
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
          {producto.categoria.nombre}
        </p>
        <h3 className="mt-1 font-bold text-stone-900">{producto.nombre}</h3>
        {producto.descripcion && (
          <p className="mt-1 line-clamp-2 text-sm text-stone-500">{producto.descripcion}</p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-4">
          <span className="text-lg font-extrabold text-stone-900">{precio(producto.precio_base)}</span>
          <Button
            size="sm"
            disabled={!vendible || alcanzoElStock}
            onClick={() => agregar(producto)}
            aria-label={`Agregar ${producto.nombre} al carrito`}
          >
            {enCarrito > 0 ? `Agregar (${enCarrito})` : "Agregar"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default ProductoCard;
