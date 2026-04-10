import { Router } from 'express';
import { sellTablets } from '../controllers/saleController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/sell', sellTablets);

export default router;
