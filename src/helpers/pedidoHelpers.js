/**
 * Helpers para validaciones y reglas de negocio de pedidos
 */

import { ESTADOS_PEDIDO, esTransicionValida } from '../constants/estadosPedido.js';
import { validarCamposPorTipo } from '../constants/tiposPedido.js';
import { MENSAJES_ERROR } from '../constants/appConfig.js';
import { getPedidoById } from '../models/pedido.js';
import { getPlatilloById } from '../models/platillo.js';

/**
 * Valida que el pedido pertenezca al usuario autenticado
 * @param {number} pedidoId - ID del pedido
 * @param {number} usuarioId - ID del usuario autenticado
 * @param {string} rol - Rol del usuario
 * @returns {Promise<object>} - { valido: boolean, pedido?: object, error?: string }
 */
export const validarOwnershipPedido = async (pedidoId, usuarioId, rol) => {
  try {
    const pedido = await getPedidoById(pedidoId);

    if (!pedido) {
      return {
        valido: false,
        error: MENSAJES_ERROR.PEDIDO_NO_ENCONTRADO,
        statusCode: 404
      };
    }

    // Admin y Cocina pueden acceder a todos los pedidos
    if (rol === 'admin' || rol === 'cocina' || rol === 'cocinero') {
      return { valido: true, pedido };
    }

    // Mesero solo puede acceder a sus propios pedidos
    if (pedido.usuario_id !== usuarioId) {
      return {
        valido: false,
        error: MENSAJES_ERROR.NO_AUTORIZADO,
        statusCode: 403
      };
    }

    return { valido: true, pedido };
  } catch (error) {
    return {
      valido: false,
      error: MENSAJES_ERROR.ERROR_SERVIDOR,
      statusCode: 500
    };
  }
};

/**
 * Valida que un pedido pueda ser modificado según su estado
 * @param {object} pedido - Objeto pedido
 * @returns {object} - { valido: boolean, error?: string }
 */
export const validarPedidoModificable = (pedido) => {
  const estadosNoModificables = [
    ESTADOS_PEDIDO.ENTREGADO,
    ESTADOS_PEDIDO.CANCELADO
  ];

  if (estadosNoModificables.includes(pedido.estado)) {
    return {
      valido: false,
      error: MENSAJES_ERROR.PEDIDO_NO_MODIFICABLE,
      statusCode: 400
    };
  }

  return { valido: true };
};

/**
 * Valida campos requeridos según tipo de pedido
 * @param {string} tipo - Tipo de pedido
 * @param {object} data - Datos del pedido
 * @returns {object} - { valido: boolean, errores?: string[] }
 */


/**
 * Valida campos requeridos según tipo de pedido
 * @param {string} tipo - Tipo de pedido
 * @param {object} data - Datos del pedido
 * @returns {object} - { valido: boolean, errores?: string[] }
 */
export const validarCamposPedido = (tipo, data) => {
  return validarCamposPorTipo(tipo, data);
};

/**
 * Valida que la transición de estado sea válida
 * @param {string} estadoActual - Estado actual del pedido
 * @param {string} nuevoEstado - Nuevo estado deseado
 * @returns {object} - { valido: boolean, error?: string }
 */
export const validarTransicionEstado = (estadoActual, nuevoEstado) => {
  if (!esTransicionValida(estadoActual, nuevoEstado)) {
    return {
      valido: false,
      error: MENSAJES_ERROR.TRANSICION_INVALIDA,
      statusCode: 400
    };
  }

  return { valido: true };
};

/**
 * Valida que los platillos existan en una sola query (más eficiente)
 * @param {array} detalles - Array de detalles con platillo_id
 * @returns {Promise<object>} - { valido: boolean, platillosMap?: Map, error?: string }
 */
export const validarPlatillosOptimizado = async (detalles, db) => {
  try {
    const platilloIds = detalles.map(d => d.platillo_id);

    const [platillos] = await db.promise().query(
      'SELECT * FROM platillos WHERE id IN (?)',
      [platilloIds]
    );

    // Crear un mapa para acceso rápido
    const platillosMap = new Map();
    platillos.forEach(p => platillosMap.set(p.id, p));

    // Validar que todos los platillos existan
    for (const item of detalles) {
      const platillo = platillosMap.get(item.platillo_id);

      if (!platillo) {
        return {
          valido: false,
          error: `${MENSAJES_ERROR.PLATILLO_NO_ENCONTRADO} (ID: ${item.platillo_id})`,
          statusCode: 404
        };
      }

      if (!platillo.activo) {
        return {
          valido: false,
          error: `${MENSAJES_ERROR.PLATILLO_INACTIVO} (${platillo.nombre})`,
          statusCode: 400
        };
      }
    }

    return { valido: true, platillosMap };
  } catch (error) {
    return {
      valido: false,
      error: MENSAJES_ERROR.ERROR_SERVIDOR,
      statusCode: 500
    };
  }
};

/**
 * Valida que una mesa exista
 * @param {number} mesaId - ID de la mesa
 * @param {object} db - Conexión a la base de datos
 * @returns {Promise<object>} - { valido: boolean, error?: string }
 */
export const validarMesa = async (mesaId, db) => {
  try {
    const [mesas] = await db.promise().query(
      'SELECT id FROM mesas WHERE id = ?',
      [mesaId]
    );

    if (mesas.length === 0) {
      return {
        valido: false,
        error: MENSAJES_ERROR.MESA_NO_ENCONTRADA,
        statusCode: 404
      };
    }

    return { valido: true };
  } catch (error) {
    return {
      valido: false,
      error: MENSAJES_ERROR.ERROR_SERVIDOR,
      statusCode: 500
    };
  }
};

/**
 * Valida que un cliente exista
 * @param {number} clienteId - ID del cliente
 * @param {object} db - Conexión a la base de datos
 * @returns {Promise<object>} - { valido: boolean, error?: string }
 */
export const validarCliente = async (clienteId, db) => {
  try {
    const [clientes] = await db.promise().query(
      'SELECT id FROM clientes WHERE id = ?',
      [clienteId]
    );

    if (clientes.length === 0) {
      return {
        valido: false,
        error: MENSAJES_ERROR.CLIENTE_NO_ENCONTRADO,
        statusCode: 404
      };
    }

    return { valido: true };
  } catch (error) {
    return {
      valido: false,
      error: MENSAJES_ERROR.ERROR_SERVIDOR,
      statusCode: 500
    };
  }
};
