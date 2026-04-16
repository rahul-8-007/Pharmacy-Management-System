import { Router } from 'express';
import { addStock, getStockHistory } from '../controllers/stockController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/add', addStock);
router.get('/history', getStockHistory);

export default router;
