import type { EstadoPedido } from "@/features/pedidos/types/pedido";

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800 ring-amber-200",
  EN_PREPARACION: "bg-sky-100 text-sky-800 ring-sky-200",
  ENTREGADO: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  CANCELADO: "bg-stone-100 text-stone-600 ring-stone-200",
};

const etiquetas: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

interface BadgeEstadoProps {
  estado: EstadoPedido;
}

/** Colorea los cuatro estados del pedido. */
function BadgeEstado({ estado }: BadgeEstadoProps) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${estilos[estado]}`}
    >
      {etiquetas[estado]}
    </span>
  );
}

export default BadgeEstado;
