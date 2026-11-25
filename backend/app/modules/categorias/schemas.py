from pydantic import field_validator
from sqlmodel import Field, SQLModel


def _limpiar_nombre(valor: str | None) -> str | None:
    if valor is None:
        return None
    valor = valor.strip()
    if not 2 <= len(valor) <= 100:
        raise ValueError("El nombre debe tener entre 2 y 100 caracteres")
    return valor


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor: str) -> str:
        return _limpiar_nombre(valor) or valor


class CategoriaUpdate(SQLModel):
    """Actualización parcial: solo se modifican los campos enviados."""

    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, valor: str | None) -> str | None:
        return _limpiar_nombre(valor)


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str | None
    activo: bool
