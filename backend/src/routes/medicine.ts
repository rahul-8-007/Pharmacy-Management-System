import { Router } from 'express';
import { getInventory, getByBatchNo, getWastage } from '../controllers/medicineController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);
router.get('/scan/:code', async (req, res) => {
  const code = req.params.code;

  try {
    const medicine = await prisma.medicine.findFirst({
      where: {
        OR: [
          { barcode: code },
          { batchNo: code }
        ]
      }
    });

    if (medicine) {
      return res.json(medicine);
    }

    // fallback
    return res.json({
      batchNo: code,
      name: "",
      dosage: "",
      manufacturer: "",
      expiryDate: ""
    });

  } catch (error) {
    res.status(500).json({ error: "Scan failed" });
  }
});
router.get('/', getInventory);
router.get('/wastage', getWastage);
router.get('/batch/:batchNo', getByBatchNo);

export default router;
