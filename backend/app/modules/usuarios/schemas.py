import re
from datetime import datetime

from pydantic import EmailStr, field_validator
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    """Cuerpo de POST /auth/register. El rol no se recibe: siempre es "user"."""

    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    # Mínimo 8 caracteres. bcrypt solo usa los primeros 72 bytes.
    password: str = Field(min_length=8, max_length=72)

    @field_validator("username")
    @classmethod
    def validar_username(cls, valor: str) -> str:
        valor = valor.strip().lower()
        if not re.fullmatch(r"[a-z0-9._-]{3,50}", valor):
            raise ValueError("Usá entre 3 y 50 letras, números, puntos, guiones o guiones bajos")
        return valor

    @field_validator("email")
    @classmethod
    def normalizar_email(cls, valor: str) -> str:
        return valor.strip().lower()

    @field_validator("full_name")
    @classmethod
    def sin_espacios_extremos(cls, valor: str) -> str:
        valor = valor.strip()
        if len(valor) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return valor


class UserPublic(SQLModel):
    """Datos públicos del usuario. Nunca incluye hashed_password."""

    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
