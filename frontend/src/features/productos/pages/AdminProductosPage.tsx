import { useState } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { handleApiError } from "@/shared/api/handleApiError";
import DataTable from "@/shared/components/DataTable";
import EstadoError, { AlertaError } from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import PageHeader from "@/shared/components/PageHeader";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { precio } from "@/shared/utils/formato";
import Button from "@/shared/ui/Button";
import Modal from "@/shared/ui/Modal";
import ProductoForm from "../components/ProductoForm";
import ProductoImagen from "../components/ProductoImagen";
import StockForm from "../components/StockForm";
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from "../hooks/useProductos";
import type { Producto, ProductoCreate, ProductoStockUpdate } from "../types/producto";

const columnHelper = createColumnHelper<Producto>();
const SIN_DATOS: Producto[] = [];

type ModalAbierto = { tipo: "form"; producto: Producto | null } | { tipo: "stock"; producto: Producto } | null;

/** ABM de productos con cambio de stock y disponibilidad. El panel pide limit=100. */
function AdminProductosPage() {
  const { data, isLoading, isError, error, refetch } = useProductos({ skip: 0, limit: 100 });
  const { data: categorias } = useCategorias();
  const crear = useCrearProducto();
  const actualizar = useActualizarProducto();
  const actualizarStock = useActualizarStock();
  const eliminar = useEliminarProducto();

  const [modal, setModal] = useState<ModalAbierto>(null);
  const [busqueda, setBusqueda] = useState<string>("");

  const abrirForm = (producto: Producto | null) => {
    crear.reset();
    actualizar.reset();
    setModal({ tipo: "form", producto });
  };

  const abrirStock = (producto: Producto) => {
    actualizarStock.reset();
    setModal({ tipo: "stock", producto });
  };

  const cerrar = () => setModal(null);

  const guardar = async (datos: ProductoCreate) => {
    try {
      if (modal?.tipo === "form" && modal.producto) {
        await actualizar.mutateAsync({ id: modal.producto.id, datos });
      } else {
        await crear.mutateAsync(datos);
      }
      cerrar();
    } catch {
      // Se muestra en el formulario
    }
  };

  const guardarStock = async (datos: ProductoStockUpdate) => {
    if (modal?.tipo !== "stock") return;
    try {
      await actualizarStock.mutateAsync({ id: modal.producto.id, datos });
      cerrar();
    } catch {
      // Se muestra en el formulario
    }
  };

  const darDeBaja = (producto: Producto) => {
    eliminar.reset();
    if (window.confirm(`¿Dar de baja "${producto.nombre}"? Deja de aparecer en el catálogo.`)) {
      eliminar.mutate(producto.id);
    }
  };

  const columns = [
    columnHelper.accessor("nombre", {
      header: "Producto",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
            <ProductoImagen
              url={row.original.imagen_url}
              nombre={row.original.nombre}
              categoria={row.original.categoria.nombre}
              className="h-10 text-xl"
            />
          </div>
          <span className="font-semibold text-stone-900">{row.original.nombre}</span>
        </div>
      ),
    }),
    columnHelper.accessor((p) => p.categoria.nombre, { id: "categoria", header: "Categoría" }),
    columnHelper.accessor("precio_base", {
      header: "Precio",
      cell: (info) => <span className="tabular-nums">{precio(info.getValue())}</span>,
      sortDescFirst: false,
      enableGlobalFilter: false,
    }),
    columnHelper.accessor("stock", {
      header: "Stock",
      sortDescFirst: false,
      cell: (info) => (
        <span
          className={`tabular-nums font-semibold ${info.getValue() === 0 ? "text-red-600" : info.getValue() <= 5 ? "text-amber-600" : "text-stone-800"}`}
        >
          {info.getValue()}
        </span>
      ),
      enableGlobalFilter: false,
    }),
    columnHelper.accessor("disponible", {
      header: "Estado",
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            Disponible
          </span>
        ) : (
          <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
            No disponible
          </span>
        ),
      enableGlobalFilter: false,
    }),
    columnHelper.display({
      id: "acciones",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="secondary" onClick={() => abrirStock(row.original)}>
            Stock
          </Button>
          <Button size="sm" variant="secondary" onClick={() => abrirForm(row.original)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => darDeBaja(row.original)}
            loading={eliminar.isPending && eliminar.variables === row.original.id}
          >
            Baja
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: data?.items ?? SIN_DATOS,
    columns,
    state: { globalFilter: busqueda },
    onGlobalFilterChange: setBusqueda,
    initialState: { pagination: { pageSize: 10 }, sorting: [{ id: "nombre", desc: false }] },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const mutacionForm = modal?.tipo === "form" && modal.producto ? actualizar : crear;

  return (
    <section>
      <PageHeader
        titulo="Productos"
        descripcion="Alta, edición, stock, disponibilidad y baja lógica."
        accion={
          <Button onClick={() => abrirForm(null)} disabled={!categorias || categorias.length === 0}>
            + Nuevo producto
          </Button>
        }
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
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio icono="🍕" titulo="No hay productos activos" />
      ) : (
        <DataTable
          table={table}
          globalFilter={busqueda}
          onGlobalFilterChange={setBusqueda}
          placeholderBusqueda="Buscar por producto o categoría…"
        />
      )}

      <Modal
        isOpen={modal?.tipo === "form"}
        onClose={cerrar}
        title={modal?.tipo === "form" && modal.producto ? "Editar producto" : "Nuevo producto"}
        size="lg"
      >
        {modal?.tipo === "form" && (
          <ProductoForm
            key={modal.producto?.id ?? "nuevo"}
            producto={modal.producto}
            categorias={categorias ?? []}
            onSubmit={guardar}
            onCancel={cerrar}
            error={mutacionForm.isError ? handleApiError(mutacionForm.error) : null}
          />
        )}
      </Modal>

      <Modal isOpen={modal?.tipo === "stock"} onClose={cerrar} title="Stock y disponibilidad">
        {modal?.tipo === "stock" && (
          <StockForm
            key={modal.producto.id}
            producto={modal.producto}
            onSubmit={guardarStock}
            onCancel={cerrar}
            error={actualizarStock.isError ? handleApiError(actualizarStock.error) : null}
          />
        )}
      </Modal>
    </section>
  );
}

export default AdminProductosPage;
