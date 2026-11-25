from datetime import datetime
from typing import Literal

from pydantic import field_validator
from sqlmodel import Field, SQLModel

EstadoPedido = Literal["PENDIENTE", "EN_PREPARACION", "ENTREGADO", "CANCELADO"]
FormaPago = Literal["EFECTIVO", "TRANSFERENCIA"]


# --- Entrada ---

class ItemPedidoCreate(SQLModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    """Pedido armado desde el carrito. El usuario sale de la sesión, no del cuerpo."""

    items: list[ItemPedidoCreate] = Field(min_length=1)
    forma_pago: FormaPago                                         # RN-06
    direccion_entrega: str = Field(min_length=5, max_length=200)  # RN-06
    notas: str | None = Field(default=None, max_length=500)

    @field_validator("direccion_entrega")
    @classmethod
    def validar_direccion(cls, valor: str) -> str:
        valor = valor.strip()
        if not 5 <= len(valor) <= 200:
            raise ValueError("La dirección debe tener entre 5 y 200 caracteres")
        return valor

    @field_validator("notas")
    @classmethod
    def notas_vacias_son_nulas(cls, valor: str | None) -> str | None:
        return (valor or "").strip() or None


class CambioEstado(SQLModel):
    estado: EstadoPedido


# --- Salida ---

class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class UsuarioDelPedido(SQLModel):
    """Datos mínimos del cliente, para el panel de administración."""

    id: int
    username: str
    full_name: str


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: str
    forma_pago: str
    direccion_entrega: str
    notas: str | None
    total: float
    created_at: datetime
    updated_at: datetime
    items: list[DetallePedidoRead]
    usuario: UsuarioDelPedido


class PedidosPaginados(SQLModel):
    total: int
    items: list[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float
