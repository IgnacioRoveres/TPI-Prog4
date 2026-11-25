import type { ReactNode } from "react";

interface EstadoVacioProps {
  icono?: string;
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

function EstadoVacio({ icono = "🍽️", titulo, descripcion, accion }: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
      <span className="text-5xl" aria-hidden="true">
        {icono}
      </span>
      <p className="mt-4 text-lg font-semibold text-stone-800">{titulo}</p>
      {descripcion && <p className="mt-1 max-w-md text-sm text-stone-500">{descripcion}</p>}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

export default EstadoVacio;
