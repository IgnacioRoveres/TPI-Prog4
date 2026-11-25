from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
    get_pedido_service,
)
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["pedidos"])


def _traducir(error: Exception) -> HTTPException:
    """Excepción de dominio -> HTTPException con el código de la especificación."""
    if isinstance(error, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status.HTTP_404_NOT_FOUND, str(error))
    if isinstance(error, PedidoAjeno):
        return HTTPException(status.HTTP_403_FORBIDDEN, str(error))
    if isinstance(error, ReglaDeNegocio):
        return HTTPException(status.HTTP_400_BAD_REQUEST, str(error))
    raise error


ERRORES = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(
    datos: PedidoCreate,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    """RN-01: crea el pedido desde el carrito en una sola transacción."""
    try:
        return service.crear(datos, usuario)
    except ERRORES as e:
        raise _traducir(e) from e


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: EstadoPedido | None = Query(None),
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    """Propios (user) o todos (admin)."""
    return service.listar(usuario, skip=skip, limit=limit, estado=estado)


# Se declara ANTES de /{pedido_id} para que "resumen" no se tome como un id
@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(
    _: UserPublic = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
):
    return service.resumen()


@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    """Dueño o admin. 403 si el pedido es de otro usuario."""
    try:
        return service.obtener(pedido_id, usuario)
    except ERRORES as e:
        raise _traducir(e) from e


@router.patch("/{pedido_id}/estado", response_model=PedidoRead)
def cambiar_estado(
    pedido_id: int,
    datos: CambioEstado,
    _: UserPublic = Depends(require_role(["admin"])),
    service: PedidoService = Depends(get_pedido_service),
):
    """Admin: avanza o cancela según la máquina de estados (RN-02, RN-03)."""
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except ERRORES as e:
        raise _traducir(e) from e


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: UserPublic = Depends(get_current_active_user),
    service: PedidoService = Depends(get_pedido_service),
):
    """Dueño: cancela su pedido en PENDIENTE y se restituye el stock (RN-03, RN-04)."""
    try:
        return service.cancelar(pedido_id, usuario)
    except ERRORES as e:
        raise _traducir(e) from e
