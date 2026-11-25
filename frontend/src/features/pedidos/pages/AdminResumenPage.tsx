import { Link } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import PageHeader from "@/shared/components/PageHeader";
import Skeleton from "@/shared/components/Skeleton";
import { precio } from "@/shared/utils/formato";
import ResumenCard from "../components/ResumenCard";
import { useResumenPedidos } from "../hooks/usePedidos";

/** Tarjetas con los indicadores de ResumenPedidos. */
function AdminResumenPage() {
  const { data, isLoading, isError, error, refetch } = useResumenPedidos();

  return (
    <section>
      <PageHeader
        titulo="Resumen del negocio"
        descripcion="Estado actual de los pedidos."
        accion={
          <Link
            to="/admin/pedidos?estado=PENDIENTE"
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            Ver pedidos pendientes
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : isError || !data ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ResumenCard titulo="Pendientes" valor={String(data.pendientes)} icono="⏳" color="amber" ayuda="Esperan pasar a preparación" />
          <ResumenCard titulo="En preparación" valor={String(data.en_preparacion)} icono="👨‍🍳" color="sky" />
          <ResumenCard titulo="Entregados" valor={String(data.entregados)} icono="✅" color="emerald" />
          <ResumenCard titulo="Cancelados" valor={String(data.cancelados)} icono="✖️" color="stone" />
          <ResumenCard titulo="Pedidos de hoy" valor={String(data.pedidos_hoy)} icono="📅" color="violet" />
          <ResumenCard
            titulo="Ingresos entregados"
            valor={precio(data.ingresos_entregados)}
            icono="💰"
            color="orange"
            ayuda="Suma del total de los pedidos ENTREGADO"
          />
        </div>
      )}
    </section>
  );
}

export default AdminResumenPage;
