import { Link, useNavigate } from "react-router-dom";
import ProductoImagen from "@/features/productos/components/ProductoImagen";
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import { precio } from "@/shared/utils/formato";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";

/** Carrito: ítems, cantidades, subtotal y total. Persiste al recargar (cartStore + persist). */
function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const quitar = useCartStore((state) => state.quitar);
  const vaciar = useCartStore((state) => state.vaciar);
  const total = useCartStore((state) => state.total());
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageHeader titulo="Tu carrito" />
        <EstadoVacio
          icono="🛒"
          titulo="Tu carrito está vacío"
          descripcion="Agregá productos desde el catálogo."
          accion={
            <Link to="/" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
              Ver el catálogo
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader
        titulo="Tu carrito"
        descripcion={`${items.length} producto${items.length === 1 ? "" : "s"}`}
        accion={
          <Button
            variant="ghost"
            onClick={() => {
              if (window.confirm("¿Vaciar el carrito?")) vaciar();
            }}
          >
            Vaciar carrito
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card className="divide-y divide-stone-100">
          {items.map((item) => (
            <div key={item.producto_id} className="flex items-center gap-4 p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <ProductoImagen url={item.imagen_url} nombre={item.nombre} categoria={item.nombre} className="h-16" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-stone-900">{item.nombre}</p>
                <p className="text-sm text-stone-500">{precio(item.precio_unitario)} c/u</p>
              </div>
              <div className="flex items-center gap-1" role="group" aria-label={`Cantidad de ${item.nombre}`}>
                <button
                  type="button"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                  aria-label="Restar uno"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 font-bold hover:bg-stone-50"
                >
                  −
                </button>
                <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">
                  {item.cantidad}
                </span>
                <button
                  type="button"
                  onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                  disabled={item.cantidad >= item.stock}
                  aria-label="Sumar uno"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-stone-200 font-bold hover:bg-stone-50 disabled:opacity-40"
                >
                  +
                </button>
              </div>
              <p className="w-28 text-right font-bold tabular-nums text-stone-900">
                {precio(item.precio_unitario * item.cantidad)}
              </p>
              <button
                type="button"
                onClick={() => quitar(item.producto_id)}
                aria-label={`Quitar ${item.nombre}`}
                className="rounded-lg px-2 py-1 text-stone-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </Card>

        <Card className="h-fit p-6">
          <h2 className="font-bold text-stone-900">Resumen</h2>
          <div className="mt-4 flex items-center justify-between text-lg">
            <span className="text-stone-600">Total</span>
            <span className="font-extrabold tabular-nums text-stone-900">{precio(total)}</span>
          </div>
          <p className="mt-1 text-xs text-stone-500">El precio final se confirma al crear el pedido.</p>
          <Button size="lg" fullWidth className="mt-5" onClick={() => navigate("/checkout")}>
            Confirmar pedido
          </Button>
          <Link to="/" className="mt-3 block text-center text-sm font-medium text-orange-600 hover:underline">
            Seguir comprando
          </Link>
        </Card>
      </div>
    </main>
  );
}

export default CarritoPage;
