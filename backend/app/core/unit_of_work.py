from types import TracebackType
from typing import Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Unit of Work base.

    Abre la sesión en __enter__. En __exit__ hace commit si el bloque terminó sin
    excepción o rollback si hubo una, y siempre cierra la sesión. Es el ÚNICO lugar
    donde se llama a commit(): ni los Services ni los Routers lo hacen.

    Cada módulo lo extiende en `_crear_repositorios` para exponer sus repositorios,
    que comparten la misma sesión (y por lo tanto la misma transacción).
    """

    session: Session

    def __enter__(self) -> Self:
        self.session = session_factory()
        self._crear_repositorios()
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> None:
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        finally:
            self.session.close()

    def _crear_repositorios(self) -> None:
        """Las subclases instancian aquí sus repositorios con self.session."""
