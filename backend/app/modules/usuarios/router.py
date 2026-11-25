from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import (
    AutoDesactivacion,
    UsuarioNoEncontrado,
    UsuarioService,
    get_usuario_service,
)

router = APIRouter(prefix="/admin/usuarios", tags=["usuarios (admin)"])

solo_admin = require_role(["admin"])


@router.get("", response_model=list[UserPublic])
def listar_usuarios(
    _: UserPublic = Depends(solo_admin),
    service: UsuarioService = Depends(get_usuario_service),
):
    return service.listar()


@router.post("/{usuario_id}/activar", response_model=UserPublic)
def activar_usuario(
    usuario_id: int,
    _: UserPublic = Depends(solo_admin),
    service: UsuarioService = Depends(get_usuario_service),
):
    try:
        return service.activar(usuario_id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e


@router.post("/{usuario_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    usuario_id: int,
    admin: UserPublic = Depends(solo_admin),
    service: UsuarioService = Depends(get_usuario_service),
):
    try:
        return service.desactivar(usuario_id, admin.id)
    except UsuarioNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e)) from e
    except AutoDesactivacion as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)) from e
