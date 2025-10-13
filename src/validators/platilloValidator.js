import Joi from 'joi';

export const createPlatilloSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  precio: Joi.number().positive().required(),
  categoria_id: Joi.number().integer().positive().required(),
  activo: Joi.boolean().default(true)
});

export const updatePlatilloSchema = Joi.object({
  nombre: Joi.string().min(3).max(100),
  precio: Joi.number().positive(),
  categoria_id: Joi.number().integer().positive(),
  activo: Joi.boolean()
}).min(1); // Al menos un campo para actualizar
