from sqlalchemy import func
from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def get_by_nombre(self, nombre: str) -> Categoria | None:
        """Busca por nombre sin distinguir mayúsculas, incluidas las dadas de baja
        (la baja lógica no libera el nombre único)."""
        stmt = select(Categoria).where(func.lower(Categoria.nombre) == nombre.strip().lower())
        return self.session.exec(stmt).first()

    def list_activas(self) -> list[Categoria]:
        stmt = select(Categoria).where(col(Categoria.activo).is_(True)).order_by(col(Categoria.nombre))
        return list(self.session.exec(stmt).all())
