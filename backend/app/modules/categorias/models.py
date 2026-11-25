from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    """UML: Categoria. Baja lógica con activo = False.

    La baja no libera el nombre único ni oculta sus productos.
    """

    __tablename__ = "categoria"

    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, max_length=100)
    descripcion: str | None = Field(default=None)
    activo: bool = Field(default=True)

    # Categoria 1:N Producto
    productos: list["Producto"] = Relationship(back_populates="categoria")
