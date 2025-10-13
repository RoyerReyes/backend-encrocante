import { Router } from "express";
import { 
  listarPlatillos, 
  obtenerPlatillo, 
  crearPlatillo, 
  actualizarPlatillo, 
  eliminarPlatillo 
} from "../controllers/platillosController.js";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validatorMiddleware.js";
import { createPlatilloSchema, updatePlatilloSchema } from "../validators/platilloValidator.js";

const router = Router();

// 🔹 Meseros y admins pueden ver platillos
router.get("/", authMiddleware, checkRole("admin", "mesero"), listarPlatillos);
router.get("/:id", authMiddleware, checkRole("admin", "mesero"), obtenerPlatillo);

// 🔹 Solo admin puede hacer CRUD completo
router.post("/", authMiddleware, checkRole("admin"), validate(createPlatilloSchema), crearPlatillo);
router.put("/:id", authMiddleware, checkRole("admin"), validate(updatePlatilloSchema), actualizarPlatillo);
router.delete("/:id", authMiddleware, checkRole("admin"), eliminarPlatillo);

export default router;
