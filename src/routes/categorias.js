
import { Router } from "express";
import { listarCategorias } from "../controllers/categoriasController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();

// Listar todas las categorías (protegido, cualquier rol autenticado)
router.get("/", authMiddleware, listarCategorias);

export default router;
