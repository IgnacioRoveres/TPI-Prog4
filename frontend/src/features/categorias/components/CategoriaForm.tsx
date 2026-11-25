import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import Button from "@/shared/ui/Button";
import Input, { Textarea } from "@/shared/ui/Input";
import { errorDeCampo } from "@/shared/ui/formUtils";
import type { Categoria, CategoriaCreate } from "../types/categoria";

interface CategoriaFormProps {
  /** Categoría a editar; null para un alta. */
  categoria: Categoria | null;
  onSubmit: (datos: CategoriaCreate) => Promise<void>;
  onCancel: () => void;
  error: string | null;
}

interface Valores {
  nombre: string;
  descripcion: string;
}

/** Alta y edición de categorías (TanStack Form). */
function CategoriaForm({ categoria, onSubmit, onCancel, error }: CategoriaFormProps) {
  const form = useForm({
    defaultValues: {
      nombre: categoria?.nombre ?? "",
      descripcion: categoria?.descripcion ?? "",
    } as Valores,
    onSubmit: async ({ value }: { value: Valores }) =>
      onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || null }),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <form.Field
        name="nombre"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length;
            return largo < 2 || largo > 100 ? "El nombre debe tener entre 2 y 100 caracteres" : undefined;
          },
        }}
      >
        {(field) => (
          <Input
            id="nombre"
            label="Nombre"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={errorDeCampo(field.state.meta)}
            maxLength={100}
            autoFocus
          />
        )}
      </form.Field>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            id="descripcion"
            label="Descripción (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            maxLength={500}
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
              Guardar
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}

export default CategoriaForm;
