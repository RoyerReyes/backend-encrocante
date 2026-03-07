import Joi from 'joi';

export const createPlatilloSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  descripcion: Joi.string().allow(null, '').optional(),
  precio: Joi.number().positive().required(),
  imagen_url: Joi.string().uri().allow(null, '').optional(),
  categoria_id: Joi.number().integer().positive().required(),
  activo: Joi.boolean().default(true)
});

export const updatePlatilloSchema = Joi.object({
  nombre: Joi.string().min(3).max(100),
  descripcion: Joi.string().allow(null, '').optional(),
  precio: Joi.number().positive(),
  imagen_url: Joi.string().uri().allow(null, '').optional(),
  categoria_id: Joi.number().integer().positive(),
  activo: Joi.boolean()
}).min(1); // Al menos un campo para actualizar
