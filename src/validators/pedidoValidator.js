import Joi from 'joi';

export const createPedidoSchema = Joi.object({
  mesa_id: Joi.number().integer().positive().allow(null),
  cliente_id: Joi.number().integer().positive().allow(null),
  tipo: Joi.string().valid('mesa', 'delivery', 'recojo').required(),
  observaciones: Joi.string().allow(null, ''),
  detalles: Joi.array().items(Joi.object({
    platillo_id: Joi.number().integer().positive().required(),
    cantidad: Joi.number().integer().positive().required(),
    nota: Joi.string().allow(null, '') // Campo opcional para notas por platillo
  })).min(1).required()
});

export const updateEstadoPedidoSchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'en cocina', 'servido', 'pagado', 'cancelado').required()
});
