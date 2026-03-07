import { Router } from "express";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validatorMiddleware.js";
import {
  listarPedidos,
  obtenerPedido,
  crearPedido,
  actualizarEstado,

  eliminarPedido,
  toggleDetalle
} from "../controllers/pedidosController.js";
import { createPedidoSchema, updateEstadoPedidoSchema } from "../validators/pedidoValidator.js";

const router = Router();

// Todas las rutas están protegidas por authMiddleware
router.use(authMiddleware);

// Rutas
router.get("/", listarPedidos);
router.get("/:id", obtenerPedido);
router.post("/", checkRole("admin", "mesero"), validate(createPedidoSchema), crearPedido);
router.patch("/:id/estado", checkRole("admin", "cocina", "mesero"), validate(updateEstadoPedidoSchema), actualizarEstado);
router.delete("/:id", checkRole("admin"), eliminarPedido);
router.patch("/detalle/:id/toggle", checkRole("admin", "cocina", "cocinero"), toggleDetalle);

export default router;
