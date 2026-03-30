import { Router } from 'express';
import { getSalsas, toggleSalsa } from '../controllers/salsasController.js';
import { verificarToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', verificarToken, getSalsas);
router.put('/:id/toggle', verificarToken, toggleSalsa);

export default router;
