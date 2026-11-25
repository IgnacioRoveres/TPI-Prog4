import type { ReactNode } from "react";

interface PageHeaderProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

function PageHeader({ titulo, descripcion, accion }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">{titulo}</h1>
        {descripcion && <p className="mt-1 text-stone-500">{descripcion}</p>}
      </div>
      {accion}
    </div>
  );
}

export default PageHeader;
