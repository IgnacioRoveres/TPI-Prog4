import { useEffect, useState } from "react";

/** Devuelve `valor` recién cuando dejó de cambiar durante `ms` milisegundos (para la búsqueda). */
export function useDebouncedValue<T>(valor: T, ms = 300): T {
  const [demorado, setDemorado] = useState<T>(valor);

  useEffect(() => {
    const timer = window.setTimeout(() => setDemorado(valor), ms);
    return () => window.clearTimeout(timer);
  }, [valor, ms]);

  return demorado;
}
