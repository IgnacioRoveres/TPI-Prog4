const formatoPrecio = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" });
const formatoFecha = new Intl.DateTimeFormat("es-AR", { dateStyle: "short", timeStyle: "short" });

export function precio(valor: number): string {
  return formatoPrecio.format(valor);
}

export function fecha(iso: string): string {
  return formatoFecha.format(new Date(iso));
}
