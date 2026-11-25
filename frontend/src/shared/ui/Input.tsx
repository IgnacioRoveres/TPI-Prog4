import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

const claseControl = (conError: boolean): string =>
  `w-full rounded-lg border bg-white px-3 py-2 text-stone-800 outline-none transition focus:ring-2 ${
    conError
      ? "border-red-400 focus:border-red-500 focus:ring-red-100"
      : "border-stone-300 focus:border-orange-500 focus:ring-orange-100"
  }`;

interface CampoProps {
  id: string;
  label: string;
  error?: string;
  ayuda?: string;
  children: ReactNode;
}

function Campo({ id, label, error, ayuda, children }: CampoProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      ) : (
        ayuda && <p className="mt-1 text-xs text-stone-500">{ayuda}</p>
      )}
    </div>
  );
}

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  ayuda?: string;
}

/** Campo de texto con etiqueta y mensaje de error. */
function Input({ id, label, error, ayuda, className = "", ...props }: InputProps) {
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <input
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${claseControl(Boolean(error))} ${className}`}
        {...props}
      />
    </Campo>
  );
}

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  ayuda?: string;
}

export function Textarea({ id, label, error, ayuda, rows = 3, ...props }: TextareaProps) {
  return (
    <Campo id={id} label={label} error={error} ayuda={ayuda}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${claseControl(Boolean(error))} resize-none`}
        {...props}
      />
    </Campo>
  );
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export function Select({ id, label, error, children, ...props }: SelectProps) {
  return (
    <Campo id={id} label={label} error={error}>
      <select
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={claseControl(Boolean(error))}
        {...props}
      >
        {children}
      </select>
    </Campo>
  );
}

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "type"> {
  id: string;
  label: string;
}

export function Checkbox({ id, label, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-stone-700">
      <input id={id} type="checkbox" className="h-4 w-4 rounded accent-orange-600" {...props} />
      {label}
    </label>
  );
}

export default Input;
