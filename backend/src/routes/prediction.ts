import { Router } from 'express';
import { getPredictions } from '../controllers/predictionController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getPredictions);

export default router;
