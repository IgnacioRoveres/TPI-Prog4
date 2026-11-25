import { Link } from "react-router-dom";

function UnauthorizedPage() {
  return (
    <main className="mx-auto flex max-w-lg flex-col items-center px-6 py-24 text-center">
      <span className="text-6xl" aria-hidden="true">
        🔒
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-stone-900">Sin permiso</h1>
      <p className="mt-2 text-stone-500">Tu usuario no tiene acceso a esta sección.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
      >
        Volver al inicio
      </Link>
    </main>
  );
}

export default UnauthorizedPage;
