import { Router } from "express";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware.js";
import { getReportePlatillos, getVentasDiarias, getRendimientoMozos } from "../controllers/reportesController.js";

const router = Router();

// Todas las rutas de reportes requieren autenticación y rol de admin
router.use(authMiddleware, checkRole("admin"));

// GET /api/reportes/platillos-mas-vendidos
// GET /api/reportes/platillos-mas-vendidos
router.get("/platillos-mas-vendidos", getReportePlatillos);

// GET /api/reportes/ventas-diarias
router.get("/ventas-diarias", getVentasDiarias);

// GET /api/reportes/rendimiento-mozos
router.get("/rendimiento-mozos", getRendimientoMozos);

// GET /api/reportes/stats
import { getSystemStats } from "../controllers/reportesController.js";
router.get("/stats", getSystemStats);

export default router;
