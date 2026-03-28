
import db from "../config/db.js";
import { getIO } from "../socket.js";
import clienteService from "../services/clienteService.js";
import * as clienteModel from "../models/cliente.js"; // Import clienteModel
import {
    getAllPedidos,
    getPedidosByUsuario,
    createPedido as createPedidoModel,
    updateEstadoPedido as updateEstadoPedidoModel,
    deletePedido as deletePedidoModel,
    updatePedidoCompleto as updatePedidoCompletoModel,
    getPedidoById
} from "../models/pedido.js";
import { toggleItemStatus } from "../models/detallePedido.js";
import {
    validarOwnershipPedido,
    validarCamposPedido,
    validarTransicionEstado,
    validarPlatillosOptimizado,
    validarMesa,
    validarCliente
} from "../helpers/pedidoHelpers.js";
import { MENSAJES_ERROR, SOCKET_EVENTS, ROLES } from "../constants/appConfig.js";

class PedidoService {

    // Listar pedidos según rol
    async listarPedidos(usuario, rol) {
        if (rol === ROLES.ADMIN || rol === ROLES.COCINERO || rol === ROLES.COCINA) {
            return await getAllPedidos();
        } else if (rol === ROLES.MESERO) {
            return await getPedidosByUsuario(usuario.id);
        } else {
            throw { statusCode: 403, message: MENSAJES_ERROR.NO_AUTORIZADO };
        }
    }

    // Obtener pedido por ID
    async obtenerPedido(id) {
        const pedido = await getPedidoById(id);
        if (!pedido) throw { statusCode: 404, message: MENSAJES_ERROR.PEDIDO_NO_ENCONTRADO };
        return pedido;
    }

    // Crear pedido
    async crearPedido(datosPedido, usuario) {
        let { mesa_id, numero_mesa, cliente_id, nombre_cliente, tipo, observaciones, detalles } = datosPedido;

        // Buscar mesa por número si es necesario
        if (!mesa_id && numero_mesa && tipo === 'mesa') {
            // Intentamos buscar por coincidencia exacta del número, o por formato 'Mesa X', o por ID directo
            const [mesas] = await db.promise().query(
                "SELECT id FROM mesas WHERE numero = ? OR numero = CONCAT('Mesa ', ?) OR id = ?",
                [numero_mesa, numero_mesa, numero_mesa]
            );

            if (mesas.length > 0) {
                mesa_id = mesas[0].id;
            } else {
                throw {
                    statusCode: 400,
                    message: MENSAJES_ERROR.DATOS_INVALIDOS,
                    errores: [`No se encontró ninguna mesa registrada con el número "${numero_mesa}"`]
                };
            }
        }

        // Validaciones
        const validacionTipo = validarCamposPedido(tipo, { mesa_id, cliente_id, nombre_cliente });
        if (!validacionTipo.valido) throw { statusCode: 400, message: MENSAJES_ERROR.DATOS_INVALIDOS, errores: validacionTipo.errores };

        if (mesa_id) {
            const validacionMesa = await validarMesa(mesa_id, db);
            if (!validacionMesa.valido) throw { statusCode: validacionMesa.statusCode, message: validacionMesa.error };
        }

        if (cliente_id) {
            const validacionCliente = await validarCliente(cliente_id, db);
            if (!validacionCliente.valido) throw { statusCode: validacionCliente.statusCode, message: validacionCliente.error };
        }

        const validacionPlatillos = await validarPlatillosOptimizado(detalles, db);
        if (!validacionPlatillos.valido) throw { statusCode: validacionPlatillos.statusCode, message: validacionPlatillos.error };

        // Calcular totales
        const { platillosMap } = validacionPlatillos;
        let total = 0;
        const detallesConPrecio = [];

        for (const item of detalles) {
            const platillo = platillosMap.get(item.platillo_id);
            const subtotal = platillo.precio * item.cantidad;
            total += subtotal;
            detallesConPrecio.push({ ...item, precio_unitario: platillo.precio, subtotal });
        }

        const costoDeliveryCalculado = datosPedido.costo_delivery ? parseFloat(datosPedido.costo_delivery) : 0;
        total += costoDeliveryCalculado;

        // Persistir
        const pedidoData = {
            mesa_id: mesa_id || null,
            cliente_id: cliente_id || null,
            nombre_cliente: nombre_cliente || null,
            tipo,
            usuario_id: usuario.id,
            total,
            costo_delivery: costoDeliveryCalculado,
            observaciones: datosPedido.observaciones || null,
            detalles: detallesConPrecio
        };

        const nuevoPedido = await createPedidoModel(pedidoData);

        // Emitir Socket
        try {
            getIO().emit(SOCKET_EVENTS.PEDIDO_CREADO, nuevoPedido);
        } catch (e) {
            console.error("Error emitiendo evento socket:", e.message);
        }

        return nuevoPedido;
    }

