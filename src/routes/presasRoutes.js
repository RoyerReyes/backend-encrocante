import { Router } from 'express';
import { getPresas, togglePresa, addPresa, updatePresa, deletePresa } from '../controllers/presasController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware, getPresas);
router.post('/', authMiddleware, addPresa);
router.put('/:id', authMiddleware, updatePresa);
router.put('/:id/toggle', authMiddleware, togglePresa);
router.delete('/:id', authMiddleware, deletePresa);

export default router;
