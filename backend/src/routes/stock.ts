import { Router } from 'express';
import { addStock } from '../controllers/stockController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/add', addStock);

export default router;
