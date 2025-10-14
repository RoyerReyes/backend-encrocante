import { Router } from "express";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validatorMiddleware.js";
import {
  listarPedidos,
  crearPedido,
  actualizarEstado,
  eliminarPedido
} from "../controllers/pedidosController.js";
import { createPedidoSchema, updateEstadoPedidoSchema } from "../validators/pedidoValidator.js";

const router = Router();

// Todas las rutas están protegidas por authMiddleware
router.use(authMiddleware);

// Rutas
router.get("/", listarPedidos);
router.post("/", checkRole("admin", "mesero"), validate(createPedidoSchema), crearPedido);
router.patch("/:id/estado", checkRole("admin"), validate(updateEstadoPedidoSchema), actualizarEstado);
router.delete("/:id", checkRole("admin"), eliminarPedido);

export default router;
