import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

/** Navbar arriba y el contenido de la ruta debajo. */
function MainLayout() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Outlet />
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-stone-400">
        Food Store · Trabajo Práctico Integrador · Programación 4 · UTN
      </footer>
    </div>
  );
}

export default MainLayout;
