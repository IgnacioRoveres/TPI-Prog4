from collections.abc import Callable

from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _normalizar_url(url: str) -> str:
    """Usa psycopg2 (psycopg2-binary) para las URL `postgresql://` o `postgres://`.

    Desde SQLAlchemy 2.1 el driver por defecto de `postgresql://` es psycopg 3; así la
    URL del .env.example funciona tal cual con el driver que fija requirements.txt.
    """
    for prefijo in ("postgresql://", "postgres://"):
        if url.startswith(prefijo):
            return "postgresql+psycopg2://" + url[len(prefijo):]
    return url


DATABASE_URL = _normalizar_url(settings.DATABASE_URL)

# SQLite (solo para desarrollo) necesita check_same_thread=False con FastAPI
_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=_connect_args)


def session_factory() -> Session:
    """Crea una sesión nueva. La usa el Unit of Work."""
    return Session(engine)


def create_all_tables() -> None:
    """Crea las tablas de los cinco modelos si no existen."""
    # Importar los modelos para registrarlos en SQLModel.metadata
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.usuarios import models as _usuarios  # noqa: F401

    SQLModel.metadata.create_all(engine)


SessionFactory = Callable[[], Session]
