/** Datos de la sesión que guarda el authStore (nombre, email y rol). Nunca el token. */
export interface UsuarioSesion {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "user" | "admin";
}

/** Cuerpo de POST /auth/register (schema UserCreate). */
export interface UserCreate {
  username: string;
  full_name: string;
  email: string;
  password: string;
}

/** Valores del formulario de registro (con la confirmación de la contraseña). */
export interface RegistroFormValues extends UserCreate {
  confirmar: string;
}

export interface LoginFormValues {
  username: string;
  password: string;
}

/** Respuesta de POST /auth/token y /auth/logout. */
export interface MensajeAuth {
  message: string;
}
