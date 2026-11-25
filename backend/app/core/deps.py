"""Dependencias de sesión y rol.

    get_current_user         lee la cookie, valida el JWT y carga el usuario -> 401
    get_current_active_user  además rechaza usuarios con disabled = True     -> 400
    require_role(roles)      además exige uno de los roles                    -> 403
"""

from collections.abc import Callable

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.config import settings
from app.core.security import decode_access_token
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """OAuth2PasswordBearer que lee el token de la cookie HttpOnly `access_token`.

    Si no hay cookie, acepta el encabezado `Authorization: Bearer` (útil en Swagger).
    """

    async def __call__(self, request: Request) -> str | None:  # type: ignore[override]
        token = request.cookies.get(settings.COOKIE_NAME)
        if token:
            return token
        return await super().__call__(request)


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token", auto_error=False)

_NO_AUTENTICADO = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="No autenticado o sesión vencida",
    headers={"WWW-Authenticate": "Bearer"},
)


def get_current_user(token: str | None = Depends(oauth2_scheme)) -> UserPublic:
    if not token:
        raise _NO_AUTENTICADO
    username = decode_access_token(token)
    if username is None:
        raise _NO_AUTENTICADO
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.get_by_username(username)
        if usuario is None:
            raise _NO_AUTENTICADO
        return UserPublic.model_validate(usuario)


def get_current_active_user(usuario: UserPublic = Depends(get_current_user)) -> UserPublic:
    if usuario.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=CUENTA_DESACTIVADA)
    return usuario


def require_role(roles: list[str]) -> Callable[..., UserPublic]:
    """Fábrica de dependencias: 403 si el rol del usuario no está entre `roles`."""

    def verificar(usuario: UserPublic = Depends(get_current_active_user)) -> UserPublic:
        if usuario.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción",
            )
        return usuario

    return verificar
