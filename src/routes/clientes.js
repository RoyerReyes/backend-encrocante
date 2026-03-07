import { Router } from "express";
import { buscarClientes, crearCliente } from "../controllers/clientesController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

// GET /api/clientes?q=...
router.get("/", buscarClientes);

// POST /api/clientes
router.post("/", crearCliente);

export default router;
