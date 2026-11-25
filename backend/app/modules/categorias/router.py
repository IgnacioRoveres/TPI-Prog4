from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.service import (
    CategoriaNoEncontrada,
    CategoriaService,
    NombreDuplicado,
    get_categoria_service,
)

router = APIRouter(prefix="/categorias", tags=["categorias"])

solo_admin = [Depends(require_role(["admin"]))]


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(service: CategoriaService = Depends(get_categoria_service)):
    """Público. Solo las categorías activas."""
    return service.listar()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.obtener(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=solo_admin)
def crear_categoria(datos: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)):
    try:
        return service.crear(datos)
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.put("/{categoria_id}", response_model=CategoriaRead, dependencies=solo_admin)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    service: CategoriaService = Depends(get_categoria_service),
):
    try:
        return service.actualizar(categoria_id, datos)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    except NombreDuplicado as e:
        raise HTTPException(status.HTTP_409_CONFLICT, str(e)) from e


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=solo_admin)
def eliminar_categoria(categoria_id: int, service: CategoriaService = Depends(get_categoria_service)):
    """Baja lógica (activo = false)."""
    try:
        service.eliminar(categoria_id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
