from datetime import datetime, timezone

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def ahora() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    """UML: Pedido. Nace en PENDIENTE. No se borra: se cancela.

    total = suma de los subtotales de sus líneas; fijo desde la creación (RN-05).
    """

    __tablename__ = "pedido"

    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = Field(default="PENDIENTE", index=True, max_length=20)
    forma_pago: str = Field(max_length=20)
    direccion_entrega: str = Field(max_length=200)
    notas: str | None = Field(default=None)
    total: float = Field(default=0)
    created_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=ahora, sa_type=DateTime(timezone=True))

    # Usuario 1:N Pedido
    usuario: Usuario = Relationship(back_populates="pedidos")
    # Pedido 1:N DetallePedido (composición)
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """UML: DetallePedido. Línea inmutable (RN-05) con copia del nombre y del precio."""

    __tablename__ = "detalle_pedido"

    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int
    nombre_producto: str = Field(max_length=150)
    precio_unitario: float
    subtotal: float

    # Pedido 1:N DetallePedido
    pedido: Pedido = Relationship(back_populates="items")
    # Producto 1:N DetallePedido
    producto: Producto = Relationship(back_populates="detalles")
