import { Router } from 'express';
import { getInventory, getByBatchNo } from '../controllers/medicineController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getInventory);
router.get('/batch/:batchNo', getByBatchNo);

export default router;
