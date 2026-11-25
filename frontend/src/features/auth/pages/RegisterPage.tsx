import type { FormEvent } from "react";
import { useForm } from "@tanstack/react-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { handleApiError } from "@/shared/api/handleApiError";
import { AlertaError } from "@/shared/components/EstadoError";
import Button from "@/shared/ui/Button";
import Input from "@/shared/ui/Input";
import { errorDeCampo } from "@/shared/ui/formUtils";
import AuthCard from "../components/AuthCard";
import { useRegistro } from "../hooks/useRegistro";
import type { RegistroFormValues } from "../types/auth";

const VALORES: RegistroFormValues = {
  username: "",
  full_name: "",
  email: "",
  password: "",
  confirmar: "",
};

const USERNAME_REGEX = /^[A-Za-z0-9._-]{3,50}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  // Si venía del checkout, después del login vuelve ahí
  const { from } = (location.state ?? {}) as { from?: string };
  const registro = useRegistro();

  const form = useForm({
    defaultValues: VALORES,
    onSubmit: async ({ value }: { value: RegistroFormValues }) => {
      try {
        const usuario = await registro.mutateAsync({
          username: value.username.trim().toLowerCase(),
          full_name: value.full_name.trim(),
          email: value.email.trim().toLowerCase(),
          password: value.password,
        });
        navigate("/login", { replace: true, state: { registrado: usuario.username, from } });
      } catch {
        // El error (409 usuario o email repetido) se muestra desde el estado de la mutación
      }
    },
  });

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    void form.handleSubmit();
  };

  return (
    <AuthCard
      titulo="Crear cuenta"
      subtitulo="Registrate para hacer tus pedidos."
      pie={
        <>
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" state={{ from }} className="font-semibold text-orange-600 hover:underline">
            Iniciá sesión
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) =>
              !USERNAME_REGEX.test(value.trim())
                ? "Entre 3 y 50 caracteres: letras, números, punto, guion o guion bajo"
                : undefined,
          }}
        >
          {(field) => (
            <Input
              id="username"
              label="Nombre de usuario"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="username"
              placeholder="ej: juanperez"
              autoFocus
            />
          )}
        </form.Field>

        <form.Field
          name="full_name"
          validators={{
            onChange: ({ value }) =>
              value.trim().length < 2 ? "Ingresá tu nombre y apellido" : undefined,
          }}
        >
          {(field) => (
            <Input
              id="full_name"
              label="Nombre completo"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="name"
              maxLength={120}
            />
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => (!EMAIL_REGEX.test(value.trim()) ? "Ingresá un email válido" : undefined),
          }}
        >
          {(field) => (
            <Input
              id="email"
              type="email"
              label="Email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="email"
            />
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length < 8
                ? "La contraseña debe tener al menos 8 caracteres"
                : value.length > 72
                  ? "Máximo 72 caracteres"
                  : undefined,
          }}
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
              autoComplete="new-password"
            />
          )}
        </form.Field>

        <form.Field
          name="confirmar"
          validators={{
            onChangeListenTo: ["password"],
            onChange: ({ value, fieldApi }) =>
              value !== fieldApi.form.getFieldValue("password") ? "Las contraseñas no coinciden" : undefined,
          }}
        >
          {(field) => (
            <Input
              id="confirmar"
              type="password"
              label="Repetir contraseña"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={errorDeCampo(field.state.meta)}
              autoComplete="new-password"
            />
          )}
        </form.Field>

        {registro.isError && <AlertaError mensaje={handleApiError(registro.error)} />}

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" size="lg" fullWidth disabled={!canSubmit} loading={isSubmitting}>
              Crear cuenta
            </Button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

export default RegisterPage;
