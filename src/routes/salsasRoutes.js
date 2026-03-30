import { Router } from 'express';
import { getSalsas, toggleSalsa, addSalsa, updateSalsa, deleteSalsa } from '../controllers/salsasController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getSalsas);
router.post('/', authMiddleware, addSalsa);
router.put('/:id', authMiddleware, updateSalsa);
router.put('/:id/toggle', authMiddleware, toggleSalsa);
router.delete('/:id', authMiddleware, deleteSalsa);

export default router;
