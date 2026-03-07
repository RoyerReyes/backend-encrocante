import db from "../config/db.js";
import { getIO } from "../socket.js";
import {
    getDetallesByPedido,
    createDetalle,
    updateDetalle,
    deleteDetalle,
    getDetalleById
} from "../models/detallePedido.js";
import { getPlatilloById } from "../models/platillo.js";
import {
    validarOwnershipPedido,
    validarPedidoModificable
} from "../helpers/pedidoHelpers.js";
import {
    validarOwnershipDetalle,
    validarUltimoDetalle,
    recalcularTotalPedido
} from "../helpers/detalleHelpers.js";
import { MENSAJES_ERROR, SOCKET_EVENTS } from "../constants/appConfig.js";

class DetallePedidoService {

    async listarDetalles(pedidoId, usuarioId, rol) {
        const validacion = await validarOwnershipPedido(parseInt(pedidoId), usuarioId, rol);
        if (!validacion.valido) throw { statusCode: validacion.statusCode, message: validacion.error };

        return await getDetallesByPedido(pedidoId);
    }

    async agregarDetalle(pedidoId, datosDetalle, usuarioId, rol) {
        const { platillo_id, cantidad, nota } = datosDetalle;

        const validacion = await validarOwnershipPedido(parseInt(pedidoId), usuarioId, rol);
        if (!validacion.valido) throw { statusCode: validacion.statusCode, message: validacion.error };

        const validacionMod = validarPedidoModificable(validacion.pedido);
        if (!validacionMod.valido) throw { statusCode: validacionMod.statusCode, message: validacionMod.error };

        const platillo = await getPlatilloById(platillo_id);
        if (!platillo) throw { statusCode: 404, message: MENSAJES_ERROR.PLATILLO_NO_ENCONTRADO };
        if (!platillo.activo) throw { statusCode: 400, message: MENSAJES_ERROR.PLATILLO_INACTIVO };

        const subtotal = platillo.precio * cantidad;
        let connection = null;

        try {
            connection = await db.promise().getConnection();
            await connection.beginTransaction();

            const nuevoDetalle = await createDetalle({ pedido_id: pedidoId, platillo_id, cantidad, precio_unitario: platillo.precio, subtotal, nota });

            const recalculo = await recalcularTotalPedido(pedidoId, connection);
            if (!recalculo.exito) throw new Error(recalculo.error);

            await connection.commit();

            try {
                getIO().emit(SOCKET_EVENTS.DETALLE_ACTUALIZADO, { pedido_id: pedidoId, total: recalculo.nuevoTotal });
            } catch (e) {
                console.error("Error emitiendo socket: ", e.message);
            }

            return { detalle: nuevoDetalle, nuevoTotal: recalculo.nuevoTotal };

        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async actualizarDetalle(detalleId, datosActualizacion, usuarioId, rol) {
        const { cantidad, nota } = datosActualizacion;

        const validacion = await validarOwnershipDetalle(parseInt(detalleId), usuarioId, rol);
        if (!validacion.valido) throw { statusCode: validacion.statusCode, message: validacion.error };

        const { pedido_id, estado } = validacion.detalle;
        if (estado === "entregado" || estado === "cancelado") throw { statusCode: 400, message: MENSAJES_ERROR.PEDIDO_NO_MODIFICABLE };

        let connection = null;
        try {
            connection = await db.promise().getConnection();
            await connection.beginTransaction();

            const data = {};
            if (cantidad !== undefined) data.cantidad = cantidad;
            if (nota !== undefined) data.nota = nota;

            const result = await updateDetalle(detalleId, data);
            if (result.affectedRows === 0) throw { statusCode: 404, message: MENSAJES_ERROR.DETALLE_NO_ENCONTRADO };

            const recalculo = await recalcularTotalPedido(pedido_id, connection);
            if (!recalculo.exito) throw new Error(recalculo.error);

            await connection.commit();

            const detalleActualizado = await getDetalleById(detalleId);

            try {
                getIO().emit(SOCKET_EVENTS.DETALLE_ACTUALIZADO, { pedido_id, detalle: detalleActualizado, total: recalculo.nuevoTotal });
            } catch (e) {
                console.error("Error emitiendo socket: ", e.message);
            }

            return { detalle: detalleActualizado, nuevoTotal: recalculo.nuevoTotal };

        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }

    async eliminarDetalle(detalleId, usuarioId, rol) {
        const validacion = await validarOwnershipDetalle(parseInt(detalleId), usuarioId, rol);
        if (!validacion.valido) throw { statusCode: validacion.statusCode, message: validacion.error };

        const { pedido_id, estado } = validacion.detalle;
        if (estado === "entregado" || estado === "cancelado") throw { statusCode: 400, message: MENSAJES_ERROR.PEDIDO_NO_MODIFICABLE };

        const validacionUltimo = await validarUltimoDetalle(pedido_id);
        if (!validacionUltimo.valido) throw { statusCode: validacionUltimo.statusCode, message: validacionUltimo.error };

        let connection = null;
        try {
            connection = await db.promise().getConnection();
            await connection.beginTransaction();

            const result = await deleteDetalle(detalleId);
            if (result.affectedRows === 0) throw { statusCode: 404, message: MENSAJES_ERROR.DETALLE_NO_ENCONTRADO };

            const recalculo = await recalcularTotalPedido(pedido_id, connection);
            if (!recalculo.exito) throw new Error(recalculo.error);

            await connection.commit();

            try {
                getIO().emit(SOCKET_EVENTS.DETALLE_ACTUALIZADO, { pedido_id, detalle_eliminado: detalleId, total: recalculo.nuevoTotal });
            } catch (e) {
                console.error("Error emitiendo socket: ", e.message);
            }

            return { nuevoTotal: recalculo.nuevoTotal };

        } catch (error) {
            if (connection) await connection.rollback();
            throw error;
        } finally {
            if (connection) connection.release();
        }
    }
}

export default new DetallePedidoService();