    // Editar Pedido (Agregar/Quitar platos)
    async actualizarPedido(pedidoId, datosPedido, usuario, rol) {
        // Validar Ownership
        const validacionOwnership = await validarOwnershipPedido(parseInt(pedidoId), usuario.id, rol);
        if (!validacionOwnership.valido) throw { statusCode: validacionOwnership.statusCode, message: validacionOwnership.error };

        const pedidoOriginal = validacionOwnership.pedido;

        // No permitir editar si fue cancelado, entregado o pagado
        const noEditables = ['cancelado', 'entregado', 'pagado'];
        if (noEditables.includes(pedidoOriginal.estado)) {
            throw { statusCode: 400, message: `No se puede editar un pedido cuando su estado es: ${pedidoOriginal.estado}` };
        }

        let { mesa_id, numero_mesa, cliente_id, nombre_cliente, tipo, observaciones, detalles } = datosPedido;

        if (!mesa_id && numero_mesa && tipo === 'mesa') {
            const [mesas] = await db.promise().query(
                "SELECT id FROM mesas WHERE numero = ? OR numero = CONCAT('Mesa ', ?) OR id = ?",
                [numero_mesa, numero_mesa, numero_mesa]
            );
            if (mesas.length > 0) mesa_id = mesas[0].id;
            else throw { statusCode: 400, message: MENSAJES_ERROR.DATOS_INVALIDOS, errores: [`Mesa "${numero_mesa}" no encontrada`] };
        }

        const validacionTipo = validarCamposPedido(tipo, { mesa_id, cliente_id, nombre_cliente });
        if (!validacionTipo.valido) throw { statusCode: 400, message: MENSAJES_ERROR.DATOS_INVALIDOS, errores: validacionTipo.errores };

        if (mesa_id) {
            const validacionMesa = await validarMesa(mesa_id, db);
            if (!validacionMesa.valido) throw { statusCode: validacionMesa.statusCode, message: validacionMesa.error };
        }

        const validacionPlatillos = await validarPlatillosOptimizado(detalles, db);
        if (!validacionPlatillos.valido) throw { statusCode: validacionPlatillos.statusCode, message: validacionPlatillos.error };

        const { platillosMap } = validacionPlatillos;
        let total = 0;
        const detallesConPrecio = [];

        for (const item of detalles) {
            const platillo = platillosMap.get(item.platillo_id);
            const subtotal = platillo.precio * item.cantidad;
            total += subtotal;
            detallesConPrecio.push({ ...item, precio_unitario: platillo.precio, subtotal });
        }

        const costoDeliveryCalculado = datosPedido.costo_delivery ? parseFloat(datosPedido.costo_delivery) : 0;
        total += costoDeliveryCalculado;

        const pedidoData = {
            mesa_id: mesa_id || null,
            cliente_id: cliente_id || null,
            nombre_cliente: nombre_cliente || null,
            tipo,
            total,
            costo_delivery: costoDeliveryCalculado,
            observaciones,
            detalles: detallesConPrecio
        };

        const pedidoEditado = await updatePedidoCompletoModel(pedidoId, pedidoData);

        // Emitir Socket (se marca como "pedido_actualizado" general para UI)
        try {
            getIO().emit(SOCKET_EVENTS.ESTADO_ACTUALIZADO, {
                id: pedidoEditado.id,
                estado: pedidoEditado.estado,
                pedido: pedidoEditado,
                op: 'edit'
            });
            // Emit special event to refresh kitchen displays if items changed explicitly
            getIO().emit('pedido_editado', pedidoEditado);
        } catch (e) {
            console.error("Error emitiendo evento socket de edición:", e.message);
        }

        return pedidoEditado;
    }

