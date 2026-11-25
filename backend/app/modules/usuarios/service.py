from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# --- Excepciones de dominio ---

class UsuarioNoEncontrado(Exception):
    def __init__(self, usuario_id: int) -> None:
        super().__init__(f"Usuario {usuario_id} no encontrado")


class AutoDesactivacion(Exception):
    def __init__(self) -> None:
        super().__init__("No podés desactivar tu propia cuenta")


class UsuarioService:
    """Administración de usuarios (solo admin): listado, activación y desactivación."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    @staticmethod
    def _obtener(uow: UsuarioUnitOfWork, usuario_id: int) -> Usuario:
        usuario = uow.usuarios.get_by_id(usuario_id)
        if usuario is None:
            raise UsuarioNoEncontrado(usuario_id)
        return usuario

    def listar(self) -> list[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.get_all()]

    def activar(self, usuario_id: int) -> UserPublic:
        """Alta lógica (disabled = False). Idempotente: 200 aunque ya estuviera activo."""
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            usuario.disabled = False
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)

    def desactivar(self, usuario_id: int, admin_id: int) -> UserPublic:
        """Baja lógica (disabled = True). Idempotente. El admin no puede desactivarse a sí mismo."""
        with self.uow as uow:
            usuario = self._obtener(uow, usuario_id)
            if usuario.id == admin_id:
                raise AutoDesactivacion()
            usuario.disabled = True
            uow.usuarios.add(usuario)
            return UserPublic.model_validate(usuario)


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())
