import { Link, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import { precio } from "@/shared/utils/formato";
import Card from "@/shared/ui/Card";
import { useCartStore } from "@/store/cartStore";
import CheckoutForm from "../components/CheckoutForm";
import { useCrearPedido } from "../hooks/usePedidos";
import type { CheckoutFormValues } from "../types/pedido";

/** Confirmar pedido: envía POST /pedidos, vacía el carrito y lleva a «Mis pedidos». */
function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total());
  const vaciar = useCartStore((state) => state.vaciar);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();

  const confirmar = async (valores: CheckoutFormValues) => {
    try {
      const pedido = await crearPedido.mutateAsync({
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        forma_pago: valores.forma_pago,
        direccion_entrega: valores.direccion_entrega.trim(),
        notas: valores.notas.trim() || null,
      });
      vaciar();
      navigate("/mis-pedidos", { replace: true, state: { nuevoPedidoId: pedido.id } });
    } catch {
      // Stock insuficiente, producto no disponible, etc.: se muestra en el formulario
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8">
        <PageHeader titulo="Confirmar pedido" />
        <EstadoVacio
          icono="🛒"
          titulo="No hay productos para confirmar"
          accion={
            <Link to="/" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
              Ir al catálogo
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader titulo="Confirmar pedido" descripcion="Indicá dónde te lo llevamos y cómo vas a pagar." />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Card className="p-6">
          <CheckoutForm
            onSubmit={confirmar}
            error={crearPedido.isError ? handleApiError(crearPedido.error) : null}
          />
        </Card>

        <Card className="h-fit p-6">
          <h2 className="font-bold text-stone-900">Tu pedido</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {items.map((item) => (
              <li key={item.producto_id} className="flex justify-between gap-3">
                <span className="text-stone-700">
                  {item.cantidad} × {item.nombre}
                </span>
                <span className="font-medium tabular-nums">{precio(item.precio_unitario * item.cantidad)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 text-lg">
            <span className="font-semibold">Total</span>
            <span className="font-extrabold tabular-nums">{precio(total)}</span>
          </div>
          <Link to="/carrito" className="mt-3 block text-sm font-medium text-orange-600 hover:underline">
            ← Volver al carrito
          </Link>
        </Card>
      </div>
    </main>
  );
}

export default CheckoutPage;
