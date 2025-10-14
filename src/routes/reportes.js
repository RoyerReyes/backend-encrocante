import { Router } from "express";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware.js";
import { getReportePlatillos } from "../controllers/reportesController.js";

const router = Router();

// Todas las rutas de reportes requieren autenticación y rol de admin
router.use(authMiddleware, checkRole("admin"));

// GET /api/reportes/platillos-mas-vendidos
router.get("/platillos-mas-vendidos", getReportePlatillos);

export default router;
