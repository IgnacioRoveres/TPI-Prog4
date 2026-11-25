import { NavLink, Outlet } from "react-router-dom";

const secciones = [
  { to: "/admin/resumen", label: "Resumen", icono: "📊" },
  { to: "/admin/pedidos", label: "Pedidos", icono: "🧾" },
  { to: "/admin/productos", label: "Productos", icono: "🍕" },
  { to: "/admin/categorias", label: "Categorías", icono: "🗂️" },
  { to: "/admin/usuarios", label: "Usuarios", icono: "👥" },
];

/** Panel de administración: pestañas de secciones y el contenido de la ruta. */
function AdminLayout() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-600">Panel de administración</p>
        <nav aria-label="Secciones del panel" className="mt-3 flex flex-wrap gap-2">
          {secciones.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-stone-900 text-white"
                    : "border border-stone-200 bg-white text-stone-700 hover:bg-stone-50"
                }`
              }
            >
              <span aria-hidden="true">{s.icono}</span> {s.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </main>
  );
}

export default AdminLayout;
