# 🍔 Food Store — Trabajo Práctico Integrador

**Programación IV · Tecnicatura Universitaria en Programación · UTN**
**Alumno:** Ignacio V. Roveres

Sistema de pedidos de comida. Los clientes navegan el catálogo, arman un carrito y confirman pedidos. El administrador gestiona categorías, productos, stock, pedidos y usuarios.

| Recurso | Link |
|---|---|
| 📦 Repositorio público | **https://github.com/IgnacioRoveres/TPI-Prog4** |
| 🎥 Video de demostración | **https://youtu.be/XXXXXXXXXXX** *(reemplazar)* |

---

## Stack

| Capa | Tecnologías |
|---|---|
| Backend | Python, FastAPI, SQLModel, PostgreSQL, JWT en cookie HttpOnly (python-jose), bcrypt (passlib) |
| Frontend | React 19, TypeScript (`strict`), Vite, Tailwind CSS 4, TanStack Query / Form / Table, Zustand, Axios, React Router |

## Requisitos

- **Python 3.11, 3.12 o 3.13.** Python 3.14 todavía no es compatible con todas las dependencias. En Windows, si tenés 3.14 instalado, podés sumar 3.13 sin desinstalar nada: `py install 3.13`.
- **Node.js 20.19 o superior**, con **pnpm** (`npm install -g pnpm`).
- **PostgreSQL 14 o superior**, con una base vacía llamada `foodstore_db`.

## Puesta en marcha

### 1. Base de datos

Creá la base, desde pgAdmin o desde la consola:

```sql
CREATE DATABASE foodstore_db;
```

### 2. Backend (puerto 8000)

```bash
cd backend
py -3.13 -m venv .venv            # Linux/Mac: python3 -m venv .venv
.venv\Scripts\activate            # Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env            # Linux/Mac: cp .env.example .env
# Editá .env: DATABASE_URL con tu usuario y contraseña de PostgreSQL, y un SECRET_KEY propio
python -m app.db.seed             # crea las tablas, el admin, las categorías y los productos
uvicorn app.main:app --reload
```

- La documentación interactiva queda en http://localhost:8000/docs (Swagger) y en http://localhost:8000/redoc.
- `backend/requests.http` recorre todos los endpoints, incluidos los códigos de error. Se usa con la extensión REST Client de VS Code.

### 3. Frontend (puerto 5173)

En otra terminal:

```bash
cd frontend
pnpm install
copy .env.example .env            # Linux/Mac: cp .env.example .env
pnpm build                        # verifica tipos (tsc) y compila
pnpm dev
```

La aplicación queda en **http://localhost:5173**.

## Variables de entorno

### `backend/.env`

| Variable | Ejemplo | Descripción |
|---|---|---|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/foodstore_db` | Conexión a PostgreSQL. Para desarrollo también acepta `sqlite:///./foodstore.db`. |
| `SECRET_KEY` | *(32+ caracteres aleatorios)* | Firma de los JWT. Se genera con `python -c "import secrets; print(secrets.token_hex(32))"`. |
| `ALGORITHM` | `HS256` | Algoritmo del JWT. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Duración de la sesión. |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Origen habilitado en CORS, con credenciales. |

### `frontend/.env`

| Variable | Ejemplo | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | URL base de la API. |

## Usuario administrador (seed)

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin1234!` | admin |

Los clientes se crean desde la pantalla **Crear cuenta**, siempre con rol `user`.

El seed es idempotente: se puede correr más de una vez sin duplicar datos. Carga 5 categorías y 13 productos con stock.

## Funcionalidades

**Cliente**
- Catálogo público con búsqueda (con debounce), filtro por categoría, paginación del servidor y skeletons de carga.
- Carrito persistente: sobrevive a una recarga y no deja superar el stock disponible.
- Registro y login. Si se intenta confirmar el pedido sin sesión, después del login vuelve al checkout.
- Checkout con dirección, forma de pago (efectivo o transferencia) y notas.
- "Mis pedidos" con el detalle de cada pedido y la opción de cancelarlo mientras esté **Pendiente**. Al cancelar se restituye el stock.

**Administrador** (`/admin`)
- **Resumen:** pedidos por estado, pedidos del día e ingresos de los pedidos entregados.
- **Pedidos:** filtro por estado y botones que siguen la máquina de estados `PENDIENTE → EN_PREPARACION → ENTREGADO`. Se puede cancelar desde `PENDIENTE` o `EN_PREPARACION`, y la cancelación restituye el stock.
- **Productos:** ABM, cambio rápido de stock y disponibilidad, y baja lógica.
- **Categorías:** ABM con baja lógica, con validación de nombre duplicado (409).
- **Usuarios:** activar y desactivar cuentas. El admin no puede desactivarse a sí mismo.

## Reglas de negocio

- El pedido se crea en **una sola transacción** (Unit of Work). Verifica que haya stock, lo descuenta y copia el nombre y el precio de cada producto en `DetallePedido`. Si un ítem falla, se hace rollback de todo el pedido.
- Las transiciones inválidas de estado devuelven 400. Cancelar restituye el stock.
- Categorías, productos y usuarios usan baja lógica (`activo` en los dos primeros, `disabled` en usuarios). Los pedidos nunca se borran: se cancelan.
- El JWT viaja **solo** en una cookie `HttpOnly`. El frontend nunca lee ni guarda el token. Ante un 401, el interceptor de Axios limpia la sesión.

## Estructura

```
backend/
├── app/
│   ├── core/        config, database, security, UnitOfWork, BaseRepository, deps (auth y roles)
│   ├── modules/     auth · usuarios · categorias · productos · pedidos
│   │                (cada uno con models / schemas / repository / unit_of_work / service / router)
│   ├── db/seed.py
│   └── main.py      FastAPI + CORS + routers bajo /api/v1
├── requirements.txt
├── requests.http
└── .env.example
frontend/
├── src/
│   ├── features/    auth · categorias · productos · pedidos · usuarios  (api / hooks / types / components / pages)
│   ├── shared/      api (axios, errores, queryClient) · ui · components · layout · hooks · utils
│   ├── store/       authStore y cartStore (Zustand + persist)
│   └── routes/      AppRouter y ProtectedRoute (por sesión y por rol)
└── .env.example
```
