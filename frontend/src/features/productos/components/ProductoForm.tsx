import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import type { Categoria } from "@/features/categorias/types/categoria";
import Button from "@/shared/ui/Button";
import Input, { Checkbox, Select, Textarea } from "@/shared/ui/Input";
import { errorDeCampo } from "@/shared/ui/formUtils";
import type { Producto, ProductoCreate, ProductoFormValues } from "../types/producto";

interface ProductoFormProps {
  producto: Producto | null;
  categorias: Categoria[];
  onSubmit: (datos: ProductoCreate) => Promise<void>;
  onCancel: () => void;
  error: string | null;
}

function valoresIniciales(producto: Producto | null, categorias: Categoria[]): ProductoFormValues {
  return {
    categoria_id: producto?.categoria_id ?? categorias[0]?.id ?? 0,
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    precio_base: producto?.precio_base ?? 0,
    imagen_url: producto?.imagen_url ?? "",
    stock: producto?.stock ?? 0,
    disponible: producto?.disponible ?? true,
  };
}

/** Alta y edición de productos (TanStack Form). */
function ProductoForm({ producto, categorias, onSubmit, onCancel, error }: ProductoFormProps) {
  const form = useForm({
    defaultValues: valoresIniciales(producto, categorias),
    onSubmit: async ({ value }: { value: ProductoFormValues }) =>
      onSubmit({
        categoria_id: value.categoria_id,
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: value.precio_base,
        imagen_url: value.imagen_url.trim() || null,
        stock: value.stock,
        disponible: value.disponible,
      }),
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="nombre"
          validators={{ onChange: ({ value }) => (!value.trim() ? "El nombre es obligatorio" : undefined) }}
        >
          {(field) => (
            <Input
              id="nombre"
              label="Nombre"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              maxLength={150}
              autoFocus
            />
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{ onChange: ({ value }) => (!value ? "Elegí una categoría" : undefined) }}
        >
          {(field) => (
            <Select
              id="categoria_id"
              label="Categoría"
              value={field.state.value}
              onChange={(e) => field.handleChange(Number(e.target.value))}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            >
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </Select>
          )}
        </form.Field>
      </div>

      <form.Field name="descripcion">
        {(field) => (
          <Textarea
            id="descripcion"
            label="Descripción (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            rows={2}
            maxLength={1000}
          />
        )}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              Number.isNaN(value) ? "El precio es obligatorio" : value < 0 ? "No puede ser negativo" : undefined,
          }}
        >
          {(field) => (
            <Input
              id="precio_base"
              type="number"
              label="Precio ($)"
              min={0}
              step={0.01}
              value={Number.isNaN(field.state.value) ? "" : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>

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
            <Input
              id="stock"
              type="number"
              label="Stock"
              min={0}
              step={1}
              value={Number.isNaN(field.state.value) ? "" : field.state.value}
              onChange={(e) => field.handleChange(e.target.valueAsNumber)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
            />
          )}
        </form.Field>
      </div>

      <form.Field
        name="imagen_url"
        validators={{
          onChange: ({ value }) =>
            value.trim() && !/^https?:\/\/\S+$/i.test(value.trim()) ? "Debe empezar con http:// o https://" : undefined,
        }}
      >
        {(field) => (
          <Input
            id="imagen_url"
            label="URL de la imagen (opcional)"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={errorDeCampo(field.state.meta)}
            placeholder="https://…"
          />
        )}
      </form.Field>

      <form.Field name="disponible">
        {(field) => (
          <Checkbox
            id="disponible"
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
              Guardar
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}

export default ProductoForm;
