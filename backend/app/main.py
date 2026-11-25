from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.modules.auth.router import router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.pedidos.router import router as pedidos_router
from app.modules.productos.router import router as productos_router
from app.modules.usuarios.router import router as usuarios_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    yield


app = FastAPI(
    title="Food Store API",
    description=(
        "Trabajo Práctico Integrador · Programación 4 (UTN). Sistema de pedidos de comida: "
        "catálogo, carrito, pedidos con máquina de estados y panel de administración. "
        "Autenticación con JWT en cookie HttpOnly."
    ),
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador envía y acepta la cookie desde el frontend.
# Con allow_credentials=True el origen tiene que ser explícito (no "*").
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_v1 = APIRouter(prefix="/api/v1")
api_v1.include_router(auth_router)
api_v1.include_router(usuarios_router)
api_v1.include_router(categorias_router)
api_v1.include_router(productos_router)
api_v1.include_router(pedidos_router)
app.include_router(api_v1)


@app.get("/", tags=["root"])
def root():
    return {"mensaje": "Food Store API. Documentación en /docs y /redoc"}
