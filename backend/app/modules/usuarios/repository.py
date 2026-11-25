from sqlalchemy import func
from sqlmodel import col, select

from app.core.base_repository import BaseRepository
from app.modules.usuarios.models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Usuario | None:
        stmt = select(Usuario).where(func.lower(Usuario.username) == username.strip().lower())
        return self.session.exec(stmt).first()

    def get_by_email(self, email: str) -> Usuario | None:
        stmt = select(Usuario).where(func.lower(Usuario.email) == email.strip().lower())
        return self.session.exec(stmt).first()

    def get_all(self) -> list[Usuario]:
        return list(self.session.exec(select(Usuario).order_by(col(Usuario.id))).all())
