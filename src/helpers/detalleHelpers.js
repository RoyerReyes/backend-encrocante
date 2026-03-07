/**
 * Helpers para validaciones de detalles de pedido
 */

import { MENSAJES_ERROR } from '../constants/appConfig.js';
import db from '../config/db.js';

/**
 * Valida ownership del detalle a través de su pedido
 * @param {number} detalleId - ID del detalle
 * @param {number} usuarioId - ID del usuario autenticado
 * @param {string} rol - Rol del usuario
 * @returns {Promise<object>} - { valido: boolean, detalle?: object, pedido?: object, error?: string }
 */
export const validarOwnershipDetalle = async (detalleId, usuarioId, rol) => {
  try {
    const [detalles] = await db.promise().query(
      `SELECT dp.*, p.usuario_id, p.estado 
       FROM detalle_pedido dp 
       JOIN pedidos p ON dp.pedido_id = p.id 
       WHERE dp.id = ?`,
      [detalleId]
    );

    if (detalles.length === 0) {
      return {
        valido: false,
        error: MENSAJES_ERROR.DETALLE_NO_ENCONTRADO,
        statusCode: 404
      };
    }

    const detalle = detalles[0];

    // Admin puede acceder a todos los detalles
    if (rol === 'admin') {
      return { valido: true, detalle };
    }

    // Mesero solo puede acceder a detalles de sus propios pedidos
    if (detalle.usuario_id !== usuarioId) {
      return {
        valido: false,
        error: MENSAJES_ERROR.NO_AUTORIZADO,
        statusCode: 403
      };
    }

    return { valido: true, detalle };
  } catch (error) {
    return {
      valido: false,
      error: MENSAJES_ERROR.ERROR_SERVIDOR,
      statusCode: 500
    };
  }
};

/**
 * Valida que no se elimine el último detalle de un pedido
 * @param {number} pedidoId - ID del pedido
 * @returns {Promise<object>} - { valido: boolean, cantidadDetalles?: number, error?: string }
 */
export const validarUltimoDetalle = async (pedidoId) => {
  try {
    const [rows] = await db.promise().query(
      'SELECT COUNT(*) as total FROM detalle_pedido WHERE pedido_id = ?',
      [pedidoId]
    );

    const cantidadDetalles = rows[0].total;

    if (cantidadDetalles <= 1) {
      return {
        valido: false,
        error: MENSAJES_ERROR.SIN_DETALLES,
        statusCode: 400
      };
    }

    return { valido: true, cantidadDetalles };
  } catch (error) {
    return {
      valido: false,
      error: MENSAJES_ERROR.ERROR_SERVIDOR,
      statusCode: 500
    };
  }
};

/**
 * Recalcula y actualiza el total de un pedido
 * @param {number} pedidoId - ID del pedido
 * @param {object} connection - Conexión de base de datos (para transacciones)
 * @returns {Promise<object>} - { exito: boolean, nuevoTotal?: number, error?: string }
 */
export const recalcularTotalPedido = async (pedidoId, connection = null) => {
  try {
    const dbConnection = connection || db;

    const [rows] = await dbConnection.promise().query(
      'SELECT COALESCE(SUM(subtotal), 0) as total FROM detalle_pedido WHERE pedido_id = ?',
      [pedidoId]
    );

    const nuevoTotal = rows[0].total;

    await dbConnection.promise().query(
      'UPDATE pedidos SET total = ? WHERE id = ?',
      [nuevoTotal, pedidoId]
    );

    return { exito: true, nuevoTotal };
  } catch (error) {
    return {
      exito: false,
      error: MENSAJES_ERROR.ERROR_SERVIDOR
    };
  }
};
