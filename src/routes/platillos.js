import { Router } from "express";
import {
    listarPlatillos,
    obtenerPlatillo,
    crearPlatillo,
    actualizarPlatillo,
    eliminarPlatillo
} from "../controllers/platillosController.js";
import { authMiddleware, checkRole } from "../middlewares/authMiddleware.js";
import { validate } from '../middlewares/validatorMiddleware.js';
import { createPlatilloSchema, updatePlatilloSchema } from "../validators/platilloValidator.js";
import upload from '../middlewares/uploadMiddleware.js'; // Importar Multer

const router = Router();

// Rutas públicas o protegidas según necesites. Aquí protejo todas.
router.use(authMiddleware);

router.get('/', checkRole('admin', 'mesero', 'cocina'), listarPlatillos);
router.get('/:id', checkRole('admin', 'mesero', 'cocina'), obtenerPlatillo);

// Solo admin puede crear/editar/eliminar
// Usar upload.single('imagen') para procesar el archivo antes de la validación
router.post('/', checkRole('admin'), upload.single('imagen'), validate(createPlatilloSchema), crearPlatillo);
router.put('/:id', checkRole('admin'), upload.single('imagen'), validate(updatePlatilloSchema), actualizarPlatillo);
router.delete('/:id', checkRole('admin'), eliminarPlatillo);

export default router;
