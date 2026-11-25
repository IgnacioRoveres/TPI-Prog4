import { useState } from "react";
import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { AlertaError } from "@/shared/components/EstadoError";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import { errorDeCampo } from "@/shared/ui/formUtils";
import { useAuthStore } from "@/store/authStore";
import AuthCard from "../components/AuthCard";
import type { LoginFormValues } from "../types/auth";

interface EstadoNavegacion {
  from?: string;
  registrado?: string;
}

const VALORES: LoginFormValues = { username: "", password: "" };

function LoginPage() {
  const usuario = useAuthStore((state) => state.usuario);
  const cargando = useAuthStore((state) => state.cargando);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();
  const estado = (location.state ?? {}) as EstadoNavegacion;
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { ...VALORES, username: estado.registrado ?? "" },
    onSubmit: async ({ value }: { value: LoginFormValues }) => {
      setError(null);
      try {
        const sesion = await login(value.username.trim().toLowerCase(), value.password);
        const destino = estado.from ?? (sesion.role === "admin" ? "/admin/resumen" : "/");
        navigate(destino, { replace: true });
      } catch (e) {
        setError(handleApiError(e));
      }
    },
  });

  if (usuario && !cargando) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <AuthCard
      titulo="Iniciar sesión"
      subtitulo="Ingresá para confirmar tus pedidos."
      pie={
        <>
          ¿No tenés cuenta?{" "}
          <Link
            to="/register"
            state={{ from: estado.from }}
            className="font-semibold text-orange-600 hover:underline"
          >
            Registrate
          </Link>
        </>
      }
    >
      {estado.registrado && !error && (
        <div role="status" className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          ¡Cuenta creada! Ingresá con tu contraseña.
        </div>
      )}
      {estado.from && !estado.registrado && !error && (
        <div role="status" className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Iniciá sesión para continuar.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) => (!value.trim() ? "Ingresá tu nombre de usuario" : undefined),
          }}
        >
          {(field) => (
            <Input
              id="username"
              label="Usuario"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="username"
              autoFocus={!estado.registrado}
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{ onChange: ({ value }) => (!value ? "Ingresá tu contraseña" : undefined) }}
        >
          {(field) => (
            <Input
              id="password"
              type="password"
              label="Contraseña"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="current-password"
              autoFocus={Boolean(estado.registrado)}
            />
          )}
        </form.Field>

        {error && <AlertaError mensaje={error} />}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" size="lg" fullWidth disabled={!canSubmit} loading={isSubmitting}>
              Ingresar
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

export default LoginPage;
