import Joi from 'joi';

export const registerSchema = Joi.object({
  nombre: Joi.string().min(3).max(100).required(),
  usuario: Joi.string().min(3).max(50).required(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid('admin', 'mesero').required()
});

export const loginSchema = Joi.object({
  usuario: Joi.string().required(),
  password: Joi.string().required()
});
