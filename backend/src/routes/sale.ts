import { Router } from 'express';
import { sellTablets, getSalesHistory } from '../controllers/saleController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/sell', sellTablets);
router.get('/history', getSalesHistory);

export default router;
