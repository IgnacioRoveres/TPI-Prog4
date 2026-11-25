interface ResumenCardProps {
  titulo: string;
  valor: string;
  icono: string;
  color: "amber" | "sky" | "emerald" | "stone" | "orange" | "violet";
  ayuda?: string;
}

const colores: Record<ResumenCardProps["color"], string> = {
  amber: "bg-amber-50 text-amber-700",
  sky: "bg-sky-50 text-sky-700",
  emerald: "bg-emerald-50 text-emerald-700",
  stone: "bg-stone-100 text-stone-600",
  orange: "bg-orange-50 text-orange-700",
  violet: "bg-violet-50 text-violet-700",
};

/** Tarjeta de un indicador del resumen del negocio. */
function ResumenCard({ titulo, valor, icono, color, ayuda }: ResumenCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-stone-500">{titulo}</p>
        <span className={`grid h-10 w-10 place-items-center rounded-xl text-xl ${colores[color]}`} aria-hidden="true">
          {icono}
        </span>
      </div>
      <p className="mt-3 text-3xl font-extrabold tabular-nums text-stone-900">{valor}</p>
      {ayuda && <p className="mt-1 text-xs text-stone-400">{ayuda}</p>}
    </div>
  );
}

export default ResumenCard;
