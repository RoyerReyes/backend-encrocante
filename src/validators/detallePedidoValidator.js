import Joi from 'joi';
import { LIMITES } from '../constants/appConfig.js';

export const createDetalleSchema = Joi.object({
  platillo_id: Joi.number().integer().positive().required(),
  cantidad: Joi.number().integer().positive().max(LIMITES.MAX_CANTIDAD_ITEM).required(),
  nota: Joi.string().max(LIMITES.MAX_LENGTH_NOTA).allow(null, '')
});

export const updateDetalleSchema = Joi.object({
  cantidad: Joi.number().integer().positive().max(LIMITES.MAX_CANTIDAD_ITEM),
  nota: Joi.string().max(LIMITES.MAX_LENGTH_NOTA).allow(null, '')
}).min(1);