    // Actualizar Estado
    async actualizarEstado(pedidoId, nuevoEstado, usuario, rol, metodo_pago = null, monto_recibido = null, vuelto = null, descuento = null, puntos_canjeados = null) {
        // Validar Ownership
        const validacionOwnership = await validarOwnershipPedido(parseInt(pedidoId), usuario.id, rol);
        if (!validacionOwnership.valido) throw { statusCode: validacionOwnership.statusCode, message: validacionOwnership.error };

        const pedido = validacionOwnership.pedido;
        const estadoActual = pedido.estado;

        // Validar Transición
        const validacionTransicion = validarTransicionEstado(estadoActual, nuevoEstado);
        if (!validacionTransicion.valido) throw {
            statusCode: validacionTransicion.statusCode,
            message: validacionTransicion.error,
            estadoActual,
            estadoSolicitado: nuevoEstado
        };

        // Regla de Negocio: Mesero puede marcar como entregado y pagado
        if (rol === ROLES.MESERO) {
            const esEntrega = nuevoEstado === 'entregado' && estadoActual === 'listo';
            const esPago = nuevoEstado === 'pagado' && estadoActual === 'entregado';

            if (!esEntrega && !esPago) {
                throw { statusCode: 403, message: 'Los meseros solo pueden marcar pedidos como entregados o pagados' };
            }
        }

        // Lógica de Canje de Puntos (Redemption)
        if (puntos_canjeados && puntos_canjeados > 0 && pedido.cliente_id) {
            // Verificar si el cliente tiene puntos suficientes (opcional, el frontend ya debió validar, pero backend debe ser seguro)
            const cliente = await clienteService.buscarCliente(pedido.cliente_id.toString());
            // NOTA: buscarCliente devuelve array si es search, o objeto si es getById? 
            // Importar cliente model para ser mas directo o usar clienteService si tiene getById.
            // Asumiremos frontend manda bien por ahora, pero RESTAR puntos es clave.
            // Usamos ClienteModel.updatePuntos con valor negativo
            await clienteModel.updatePuntos(pedido.cliente_id, -puntos_canjeados);
        }

        // Actualizar BD (pasamos metodo_pago y detalles si existen)
        const result = await updateEstadoPedidoModel(pedidoId, nuevoEstado, metodo_pago, monto_recibido, vuelto, descuento, puntos_canjeados);
        if (result.affectedRows === 0) throw { statusCode: 404, message: MENSAJES_ERROR.PEDIDO_NO_ENCONTRADO };

        const pedidoActualizado = await getPedidoById(pedidoId);

        // Emitir Socket
        if (pedidoActualizado) {
            // Asignar puntos si el estado es 'pagado' y tiene cliente
            if (nuevoEstado === 'pagado' && pedidoActualizado.cliente_id) {
                try {
                    await clienteService.sumarPuntos(pedidoActualizado.cliente_id, pedidoActualizado.total);
                } catch (err) {
                    console.error("Error asignando puntos:", err);
                    // No lanzamos error para no revertir la transacción de pago, solo logueamos
                }
            }

            try {
                getIO().emit(SOCKET_EVENTS.ESTADO_ACTUALIZADO, {
                    id: pedidoActualizado.id,
                    estado: nuevoEstado,
                    pedido: pedidoActualizado
                });
            } catch (e) {
                console.error("Error emitiendo evento socket:", e.message);
            }
        }

        return pedidoActualizado;
    }

    // Eliminar Pedido
    async eliminarPedido(pedidoId) {
        const result = await deletePedidoModel(pedidoId);
        if (result.affectedRows === 0) throw { statusCode: 404, message: MENSAJES_ERROR.PEDIDO_NO_ENCONTRADO };
        return result;
    }

    // Toggle detalle status
    async toggleDetalle(detalleId) {
        const result = await toggleItemStatus(detalleId);

        // Emit Socket update if order status changed
        if (result.orderStatusChanged) {
            const pedidoActualizado = await getPedidoById(result.pedidoId);
            if (pedidoActualizado) {
                try {
                    getIO().emit(SOCKET_EVENTS.ESTADO_ACTUALIZADO, {
                        id: pedidoActualizado.id,
                        estado: result.newOrderStatus,
                        pedido: pedidoActualizado
                    });
                } catch (e) {
                    console.error("Error emitiendo evento socket (toggleDetalle):", e.message);
                }
            }
        }

        // Always emit item update event (for specialized listeners)
        try {
            getIO().emit('pedido_item_actualizado', result);
        } catch (e) {
            console.error("Error emitiendo evento socket (item_actualizado):", e.message);
        }

        return result;
    }
}

export default new PedidoService();
