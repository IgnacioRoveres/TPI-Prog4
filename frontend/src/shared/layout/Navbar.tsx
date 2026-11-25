import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

const claseLink = ({ isActive }: { isActive: boolean }): string =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? "bg-orange-50 text-orange-700" : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
  }`;

function Navbar() {
  const usuario = useAuthStore((state) => state.usuario);
  const logout = useAuthStore((state) => state.logout);
  const cantidadCarrito = useCartStore((state) => state.cantidadTotal());
  const navigate = useNavigate();

  const cerrarSesion = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-stone-900">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-orange-600 text-lg">🍔</span>
          Food Store
        </Link>

        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <NavLink to="/" end className={claseLink}>
              Catálogo
            </NavLink>
          </li>
          {usuario && (
            <li>
              <NavLink to="/mis-pedidos" className={claseLink}>
                Mis pedidos
              </NavLink>
            </li>
          )}
          {usuario?.role === "admin" && (
            <li>
              <NavLink to="/admin" className={claseLink}>
                Panel admin
              </NavLink>
            </li>
          )}
          <li>
            <NavLink to="/carrito" className={claseLink} aria-label={`Carrito (${cantidadCarrito})`}>
              <span className="inline-flex items-center gap-1.5">
                🛒 Carrito
                {cantidadCarrito > 0 && (
                  <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs font-bold text-white">
                    {cantidadCarrito}
                  </span>
                )}
              </span>
            </NavLink>
          </li>
        </ul>

        {usuario ? (
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-semibold text-stone-900">{usuario.full_name}</p>
              <p className="text-xs text-stone-500">
                @{usuario.username} ·{" "}
                <span
                  className={`rounded-full px-1.5 py-0.5 font-semibold ${
                    usuario.role === "admin" ? "bg-amber-100 text-amber-800" : "bg-stone-100 text-stone-600"
                  }`}
                >
                  {usuario.role}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => void cerrarSesion()}
              className="rounded-lg border border-stone-200 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Cerrar sesión
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              Ingresar
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-orange-600 px-3 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              Crear cuenta
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}

export default Navbar;
