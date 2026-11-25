import Button from "@/shared/ui/Button";

interface EstadoErrorProps {
  titulo?: string;
  mensaje: string;
  onRetry?: () => void;
}

function EstadoError({ titulo = "No se pudo cargar la información", mensaje, onRetry }: EstadoErrorProps) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-6 py-10 text-center">
      <p className="font-semibold text-red-800">{titulo}</p>
      <p className="mt-1 text-sm text-red-700">{mensaje}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

/** Aviso de error en línea (formularios, acciones). */
export function AlertaError({ mensaje, onClose }: { mensaje: string; onClose?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
    >
      <span>{mensaje}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="shrink-0 font-medium underline">
          Cerrar
        </button>
      )}
    </div>
  );
}

export default EstadoError;
