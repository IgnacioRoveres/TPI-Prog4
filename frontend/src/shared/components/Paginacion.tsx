interface PaginacionProps {
  /** Página actual, empezando en 0. */
  pagina: number;
  totalPaginas: number;
  totalItems?: number;
  onCambiar: (pagina: number) => void;
}

function Paginacion({ pagina, totalPaginas, totalItems, onCambiar }: PaginacionProps) {
  if (totalPaginas <= 1 && totalItems === undefined) return null;

  return (
    <nav
      aria-label="Paginación"
      className="flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600"
    >
      <span>
        {totalItems !== undefined && `${totalItems} resultado${totalItems === 1 ? "" : "s"}`}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onCambiar(pagina - 1)}
          disabled={pagina <= 0}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-medium hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Anterior
        </button>
        <span className="px-2">
          Página {Math.min(pagina + 1, Math.max(totalPaginas, 1))} de {Math.max(totalPaginas, 1)}
        </span>
        <button
          type="button"
          onClick={() => onCambiar(pagina + 1)}
          disabled={pagina + 1 >= totalPaginas}
          className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 font-medium hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Siguiente →
        </button>
      </div>
    </nav>
  );
}

export default Paginacion;
