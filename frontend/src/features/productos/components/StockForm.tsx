import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import Button from "@/shared/ui/Button";
import Input, { Checkbox } from "@/shared/ui/Input";
import { errorDeCampo } from "@/shared/ui/formUtils";
import type { Producto, ProductoStockUpdate } from "../types/producto";

interface StockFormProps {
  producto: Producto;
  onSubmit: (datos: ProductoStockUpdate) => Promise<void>;
  onCancel: () => void;
  error: string | null;
}

/** Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock). */
function StockForm({ producto, onSubmit, onCancel, error }: StockFormProps) {
  const form = useForm({
    defaultValues: { stock: producto.stock, disponible: producto.disponible } as ProductoStockUpdate,
    onSubmit: async ({ value }: { value: ProductoStockUpdate }) => onSubmit(value),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <p className="text-sm text-stone-500">
        Stock actual de <strong className="text-stone-800">{producto.nombre}</strong>: {producto.stock} unidades.
      </p>

      <form.Field
        name="stock"
        validators={{
          onChange: ({ value }) =>
            Number.isNaN(value) || !Number.isInteger(value)
              ? "Ingresá un número entero"
              : value < 0
                ? "No puede ser negativo"
                : undefined,
        }}
      >
        {(field) => (
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Input
                id="stock-nuevo"
                type="number"
                label="Nuevo stock"
                min={0}
                step={1}
                value={Number.isNaN(field.state.value) ? "" : field.state.value}
                onChange={(e) => field.handleChange(e.target.valueAsNumber)}
                onBlur={field.handleBlur}
                error={errorDeCampo(field.state.meta)}
                autoFocus
              />
            </div>
            {[10, 50].map((n) => (
              <Button
                key={n}
                variant="secondary"
                onClick={() => field.handleChange((Number.isNaN(field.state.value) ? 0 : field.state.value) + n)}
              >
                +{n}
              </Button>
            ))}
          </div>
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <Checkbox
            id="stock-disponible"
            label="Disponible para la venta"
            checked={field.state.value}
            onChange={(e) => field.handleChange(e.target.checked)}
          />
        )}
      </form.Field>

      {error && (
        <div role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!canSubmit} loading={isSubmitting}>
              Actualizar stock
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}

export default StockForm;
