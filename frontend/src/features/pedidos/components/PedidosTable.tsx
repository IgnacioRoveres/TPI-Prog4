import type { Table } from "@tanstack/react-table";
import DataTable from "@/shared/components/DataTable";
import type { ReactNode } from "react";
import type { Pedido } from "../types/pedido";

interface PedidosTableProps {
  table: Table<Pedido>;
  busqueda: string;
  onBusqueda: (valor: string) => void;
  filtros: ReactNode;
}

/** Tabla de pedidos del panel (TanStack Table). */
function PedidosTable({ table, busqueda, onBusqueda, filtros }: PedidosTableProps) {
  return (
    <DataTable
      table={table}
      globalFilter={busqueda}
      onGlobalFilterChange={onBusqueda}
      placeholderBusqueda="Buscar por cliente o dirección…"
      filtros={filtros}
    />
  );
}

export default PedidosTable;
