import { Router } from 'express';
import { authMiddleware, checkRole } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validatorMiddleware.js';
import { listarUsuarios, obtenerUsuario, actualizarUsuario, eliminarUsuario } from '../controllers/usuarioController.js';
import { updateUserSchema } from '../validators/usuarioValidator.js';

const router = Router();

// Todas las rutas en este archivo requieren autenticación y rol de admin
router.use(authMiddleware, checkRole('admin'));

// Rutas CRUD para usuarios
router.get('/', listarUsuarios);
router.get('/:id', obtenerUsuario);
router.put('/:id', validate(updateUserSchema), actualizarUsuario);
router.delete('/:id', eliminarUsuario);

export default router;