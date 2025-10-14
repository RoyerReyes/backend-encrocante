import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { listarDetalles, agregarDetalle, eliminarDetalle } from "../controllers/detallePedidoController.js";

const router = Router();

// Mesero o admin puede ver y agregar detalles
router.get("/:pedido_id", authMiddleware, listarDetalles);
router.post("/:pedido_id", authMiddleware, agregarDetalle);

// Solo admin puede eliminar
router.delete("/:id", authMiddleware, eliminarDetalle);

export default router;
