import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { handleApiError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import EstadoError, { AlertaError } from "@/shared/components/EstadoError";
import PageHeader from "@/shared/components/PageHeader";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { useCambiarEstadoUsuario, useUsuarios } from "../hooks/useUsuarios";
import type { Usuario } from "../types/usuario";

const columnHelper = createColumnHelper<Usuario>();
const SIN_DATOS: Usuario[] = [];

/** Usuarios con activar y desactivar. «Desactivar» no aparece en la fila propia. */
function AdminUsuariosPage() {
  const sesion = useAuthStore((state) => state.usuario);
  const { data, isLoading, isError, error, refetch } = useUsuarios();
  const cambiarEstado = useCambiarEstadoUsuario();
  const [busqueda, setBusqueda] = useState<string>("");

  const alternar = (usuario: Usuario) => {
    cambiarEstado.reset();
    const activar = usuario.disabled;
    if (window.confirm(`¿${activar ? "Activar" : "Desactivar"} la cuenta de ${usuario.full_name}?`)) {
      cambiarEstado.mutate({ id: usuario.id, activar });
    }
  };

  const columns = [
    columnHelper.accessor("username", {
      header: "Usuario",
      cell: (info) => <span className="font-semibold text-stone-900">@{info.getValue()}</span>,
    }),
    columnHelper.accessor("full_name", { header: "Nombre" }),
    columnHelper.accessor("email", { header: "Email" }),
    columnHelper.accessor("role", {
      header: "Rol",
      cell: (info) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
            info.getValue() === "admin" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-700"
          }`}
        >
          {info.getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("disabled", {
      header: "Estado",
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">Desactivado</span>
        ) : (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">Activo</span>
        ),
      enableGlobalFilter: false,
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => {
        const usuario = row.original;
        const procesando = cambiarEstado.isPending && cambiarEstado.variables.id === usuario.id;
        if (usuario.disabled) {
          return (
            <div className="flex justify-end">
              <Button size="sm" variant="success" onClick={() => alternar(usuario)} loading={procesando}>
                Activar
              </Button>
            </div>
          );
        }
        // El admin no puede desactivarse a sí mismo: el botón no se muestra en su fila
        if (usuario.id === sesion?.id) {
          return <p className="text-right text-xs text-stone-400">Tu cuenta</p>;
        }
        return (
          <div className="flex justify-end">
            <Button size="sm" variant="danger" onClick={() => alternar(usuario)} loading={procesando}>
              Desactivar
            </Button>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: data ?? SIN_DATOS,
    columns,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    initialState: { pagination: { pageSize: 10 }, sorting: [{ id: "username", desc: false }] },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <section>
      <PageHeader titulo="Usuarios" descripcion="Una cuenta desactivada no puede iniciar sesión." />

      {cambiarEstado.isError && (
        <div className="mb-4">
          <AlertaError mensaje={handleApiError(cambiarEstado.error)} onClose={() => cambiarEstado.reset()} />
        </div>
      )}

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : (
        <DataTable
          table={table}
          globalFilter={busqueda}
          onGlobalFilterChange={setBusqueda}
          placeholderBusqueda="Buscar por usuario, nombre o email…"
        />
      )}
    </section>
  );
}

export default AdminUsuariosPage;
