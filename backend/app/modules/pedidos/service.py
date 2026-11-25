from datetime import datetime, timezone

from app.modules.pedidos.models import DetallePedido, Pedido, ahora
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.usuarios.schemas import UserPublic

# --- Máquina de estados (RN-02) ---
# Para cada estado, a cuáles se puede pasar. Los terminales no admiten cambios.
TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


# --- Excepciones de dominio (el Router las traduce a códigos HTTP) ---

class PedidoNoEncontrado(Exception):  # 404
    def __init__(self, pedido_id: int) -> None:
        super().__init__(f"Pedido {pedido_id} no encontrado")


class ProductoNoEncontrado(Exception):  # 404
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"Producto {producto_id} no encontrado o dado de baja")


class PedidoAjeno(Exception):  # 403
    def __init__(self) -> None:
        super().__init__("El pedido pertenece a otro usuario")


class ReglaDeNegocio(Exception):  # 400
    """Base de las reglas de negocio que responden 400."""


class ProductoRepetido(ReglaDeNegocio):
    def __init__(self, producto_id: int) -> None:
        super().__init__(f"El producto {producto_id} está repetido en el pedido")


class ProductoNoDisponible(ReglaDeNegocio):
    def __init__(self, nombre: str) -> None:
        super().__init__(f"El producto '{nombre}' no está disponible")


class StockInsuficiente(ReglaDeNegocio):
    def __init__(self, nombre: str, stock: int, pedido: int) -> None:
        super().__init__(f"Stock insuficiente para '{nombre}': hay {stock} y se pidieron {pedido}")


class TransicionInvalida(ReglaDeNegocio):
    def __init__(self, desde: str, hacia: str) -> None:
        super().__init__(f"No se puede pasar un pedido de {desde} a {hacia}")


class PedidoNoCancelable(ReglaDeNegocio):
    def __init__(self, estado: str) -> None:
        super().__init__(f"Solo se pueden cancelar pedidos en PENDIENTE (este está en {estado})")


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # --- helpers ---

    @staticmethod
    def _obtener(uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado(pedido_id)
        return pedido

    @staticmethod
    def _restituir_stock(uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        """RN-03: devuelve al stock la cantidad de cada línea (misma transacción)."""
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    @staticmethod
    def _validar_transicion(actual: str, nuevo: str) -> None:
        """RN-02: solo las transiciones del mapa; un estado terminal no admite cambios."""
        if nuevo not in TRANSICIONES.get(actual, set()):
            raise TransicionInvalida(actual, nuevo)

    # --- casos de uso ---

    def crear(self, datos: PedidoCreate, usuario: UserPublic) -> PedidoRead:
        """RN-01. Todo dentro de un único Unit of Work: si una validación falla, la
        excepción sale del `with`, se hace rollback y no se persiste nada (tampoco el
        descuento de stock de los ítems ya procesados)."""
        with self.uow as uow:
            # Ningún producto repetido entre los ítems
            vistos: set[int] = set()
            for item in datos.items:
                if item.producto_id in vistos:
                    raise ProductoRepetido(item.producto_id)
                vistos.add(item.producto_id)

            # El pedido nace en PENDIENTE con total 0
            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado="PENDIENTE",
                    forma_pago=datos.forma_pago,
                    direccion_entrega=datos.direccion_entrega,
                    notas=datos.notas,
                    total=0,
                )
            )
            assert pedido.id is not None

            total = 0.0
            for item in datos.items:
                # En la misma iteración: validar, descontar stock y crear la línea
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(item.producto_id)
                if not producto.disponible:
                    raise ProductoNoDisponible(producto.nombre)
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(producto.nombre, producto.stock, item.cantidad)

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.detalles.add(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,  # type: ignore[arg-type]
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,         # copia (RN-05)
                        precio_unitario=producto.precio_base,    # copia (RN-05)
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            pedido = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(
        self, usuario: UserPublic, *, skip: int, limit: int, estado: str | None
    ) -> PedidosPaginados:
        """RN-04: el cliente ve solo sus pedidos; el admin, todos."""
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            total, pedidos = uow.pedidos.list_by_usuario(usuario_id, estado=estado, skip=skip, limit=limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        """Admin: avanza o cancela según la máquina de estados. Cancelar restituye el stock."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            self._validar_transicion(pedido.estado, nuevo_estado)
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            pedido.estado = nuevo_estado
            pedido.updated_at = ahora()
            pedido = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def cancelar(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        """RN-03 y RN-04: el dueño cancela su pedido solo si está en PENDIENTE."""
        with self.uow as uow:
            pedido = self._obtener(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno()
            if pedido.estado != "PENDIENTE":
                raise PedidoNoCancelable(pedido.estado)
            self._restituir_stock(uow, pedido)
            pedido.estado = "CANCELADO"
            pedido.updated_at = ahora()
            pedido = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            por_estado = uow.pedidos.count_by_estado()
            # "Hoy" según la zona horaria del servidor
            inicio_hoy = datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos(
                pendientes=por_estado.get("PENDIENTE", 0),
                en_preparacion=por_estado.get("EN_PREPARACION", 0),
                entregados=por_estado.get("ENTREGADO", 0),
                cancelados=por_estado.get("CANCELADO", 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy.astimezone(timezone.utc)),
                ingresos_entregados=round(uow.pedidos.sum_total_by_estado("ENTREGADO"), 2),
            )


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())
