"""Carga inicial idempotente (se puede ejecutar varias veces sin duplicar datos).

    python -m app.db.seed

Crea el usuario administrador (admin / Admin1234!), categorías y productos con stock.
"""

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.pedidos import models as _pedidos  # noqa: F401  (registra Pedido y DetallePedido)
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario

ADMIN = {
    "username": "admin",
    "password": "Admin1234!",
    "full_name": "Administrador Food Store",
    "email": "admin@foodstore.com",
}

CATEGORIAS = [
    ("Hamburguesas", "Hamburguesas de carne, pollo y veggie con pan de papa"),
    ("Pizzas", "Pizzas a la piedra, enteras"),
    ("Bebidas", "Gaseosas, aguas y cervezas"),
    ("Postres", "Helados y postres caseros"),
    ("Acompañamientos", "Papas, aros de cebolla y ensaladas"),
]

# nombre, descripción, precio, stock, categoría
PRODUCTOS = [
    ("Hamburguesa Clásica", "Medallón de carne, cheddar, lechuga y tomate", 8500, 30, "Hamburguesas"),
    ("Hamburguesa Doble Bacon", "Doble medallón, doble cheddar y panceta crocante", 11200, 25, "Hamburguesas"),
    ("Hamburguesa Veggie", "Medallón de lentejas, rúcula, tomate y alioli", 9000, 15, "Hamburguesas"),
    ("Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas verdes", 12500, 20, "Pizzas"),
    ("Pizza Napolitana", "Muzzarella, tomate en rodajas, ajo y albahaca", 13800, 12, "Pizzas"),
    ("Pizza Fugazzeta", "Rellena de muzzarella con cebolla", 14500, 10, "Pizzas"),
    ("Coca-Cola 500 ml", "Botella individual", 2200, 60, "Bebidas"),
    ("Agua sin gas 500 ml", "Botella individual", 1600, 60, "Bebidas"),
    ("Cerveza artesanal IPA 473 ml", "Lata de cerveza artesanal", 4200, 24, "Bebidas"),
    ("Helado 1/4 kg", "Dos gustos a elección", 4500, 18, "Postres"),
    ("Brownie con helado", "Brownie tibio con una bocha de crema americana", 5200, 14, "Postres"),
    ("Papas fritas", "Porción grande con sal marina", 3800, 40, "Acompañamientos"),
    ("Aros de cebolla", "Rebozados en cerveza, con salsa barbacoa", 4200, 3, "Acompañamientos"),
]


def _cargar_admin(session: Session) -> None:
    admin = session.exec(select(Usuario).where(Usuario.username == ADMIN["username"])).first()
    if admin is None:
        session.add(
            Usuario(
                username=ADMIN["username"],
                full_name=ADMIN["full_name"],
                email=ADMIN["email"],
                hashed_password=hash_password(ADMIN["password"]),
                role="admin",
            )
        )
        print(f"  + usuario admin ({ADMIN['username']} / {ADMIN['password']})")
    else:
        print("  = usuario admin ya existía")


def _cargar_catalogo(session: Session) -> None:
    categorias: dict[str, Categoria] = {}
    nuevas = 0
    for nombre, descripcion in CATEGORIAS:
        categoria = session.exec(
            select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())
        ).first()
        if categoria is None:
            categoria = Categoria(nombre=nombre, descripcion=descripcion)
            session.add(categoria)
            session.flush()
            nuevas += 1
        categorias[nombre] = categoria
    print(f"  + {nuevas} categorías nuevas ({len(CATEGORIAS)} en total)")

    nuevos = 0
    for nombre, descripcion, precio, stock, categoria_nombre in PRODUCTOS:
        existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
        if existe is None:
            session.add(
                Producto(
                    nombre=nombre,
                    descripcion=descripcion,
                    precio_base=precio,
                    stock=stock,
                    categoria_id=categorias[categoria_nombre].id,  # type: ignore[arg-type]
                )
            )
            nuevos += 1
    print(f"  + {nuevos} productos nuevos ({len(PRODUCTOS)} en total)")


def main() -> None:
    create_all_tables()
    with Session(engine) as session:
        _cargar_admin(session)
        _cargar_catalogo(session)
        session.commit()
    print("Seed completo.")


if __name__ == "__main__":
    main()
