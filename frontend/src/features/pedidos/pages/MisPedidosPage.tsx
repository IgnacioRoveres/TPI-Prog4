import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError, { AlertaError } from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import Paginacion from "@/shared/components/Paginacion";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { fecha, precio } from "@/shared/utils/formato";
import BadgeEstado from "@/shared/ui/BadgeEstado";
import Button from "@/shared/ui/Button";
import Card from "@/shared/ui/Card";
import PedidoDetalle from "../components/PedidoDetalle";
import { useCancelarPedido, usePedidos } from "../hooks/usePedidos";
import type { Pedido } from "../types/pedido";

const POR_PAGINA = 5;

interface EstadoNavegacion {
  nuevoPedidoId?: number;
}

/** Pedidos propios con su detalle. El botón cancelar aparece solo en PENDIENTE. */
function MisPedidosPage() {
  const location = useLocation();
  const { nuevoPedidoId } = (location.state ?? {}) as EstadoNavegacion;
  const [pagina, setPagina] = useState<number>(0);
  const [abierto, setAbierto] = useState<number | null>(nuevoPedidoId ?? null);

  const { data, isLoading, isError, error, refetch } = usePedidos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
  });
  const cancelar = useCancelarPedido();

  const confirmarCancelacion = (pedido: Pedido) => {
    cancelar.reset();
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}? Los productos vuelven al stock.`)) {
      cancelar.mutate(pedido.id);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <PageHeader titulo="Mis pedidos" descripcion="Seguí el estado de tus pedidos." />

      {nuevoPedidoId && (
        <div role="status" className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
          ✅ ¡Pedido #{nuevoPedidoId} confirmado! Te avisamos cuando empiece la preparación.
        </div>
      )}
      {cancelar.isError && (
        <div className="mb-4">
          <AlertaError mensaje={handleApiError(cancelar.error)} onClose={() => cancelar.reset()} />
        </div>
      )}

      {isLoading ? (
        <SkeletonFilas filas={4} />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio
          icono="🧾"
          titulo="Todavía no hiciste pedidos"
          descripcion="Cuando confirmes uno, lo vas a ver acá."
          accion={
            <Link to="/" className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700">
              Ver el catálogo
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {data.items.map((pedido) => {
            const estaAbierto = abierto === pedido.id;
            return (
              <Card key={pedido.id} className={pedido.id === nuevoPedidoId ? "ring-2 ring-emerald-300" : ""}>
                <button
                  type="button"
                  onClick={() => setAbierto(estaAbierto ? null : pedido.id)}
                  aria-expanded={estaAbierto}
                  className="flex w-full flex-wrap items-center gap-4 px-5 py-4 text-left"
                >
                  <span className="font-bold text-stone-900">Pedido #{pedido.id}</span>
                  <BadgeEstado estado={pedido.estado} />
                  <span className="text-sm text-stone-500">{fecha(pedido.created_at)}</span>
                  <span className="ml-auto text-lg font-extrabold tabular-nums text-stone-900">
                    {precio(pedido.total)}
                  </span>
                  <span className="text-stone-400" aria-hidden="true">
                    {estaAbierto ? "▲" : "▼"}
                  </span>
                </button>

                {estaAbierto && (
                  <div className="border-t border-stone-100 px-5 py-4">
                    <PedidoDetalle pedido={pedido} />
                    {pedido.estado === "PENDIENTE" && (
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="danger"
                          onClick={() => confirmarCancelacion(pedido)}
                          loading={cancelar.isPending && cancelar.variables === pedido.id}
                        >
                          Cancelar pedido
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })}
          <Paginacion
            pagina={pagina}
            totalPaginas={Math.ceil(data.total / POR_PAGINA)}
            totalItems={data.total}
            onCambiar={setPagina}
          />
        </div>
      )}
    </main>
  );
}

export default MisPedidosPage;
