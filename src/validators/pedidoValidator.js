import Joi from 'joi';
import { ESTADOS_ARRAY } from '../constants/estadosPedido.js';
import { TIPOS_ARRAY } from '../constants/tiposPedido.js';
import { LIMITES } from '../constants/appConfig.js';

export const createPedidoSchema = Joi.object({
  mesa_id: Joi.number().integer().positive().allow(null),
  numero_mesa: Joi.alternatives().try(Joi.string(), Joi.number()).allow(null, ''), // Permitir string o numero
  cliente_id: Joi.number().integer().positive().allow(null),
  nombre_cliente: Joi.string().max(100).allow(null, ''),
  tipo: Joi.string().valid(...TIPOS_ARRAY).required(),
  observaciones: Joi.string().max(LIMITES.MAX_LENGTH_OBSERVACIONES).allow(null, ''),
  detalles: Joi.array().items(Joi.object({
    platillo_id: Joi.number().integer().positive().required(),
    cantidad: Joi.number().integer().positive().max(LIMITES.MAX_CANTIDAD_ITEM).required(),
    nota: Joi.string().max(LIMITES.MAX_LENGTH_NOTA).allow(null, '')
  })).min(1).required()
});

export const updateEstadoPedidoSchema = Joi.object({
  estado: Joi.string().valid(...ESTADOS_ARRAY).required(),
  metodo_pago: Joi.string().allow(null, '').optional(),
  monto_recibido: Joi.number().positive().allow(null).optional(),
  vuelto: Joi.number().allow(null).optional(),
  descuento: Joi.number().min(0).allow(null).optional(),
  puntos_canjeados: Joi.number().integer().min(0).allow(null).optional()
});
