import { useState } from "react";

/** Emoji según la categoría, para los productos sin imagen. */
function emojiPara(categoria: string): string {
  const c = categoria.toLowerCase();
  if (c.includes("hambur")) return "🍔";
  if (c.includes("pizza")) return "🍕";
  if (c.includes("bebida")) return "🥤";
  if (c.includes("postre") || c.includes("helado")) return "🍰";
  if (c.includes("acompa") || c.includes("papa")) return "🍟";
  if (c.includes("empanada")) return "🥟";
  if (c.includes("ensalada")) return "🥗";
  return "🍽️";
}

interface ProductoImagenProps {
  url: string | null;
  nombre: string;
  categoria: string;
  className?: string;
}

/** Imagen del producto; si no tiene o no carga, muestra un emoji de su categoría. */
function ProductoImagen({ url, nombre, categoria, className = "h-40" }: ProductoImagenProps) {
  const [fallo, setFallo] = useState<boolean>(false);

  if (!url || fallo) {
    return (
      <div
        className={`grid place-items-center bg-gradient-to-br from-orange-100 via-amber-50 to-rose-100 ${className}`}
        role="img"
        aria-label={nombre}
      >
        <span className="text-5xl drop-shadow-sm">{emojiPara(categoria)}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={nombre}
      loading="lazy"
      onError={() => setFallo(true)}
      className={`w-full object-cover ${className}`}
    />
  );
}

export default ProductoImagen;
