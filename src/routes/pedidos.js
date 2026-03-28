import { Router } from "express";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validatorMiddleware.js";
import {
  listarPedidos,
  obtenerPedido,
  crearPedido,
  actualizarPedido,
  actualizarEstado,
  eliminarPedido,
  toggleDetalle
} from "../controllers/pedidosController.js";
import { createPedidoSchema, updateEstadoPedidoSchema } from "../validators/pedidoValidator.js";

const router = Router();

import db from "../config/db.js";

// === MIGRATION ENDPOINT TEMPORAL ===
router.get("/run-migration", async (req, res) => {
  try {
    const result = await db.promise().query(
      "ALTER TABLE pedidos ADD COLUMN costo_delivery DECIMAL(10,2) DEFAULT 0.00;"
    );
    res.json({ success: true, message: "Migración de costo_delivery ejecutada", result });
  } catch (error) {
    if (error.code === 'ER_DUP_FIELDNAME') {
      res.json({ success: true, message: "La columna ya existe" });
    } else {
      res.status(500).json({ success: false, error: error.message, code: error.code });
    }
  }
});
// ===================================

// Todas las rutas están protegidas por authMiddleware
router.use(authMiddleware);

// Rutas
router.get("/", listarPedidos);
router.get("/:id", obtenerPedido);
router.post("/", checkRole("admin", "mesero"), validate(createPedidoSchema), crearPedido);
router.put("/:id", checkRole("admin", "mesero"), validate(createPedidoSchema), actualizarPedido);
router.patch("/:id/estado", checkRole("admin", "cocina", "mesero"), validate(updateEstadoPedidoSchema), actualizarEstado);
router.delete("/:id", checkRole("admin"), eliminarPedido);
router.patch("/detalle/:id/toggle", checkRole("admin", "cocina", "cocinero"), toggleDetalle);

export default router;
