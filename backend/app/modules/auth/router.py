from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user
from app.modules.auth.schemas import MensajeLogin, MensajeLogout
from app.modules.auth.service import AuthService, get_auth_service
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(datos: UserCreate, service: AuthService = Depends(get_auth_service)):
    """Registro público. Siempre crea un usuario con rol `user`. 409 si el username o el email existen."""
    return service.registrar(datos)


@router.post("/token", response_model=MensajeLogin)
def login(
    response: Response,
    form: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    """Login con formulario OAuth2 (username y password).

    El JWT viaja SOLO en la cookie HttpOnly `access_token`, que vence a los
    ACCESS_TOKEN_EXPIRE_MINUTES. El cuerpo no incluye el token.
    """
    token = service.login(form.username, form.password)
    response.set_cookie(
        key=settings.COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )
    return MensajeLogin(message="Login exitoso")


@router.post("/logout", response_model=MensajeLogout)
def logout(response: Response):
    """Responde con un Set-Cookie que borra la cookie del navegador."""
    response.delete_cookie(
        key=settings.COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite="lax",
    )
    return MensajeLogout(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(usuario: UserPublic = Depends(get_current_active_user)):
    return usuario
