import Joi from 'joi';

export const createPedidoSchema = Joi.object({
  mesa_id: Joi.number().integer().positive().allow(null),
  cliente_id: Joi.number().integer().positive().allow(null),
  tipo: Joi.string().valid('mesa', 'delivery', 'recojo').required(),
  total: Joi.number().positive().required(),
  observaciones: Joi.string().allow(null, '')
});

export const updateEstadoPedidoSchema = Joi.object({
  estado: Joi.string().valid('pendiente', 'en cocina', 'servido', 'pagado', 'cancelado').required()
});
