import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../prismaClient';

export const sellTablets = async (req: AuthRequest, res: Response) => {
  try {
    const { batchNo, quantitySold } = req.body;
    const pharmacistId = req.pharmacistId!;
    const qty = Number(quantitySold);

    const medicine = await prisma.medicine.findFirst({
      where: { batchNo, pharmacistId }
    });

    if (!medicine) {
      return res.status(404).json({ error: 'Medicine not found' });
    }

    if (medicine.quantityAvailable < qty) {
      return res.status(400).json({ error: 'Insufficient stock available' });
    }

    // Transact the sale and stock deduct
    const [updatedMedicine, saleRecord] = await prisma.$transaction([
      prisma.medicine.update({
        where: { id: medicine.id },
        data: { quantityAvailable: medicine.quantityAvailable - qty }
      }),
      prisma.sale.create({
        data: {
          medicineId: medicine.id,
          pharmacistId,
          quantitySold: qty
        }
      })
    ]);

    // Check if reorder required (low stock threshold can be grabbed from env)
    const threshold = Number(process.env.LOW_STOCK_THRESHOLD || 20);
    const lowStockAlert = updatedMedicine.quantityAvailable < threshold;

    res.json({
      message: 'Sale recorded successfully',
      updatedMedicine,
      saleRecord,
      lowStockAlert
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
