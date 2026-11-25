import type { ButtonHTMLAttributes } from "react";

type Variante = "primary" | "secondary" | "danger" | "ghost" | "success";
type Tamanio = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante;
  size?: Tamanio;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantes: Record<Variante, string> = {
  primary: "bg-orange-600 text-white hover:bg-orange-700 shadow-sm",
  secondary: "border border-stone-300 bg-white text-stone-700 hover:bg-stone-50",
  danger: "bg-red-50 text-red-700 hover:bg-red-100",
  success: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  ghost: "text-stone-600 hover:bg-stone-100",
};

const tamanios: Record<Tamanio, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-3 text-base",
};

function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantes[variant]} ${tamanios[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

export default Button;
