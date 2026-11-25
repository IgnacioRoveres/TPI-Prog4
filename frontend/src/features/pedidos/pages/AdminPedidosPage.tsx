import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError, { AlertaError } from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { fecha, precio } from "@/shared/utils/formato";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import PedidoDetalle from "../components/PedidoDetalle";
import PedidosTable from "../components/PedidosTable";
import { useCambiarEstadoPedido, usePedidos } from "../hooks/usePedidos";
import { ESTADOS, ETIQUETA_FORMA_PAGO, TRANSICIONES } from "../types/pedido";
import type { EstadoPedido, Pedido } from "../types/pedido";

const columnHelper = createColumnHelper<Pedido>();
const SIN_DATOS: Pedido[] = [];

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendiente",
  EN_PREPARACION: "Preparar",
  ENTREGADO: "Entregar",
  CANCELADO: "Cancelar",
};

const ETIQUETA_FILTRO: Record<EstadoPedido, string> = {
  PENDIENTE: "Pendientes",
  EN_PREPARACION: "En preparación",
  ENTREGADO: "Entregados",
  CANCELADO: "Cancelados",
};

function esEstado(valor: string | null): valor is EstadoPedido {
  return valor !== null && (ESTADOS as string[]).includes(valor);
}

/** Todos los pedidos, con filtro por estado y botones según la máquina de estados. */
function AdminPedidosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parametro = searchParams.get("estado");
  const estado = esEstado(parametro) ? parametro : undefined;

  const { data, isLoading, isError, error, refetch, isFetching } = usePedidos({ skip: 0, limit: 100, estado });
  const cambiar = useCambiarEstadoPedido();
  const [busqueda, setBusqueda] = useState<string>("");
  const [detalle, setDetalle] = useState<Pedido | null>(null);

  const filtrar = (nuevo: EstadoPedido | undefined) => {
    setSearchParams(nuevo ? { estado: nuevo } : {});
  };

  const aplicar = (pedido: Pedido, nuevo: EstadoPedido) => {
    cambiar.reset();
    if (
      nuevo === "CANCELADO" &&
      !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se restituye el stock de sus productos.`)
    ) {
      return;
    }
    cambiar.mutate(
      { id: pedido.id, estado: nuevo },
      { onSuccess: (actualizado) => setDetalle((d) => (d?.id === actualizado.id ? actualizado : d)) }
    );
  };

  const botonesDe = (pedido: Pedido, size: "sm" | "md" = "sm") =>
    TRANSICIONES[pedido.estado].map((siguiente) => (
      <Button
        key={siguiente}
        size={size}
        variant={siguiente === "CANCELADO" ? "danger" : siguiente === "ENTREGADO" ? "success" : "primary"}
        onClick={() => aplicar(pedido, siguiente)}
        loading={cambiar.isPending && cambiar.variables.id === pedido.id && cambiar.variables.estado === siguiente}
      >
        {ETIQUETA_ACCION[siguiente]}
      </Button>
    ));

  const columns = [
    columnHelper.accessor("id", {
      header: "Pedido",
      cell: (info) => <span className="font-bold text-stone-900">#{info.getValue()}</span>,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor((p) => `${p.usuario.full_name} ${p.usuario.username}`, {
      id: "cliente",
      header: "Cliente",
      cell: ({ row }) => (
        <div className="leading-tight">
          <p className="font-medium text-stone-900">{row.original.usuario.full_name}</p>
          <p className="text-xs text-stone-400">@{row.original.usuario.username}</p>
        </div>
      ),
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha",
      cell: (info) => <span className="whitespace-nowrap">{fecha(info.getValue())}</span>,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor("direccion_entrega", { header: "Entrega", enableSorting: false }),
    columnHelper.accessor("forma_pago", {
      header: "Pago",
      cell: (info) => ETIQUETA_FORMA_PAGO[info.getValue()],
      enableGlobalFilter: false,
    }),
    columnHelper.accessor("total", {
      header: "Total",
      cell: (info) => <span className="font-semibold tabular-nums">{precio(info.getValue())}</span>,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor("estado", {
      header: "Estado",
      cell: (info) => <BadgeEstado estado={info.getValue()} />,
      enableGlobalFilter: false,
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setDetalle(row.original)}>
            Ver
          </Button>
          {botonesDe(row.original)}
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.items ?? SIN_DATOS,
    columns,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    initialState: { pagination: { pageSize: 10 } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const filtros = (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por estado">
      {[undefined, ...ESTADOS].map((e) => (
        <button
          key={e ?? "todos"}
          type="button"
          onClick={() => filtrar(e)}
          aria-pressed={estado === e}
          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
            estado === e ? "bg-stone-900 text-white" : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
          }`}
        >
          {e ? ETIQUETA_FILTRO[e] : "Todos"}
        </button>
      ))}
      {isFetching && !isLoading && <span className="self-center text-sm text-stone-400">Actualizando…</span>}
    </div>
  );

  return (
    <section>
      <PageHeader
        titulo="Pedidos"
        descripcion="Avanzá los pedidos: Pendiente → En preparación → Entregado. Cancelar restituye el stock."
      />

      {cambiar.isError && (
        <div className="mb-4">
          <AlertaError mensaje={handleApiError(cambiar.error)} onClose={() => cambiar.reset()} />
        </div>
      )}

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : !data || (data.items.length === 0 && !estado) ? (
        <EstadoVacio icono="🧾" titulo="Todavía no hay pedidos" />
      ) : (
        <PedidosTable table={table} busqueda={busqueda} onBusqueda={setBusqueda} filtros={filtros} />
      )}

      <Modal isOpen={detalle !== null} onClose={() => setDetalle(null)} title={`Pedido #${detalle?.id ?? ""}`} size="lg">
        {detalle && (
          <>
            <PedidoDetalle pedido={detalle} mostrarCliente />
            {TRANSICIONES[detalle.estado].length > 0 && (
              <div className="mt-6 flex justify-end gap-2 border-t border-stone-100 pt-4">{botonesDe(detalle, "md")}</div>
            )}
          </>
        )}
      </Modal>
    </section>
  );
}

export default AdminPedidosPage;
