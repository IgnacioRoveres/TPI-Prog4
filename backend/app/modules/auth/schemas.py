from sqlmodel import SQLModel


class MensajeLogin(SQLModel):
    """Respuesta de POST /auth/token. El token NO va en el cuerpo: viaja en la cookie."""

    message: str


class MensajeLogout(SQLModel):
    message: str
