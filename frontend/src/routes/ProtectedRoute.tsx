import { Navigate, Outlet, useLocation } from "react-router-dom";
import { SkeletonFilas } from "@/shared/components/Skeleton";
import { useAuthStore } from "@/store/authStore";

interface ProtectedRouteProps {
  /** Roles permitidos. Si se omite, alcanza con tener sesión. */
  roles?: Array<"user" | "admin">;
}

/**
 * Protege las rutas hijas (<Outlet />):
 *  - mientras checkSession confirma la sesión, muestra un indicador;
 *  - sin sesión, redirige a /login (y vuelve a la ruta pedida después del login);
 *  - sin el rol, redirige a /unauthorized.
 * La protección real está en el backend: ocultar un botón no reemplaza a require_role.
 */
function ProtectedRoute({ roles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const location = useLocation();

  if (cargando) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10" aria-label="Verificando sesión">
        <SkeletonFilas filas={4} />
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
