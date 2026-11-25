import { flexRender } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import type { ReactNode } from "react";

interface DataTableProps<T> {
  /** Instancia creada en la página con useReactTable. */
  table: Table<T>;
  globalFilter: string;
  onGlobalFilterChange: (valor: string) => void;
  placeholderBusqueda: string;
  /** Contenido extra junto al buscador (por ejemplo, un filtro). */
  filtros?: ReactNode;
}

const TAMANIOS_PAGINA = [5, 10, 20];

/**
 * Tabla genérica de presentación. No conoce los datos: renderiza la instancia de
 * TanStack Table que recibe (búsqueda, ordenamiento por columnas y paginación).
 */
function DataTable<T>({
  table,
  globalFilter,
  onGlobalFilterChange,
  placeholderBusqueda,
  filtros,
}: DataTableProps<T>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalFiltrado = table.getFilteredRowModel().rows.length;
  const totalPaginas = Math.max(table.getPageCount(), 1);
  const filas = table.getRowModel().rows;
  const columnas = table.getVisibleLeafColumns().length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
      <input
        type="search"
        value={globalFilter}
        onChange={(e) => onGlobalFilterChange(e.target.value)}
        placeholder={placeholderBusqueda}
        aria-label="Buscar"
        className="w-full max-w-sm rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
      {filtros}
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const puedeOrdenar = header.column.getCanSort();
                  const orden = header.column.getIsSorted();
                  const alineaDerecha = header.column.id === "acciones";
                  return (
                    <th
                      key={header.id}
                      className={`px-6 py-3 font-semibold ${alineaDerecha ? "text-right" : ""}`}
                      aria-sort={
                        orden === "asc" ? "ascending" : orden === "desc" ? "descending" : undefined
                      }
                    >
                      {header.isPlaceholder ? null : puedeOrdenar ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 uppercase hover:text-stone-800"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span className="text-[10px]">
                            {orden === "asc" ? "▲" : orden === "desc" ? "▼" : "↕"}
                          </span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {filas.length === 0 ? (
              <tr>
                <td colSpan={columnas} className="px-6 py-10 text-center text-sm text-stone-500">
                  No hay resultados para “{globalFilter}”.
                </td>
              </tr>
            ) : (
              filas.map((row) => (
                <tr key={row.id} className="border-t border-stone-100 hover:bg-stone-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 text-sm text-stone-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <span>
          {totalFiltrado} resultado{totalFiltrado === 1 ? "" : "s"}
        </span>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2">
            Por página
            <select
              value={pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="rounded-lg border border-stone-300 bg-white px-2 py-1"
            >
              {TAMANIOS_PAGINA.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-medium hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span>
            Página {pageIndex + 1} de {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-medium hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
