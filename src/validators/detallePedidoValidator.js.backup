import Joi from 'joi';

export const createDetalleSchema = Joi.object({
  platillo_id: Joi.number().integer().positive().required(),
  cantidad: Joi.number().integer().positive().required(),
  nota: Joi.string().allow(null, '')
});

export const updateDetalleSchema = Joi.object({
  cantidad: Joi.number().integer().positive(),
  nota: Joi.string().allow(null, '')
});
