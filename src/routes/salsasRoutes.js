import { Router } from 'express';
import { getSalsas, toggleSalsa } from '../controllers/salsasController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getSalsas);
router.put('/:id/toggle', authMiddleware, toggleSalsa);

export default router;
