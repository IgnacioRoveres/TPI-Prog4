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
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import CategoriaForm from "../components/CategoriaForm";
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from "../hooks/useCategorias";
import type { Categoria, CategoriaCreate } from "../types/categoria";

const columnHelper = createColumnHelper<Categoria>();
const SIN_DATOS: Categoria[] = [];

/** ABM de categorías: TanStack Table (paginación del lado del cliente) y TanStack Form. */
function AdminCategoriasPage() {
  const { data, isLoading, isError, error, refetch } = useCategorias();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const eliminar = useEliminarCategoria();

  const [modalAbierto, setModalAbierto] = useState<boolean>(false);
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  const abrir = (categoria: Categoria | null) => {
    crear.reset();
    actualizar.reset();
    setSeleccionada(categoria);
    setModalAbierto(true);
  };

  const cerrar = () => {
    setModalAbierto(false);
    setSeleccionada(null);
  };

  const guardar = async (datos: CategoriaCreate) => {
    try {
      if (seleccionada) {
        await actualizar.mutateAsync({ id: seleccionada.id, datos });
      } else {
        await crear.mutateAsync(datos);
      }
      cerrar();
    } catch {
      // El error (409 nombre duplicado) se muestra en el formulario
    }
  };

  const darDeBaja = (categoria: Categoria) => {
    eliminar.reset();
    if (
      window.confirm(
        `¿Dar de baja la categoría "${categoria.nombre}"? Sus productos siguen en el catálogo: para retirarlos, dalos de baja también.`
      )
    ) {
      eliminar.mutate(categoria.id);
    }
  };

  const columns = [
    columnHelper.accessor("id", { header: "ID", cell: (info) => `#${info.getValue()}`, enableGlobalFilter: false }),
    columnHelper.accessor("nombre", {
      header: "Nombre",
      cell: (info) => <span className="font-semibold text-stone-900">{info.getValue()}</span>,
    }),
    columnHelper.accessor((c) => c.descripcion ?? "", {
      id: "descripcion",
      header: "Descripción",
      cell: (info) => info.getValue() || <span className="italic text-stone-400">Sin descripción</span>,
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => abrir(row.original)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => darDeBaja(row.original)}
            loading={eliminar.isPending && eliminar.variables === row.original.id}
          >
            Dar de baja
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data ?? SIN_DATOS,
    columns,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    initialState: { pagination: { pageSize: 10 }, sorting: [{ id: "nombre", desc: false }] },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const mutacion = seleccionada ? actualizar : crear;

  return (
    <section>
      <PageHeader
        titulo="Categorías"
        descripcion="Alta, edición y baja lógica de las categorías del catálogo."
        accion={<Button onClick={() => abrir(null)}>+ Nueva categoría</Button>}
      />

      {eliminar.isError && (
        <div className="mb-4">
          <AlertaError mensaje={handleApiError(eliminar.error)} onClose={() => eliminar.reset()} />
        </div>
      )}

      {isLoading ? (
        <SkeletonFilas />
      ) : isError ? (
        <EstadoError mensaje={handleApiError(error)} onRetry={() => void refetch()} />
      ) : !data || data.length === 0 ? (
        <EstadoVacio icono="🗂️" titulo="No hay categorías activas" />
      ) : (
        <DataTable
          table={table}
          globalFilter={busqueda}
          onGlobalFilterChange={setBusqueda}
          placeholderBusqueda="Buscar categoría…"
        />
      )}

      <Modal isOpen={modalAbierto} onClose={cerrar} title={seleccionada ? "Editar categoría" : "Nueva categoría"}>
        <CategoriaForm
          key={seleccionada?.id ?? "nueva"}
          categoria={seleccionada}
          onSubmit={guardar}
          onCancel={cerrar}
          error={mutacion.isError ? handleApiError(mutacion.error) : null}
        />
      </Modal>
    </section>
  );
}

export default AdminCategoriasPage;
