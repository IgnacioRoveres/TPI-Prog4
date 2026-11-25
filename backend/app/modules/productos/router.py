from fastapi import APIRouter, Depends, HTTPException, Query, Response, status

from app.core.deps import require_role
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
    get_producto_service,
)

router = APIRouter(prefix="/productos", tags=["productos"])

solo_admin = [Depends(require_role(["admin"]))]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = Query(None, description="Busca en el nombre, sin distinguir mayúsculas"),
    categoria_id: int | None = Query(None),
    disponible: bool | None = Query(None),
    service: ProductoService = Depends(get_producto_service),
):
    """Público. Solo productos activos, paginados: { total, items }."""
    return service.listar(
        skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.obtener(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=solo_admin)
def crear_producto(datos: ProductoCreate, service: ProductoService = Depends(get_producto_service)):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=solo_admin)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.patch("/{producto_id}/stock", response_model=ProductoRead, dependencies=solo_admin)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    service: ProductoService = Depends(get_producto_service),
):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=solo_admin)
def eliminar_producto(producto_id: int, service: ProductoService = Depends(get_producto_service)):
    """Baja lógica (activo = false)."""
    try:
        service.eliminar(producto_id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(e)) from e
    return Response(status_code=status.HTTP_204_NO_CONTENT)
