/** Primer error de un campo de TanStack Form, solo si el usuario ya lo tocó. */
export function errorDeCampo(meta: { isTouched: boolean; errors: unknown[] }): string | undefined {
  if (!meta.isTouched) return undefined;
  const error = meta.errors.find(Boolean);
  return error ? String(error) : undefined;
}
