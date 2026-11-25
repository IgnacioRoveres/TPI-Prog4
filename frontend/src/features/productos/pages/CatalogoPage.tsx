import { useState } from "react";
import { useCategorias } from "@/features/categorias/hooks/useCategorias";
import { handleApiError } from "@/shared/api/handleApiError";
import EstadoError from "@/shared/components/EstadoError";
import EstadoVacio from "@/shared/components/EstadoVacio";
import Paginacion from "@/shared/components/Paginacion";
import { SkeletonProductos } from "@/shared/components/Skeleton";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import Button from "@/shared/ui/Button";
import ProductoCard from "../components/ProductoCard";
import { useProductos } from "../hooks/useProductos";

const POR_PAGINA = 8;

/** Catálogo público: paginado en el servidor, con búsqueda y filtro por categoría. */
function CatalogoPage() {
  const [pagina, setPagina] = useState<number>(0);
  const [busqueda, setBusqueda] = useState<string>("");
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);
  const busquedaDemorada = useDebouncedValue(busqueda.trim(), 300);

  const { data: categorias } = useCategorias();
  const { data, isLoading, isError, error, isFetching, refetch } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: busquedaDemorada || undefined,
    categoria_id: categoriaId,
  });

  const totalPaginas = data ? Math.ceil(data.total / POR_PAGINA) : 0;
  const hayFiltros = Boolean(busquedaDemorada) || categoriaId !== undefined;

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaId(undefined);
    setPagina(0);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <section className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-orange-600 via-orange-500 to-amber-400 px-8 py-10 text-white shadow-lg">
        <h1 className="text-4xl font-extrabold tracking-tight">¿Qué pedimos hoy?</h1>
        <p className="mt-2 max-w-xl text-orange-50">
          Hamburguesas, pizzas, bebidas y postres. Armá tu pedido y te lo llevamos a tu casa.
        </p>
      </section>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setPagina(0);
          }}
          placeholder="Buscar productos…"
          aria-label="Buscar productos"
          className="w-full max-w-xs rounded-xl border border-stone-300 bg-white px-4 py-2.5 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoría">
          <button
            type="button"
            onClick={() => {
              setCategoriaId(undefined);
              setPagina(0);
            }}
            aria-pressed={categoriaId === undefined}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              categoriaId === undefined
                ? "bg-stone-900 text-white"
                : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
            }`}
          >
            Todas
          </button>
          {categorias?.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setCategoriaId(cat.id);
                setPagina(0);
              }}
              aria-pressed={categoriaId === cat.id}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                categoriaId === cat.id
                  ? "bg-stone-900 text-white"
                  : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
        {isFetching && !isLoading && (
          <span className="text-sm text-stone-400" aria-live="polite">
            Actualizando…
          </span>
        )}
      </div>

      {isLoading ? (
        <SkeletonProductos cantidad={POR_PAGINA} />
      ) : isError ? (
        <EstadoError
          titulo="No se pudo cargar el catálogo"
          mensaje={handleApiError(error)}
          onRetry={() => void refetch()}
        />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio
          icono="🔍"
          titulo={hayFiltros ? "No encontramos productos" : "Todavía no hay productos"}
          descripcion={
            hayFiltros ? "Probá con otra búsqueda o con otra categoría." : "Volvé a visitarnos pronto."
          }
          accion={
            hayFiltros ? (
              <Button variant="secondary" onClick={limpiarFiltros}>
                Limpiar filtros
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>
          <Paginacion
            pagina={pagina}
            totalPaginas={totalPaginas}
            totalItems={data.total}
            onCambiar={(p) => {
              setPagina(p);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </main>
  );
}

export default CatalogoPage;
