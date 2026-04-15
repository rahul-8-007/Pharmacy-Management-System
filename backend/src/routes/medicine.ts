import { Router } from 'express';
import { getInventory, getByBatchNo, getWastage } from '../controllers/medicineController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', getInventory);
router.get('/wastage', getWastage);
router.get('/batch/:batchNo', getByBatchNo);

export default router;
