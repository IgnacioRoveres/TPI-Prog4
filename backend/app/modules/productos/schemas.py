from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaRead


def _limpiar_nombre(valor: str | None) -> str | None:
    if valor is None:
        return None
    valor = valor.strip()
    if not valor:
        raise ValueError("El nombre es obligatorio")
    return valor


def _url_o_nulo(valor: str | None) -> str | None:
    if valor is None:
        return None
    valor = valor.strip()
    return valor or None


class ProductoCreate(SQLModel):
    categoria_id: int
    nombre: str = Field(min_length=1, max_length=150)
    descripcion: str | None = Field(default=None, max_length=1000)
    precio_base: float = Field(ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int = Field(default=0, ge=0)
    disponible: bool = True

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor: str) -> str:
        return _limpiar_nombre(valor) or valor

    @field_validator("imagen_url")
    @classmethod
    def validar_imagen(cls, valor: str | None) -> str | None:
        return _url_o_nulo(valor)


class ProductoUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    categoria_id: int | None = None
    nombre: str | None = Field(default=None, min_length=1, max_length=150)
    descripcion: str | None = Field(default=None, max_length=1000)
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = Field(default=None, max_length=500)
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor: str | None) -> str | None:
        return _limpiar_nombre(valor)

    @field_validator("imagen_url")
    @classmethod
    def validar_imagen(cls, valor: str | None) -> str | None:
        return _url_o_nulo(valor)


class ProductoStockUpdate(SQLModel):
    """PATCH /productos/{id}/stock. Se puede enviar uno de los dos campos o ambos."""

    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaRead


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
