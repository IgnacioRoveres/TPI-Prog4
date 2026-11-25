import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import Button from "@/shared/ui/Button";
import Input, { Textarea } from "@/shared/ui/Input";
import { errorDeCampo } from "@/shared/ui/formUtils";
import { ETIQUETA_FORMA_PAGO } from "../types/pedido";
import type { CheckoutFormValues, FormaPago } from "../types/pedido";

interface CheckoutFormProps {
  onSubmit: (valores: CheckoutFormValues) => Promise<void>;
  /** Mensaje de error de la API, si el pedido falló. */
  error: string | null;
}

const VALORES: CheckoutFormValues = { direccion_entrega: "", forma_pago: "EFECTIVO", notas: "" };
const FORMAS: FormaPago[] = ["EFECTIVO", "TRANSFERENCIA"];

/** Datos de entrega y pago del pedido (TanStack Form). */
function CheckoutForm({ onSubmit, error }: CheckoutFormProps) {
  const form = useForm({
    defaultValues: VALORES,
    onSubmit: async ({ value }: { value: CheckoutFormValues }) => onSubmit(value),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            if (largo < 5) return "La dirección debe tener al menos 5 caracteres";
            if (largo > 200) return "Máximo 200 caracteres";
            return undefined;
          },
        }}
      >
        {(field) => (
          <Input
            id="direccion_entrega"
            label="Dirección de entrega"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={errorDeCampo(field.state.meta)}
            placeholder="Calle, número, piso y localidad"
            autoComplete="street-address"
            maxLength={200}
            autoFocus
          />
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-stone-700">Forma de pago</legend>
            <div className="grid grid-cols-2 gap-3">
              {FORMAS.map((forma) => (
                <label
                  key={forma}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition-colors ${
                    field.state.value === forma
                      ? "border-orange-500 bg-orange-50"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="forma_pago"
                    value={forma}
                    checked={field.state.value === forma}
                    onChange={() => field.handleChange(forma)}
                    className="accent-orange-600"
                  />
                  <span className="font-medium text-stone-800">
                    {forma === "EFECTIVO" ? "💵" : "🏦"} {ETIQUETA_FORMA_PAGO[forma]}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-stone-500">El pago se coordina al recibir el pedido.</p>
          </fieldset>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? "Máximo 500 caracteres" : undefined) }}
      >
        {(field) => (
          <Textarea
            id="notas"
            label="Notas (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={errorDeCampo(field.state.meta)}
            placeholder="Ej.: tocar timbre, sin cebolla…"
            maxLength={500}
          />
        )}
      </form.Field>

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <Button type="submit" size="lg" fullWidth disabled={!canSubmit} loading={isSubmitting}>
            Confirmar pedido
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}

export default CheckoutForm;
