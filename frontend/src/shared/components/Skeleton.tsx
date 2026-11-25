interface SkeletonProps {
  className?: string;
}

/** Bloque gris animado que ocupa el lugar del contenido mientras carga. */
function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-lg bg-stone-200 ${className}`} aria-hidden="true" />;
}

/** Grilla de tarjetas de producto en carga. */
export function SkeletonProductos({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <div
      role="status"
      aria-label="Cargando productos"
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    >
      {Array.from({ length: cantidad }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <Skeleton className="h-40 rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Filas de una lista o tabla en carga. */
export function SkeletonFilas({ filas = 5 }: { filas?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="space-y-3">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}

export default Skeleton;
