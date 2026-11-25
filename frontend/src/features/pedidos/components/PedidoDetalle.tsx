import { fecha, precio } from "@/shared/utils/formato";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import { ETIQUETA_FORMA_PAGO } from "../types/pedido";
import type { Pedido } from "../types/pedido";

interface PedidoDetalleProps {
  pedido: Pedido;
  /** Muestra el cliente (para el panel de administración). */
  mostrarCliente?: boolean;
}

/** Datos de entrega y líneas de un pedido (con el precio copiado al crearlo). */
function PedidoDetalle({ pedido, mostrarCliente = false }: PedidoDetalleProps) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-3">
        <BadgeEstado estado={pedido.estado} />
        <span className="text-stone-500">Creado el {fecha(pedido.created_at)}</span>
        {pedido.updated_at !== pedido.created_at && (
          <span className="text-stone-400">· actualizado el {fecha(pedido.updated_at)}</span>
        )}
      </div>

      <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
        {mostrarCliente && (
          <div>
            <dt className="text-xs font-semibold uppercase text-stone-400">Cliente</dt>
            <dd className="text-stone-800">
              {pedido.usuario.full_name} <span className="text-stone-400">@{pedido.usuario.username}</span>
            </dd>
          </div>
        )}
        <div>
          <dt className="text-xs font-semibold uppercase text-stone-400">Entrega</dt>
          <dd className="text-stone-800">{pedido.direccion_entrega}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase text-stone-400">Pago</dt>
          <dd className="text-stone-800">{ETIQUETA_FORMA_PAGO[pedido.forma_pago]}</dd>
        </div>
        {pedido.notas && (
          <div className="sm:col-span-2">
            <dt className="text-xs font-semibold uppercase text-stone-400">Notas</dt>
            <dd className="text-stone-800">{pedido.notas}</dd>
          </div>
        )}
      </dl>

      <table className="w-full">
        <thead className="text-left text-xs uppercase text-stone-400">
          <tr>
            <th className="py-2 font-semibold">Producto</th>
            <th className="py-2 text-right font-semibold">Precio</th>
            <th className="py-2 text-right font-semibold">Cant.</th>
            <th className="py-2 text-right font-semibold">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="py-2 text-stone-800">{item.nombre_producto}</td>
              <td className="py-2 text-right tabular-nums text-stone-600">{precio(item.precio_unitario)}</td>
              <td className="py-2 text-right tabular-nums text-stone-600">{item.cantidad}</td>
              <td className="py-2 text-right font-medium tabular-nums text-stone-900">{precio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-stone-200">
            <td colSpan={3} className="pt-3 text-right font-semibold text-stone-700">
              Total
            </td>
            <td className="pt-3 text-right text-base font-extrabold tabular-nums text-stone-900">
              {precio(pedido.total)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default PedidoDetalle;
