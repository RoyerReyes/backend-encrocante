import Joi from 'joi';

export const updateUserSchema = Joi.object({
  nombre: Joi.string().min(3).max(100),
  usuario: Joi.string().min(3).max(50),
  rol: Joi.string().valid('admin', 'mesero')
});
