import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { 
  listarDetalles, 
  agregarDetalle, 
  eliminarDetalle, 
  actualizarDetalle 
} from "../controllers/detallePedidoController.js";
import { validate } from "../middlewares/validatorMiddleware.js";
import { 
  createDetalleSchema, 
  updateDetalleSchema 
} from "../validators/detallePedidoValidator.js";

const router = Router();

// Mesero o admin puede ver y agregar detalles
router.get("/:pedido_id", authMiddleware, listarDetalles);
router.post("/:pedido_id", authMiddleware, validate(createDetalleSchema), agregarDetalle);

// Solo admin puede actualizar o eliminar
router.put("/:id", authMiddleware, validate(updateDetalleSchema), actualizarDetalle);
router.delete("/:id", authMiddleware, eliminarDetalle);

export default router;
